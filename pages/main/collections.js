import React, { useState, useEffect } from 'react';
import { Layout, Text, MenuItem, OverflowMenu, Card, Modal, Input, Button } from '@ui-kitten/components';
import { BackHandler, StyleSheet, View, FlatList, TouchableOpacity, Image, Dimensions, TouchableWithoutFeedback } from 'react-native';
import { labels, colors, spacing, rounding } from '../../style/base';
import { alertsImages, alertsImagesDarkColors } from '../../assets/alerts/alertsImages';
import { Icon } from 'react-native-elements'
import Plant from './plant';
import AsyncStorage from '@react-native-async-storage/async-storage';
import * as API from '../../api/apiMethods';

const getImageUrl = (id) => {
    return 'https://drive.google.com/uc?id=' + id;
};

const CollectionPlant = ({ plantData, onAddPlant }) => (
    plantData._id === 'New' ?
        <TouchableOpacity style={styles.collectionNewPlant} onPress={() => onAddPlant(plantData.collection_id, plantData.collection_name)}>
        <Icon type='material' name={'add-circle-outline'} size={40} color={colors.grayMedium} />
    </TouchableOpacity> :
    <TouchableOpacity style={styles.collectionPlant} activeOpacity={.6}>
        <Image source={{uri: getImageUrl(plantData.image)}} style={styles.collectionPlantImage}/>
        <Text style={styles.collectionPlantName}>{plantData.name}</Text>
    </TouchableOpacity>
);

const renderCollectionItem = ({ item, onAddPlant }) => (
    <CollectionPlant plantData={item} onAddPlant={onAddPlant}/>
);

const Collection = ({ name, plants, collection_id, onAddPlant, onCollection, plantNumber }) => (
    <View style={styles.collectionContainer}>
        <TouchableOpacity onPress={() => onCollection(collection_id, name, plantNumber)}>
            <Text
                style={{
                    ...labels.qsp,
                    alignSelf: 'flex-end',
                    backgroundColor: colors.grayBackgroundDark,
                    paddingHorizontal: spacing.md,
                    paddingVertical: 3,
                    borderRadius: rounding.lg
                }}
            >{name}
            </Text>
        </TouchableOpacity>
        <View style={styles.trapezoid}></View>
        <FlatList
            data={[...plants, {_id: 'New', collection_id: collection_id, collection_name: name}]}
            renderItem={({item}) => renderCollectionItem({onAddPlant: onAddPlant, item: item})}
            keyExtractor={item => item._id}
            showsHorizontalScrollIndicator={false}
            horizontal={true}
        />
    </View>
)

const AddButton = ({ name, marginLeft, marginRight, onPress }) => (
    <TouchableOpacity onPress={onPress} style={[styles.addButton, {marginLeft: marginLeft, marginRight: marginRight}]}>
        <Icon type='material' name={name} size={26} color={colors.greenLight} />
    </TouchableOpacity>
);

const CollectionModal = ({ collectionName, collectionId, collectionPlantCount }) => {
    const [name, setName] = useState(collectionName);
    const [id, setId] = useState(collectionId);

    const [alertVisible, setAlertVisible] = useState(false);

    const save = () => {
        id ? updateCollection() : addCollection();
    }

    const remove = () => {
        if (id) removeCollection();
    }

    async function addCollection() {
        try {
            await API.addCollection({name: name}, {
                headers: {
                'auth-token': await AsyncStorage.getItem('auth-token'),
                'user_id': await AsyncStorage.getItem('user_id')
            }})
        } catch (error) {
            console.log(error);
        }
    }

    async function removeCollection() {
        try {
            await API.removeCollection(id, {
                headers: {
                    'auth-token': await AsyncStorage.getItem('auth-token'), 
                }
            })
        } catch (error) {
            console.log(error);
        }
    }

    async function updateCollection() {

    }
    return (
        <View style={styles.modal}>
            <Input value={name} placeholder='Nazwa pomieszczenia' style={{ margin: spacing.sm, marginBottom: 0 }} onChangeText={(text) => setName(text)} />
            <View style={{flexDirection: 'row', justifyContent: 'space-between'}}>
                <Button status={'danger'} style={{ marginTop: spacing.md, width: '49.5%' }} onPress={() => remove()}>USUŃ</Button>
                <Button style={{ marginTop: spacing.md, width: '49.5%' }} onPress={() => save()}>ZAPISZ</Button>
            </View>
        </View>
    );
}

const Collections = ({navigation}) => {
    const [selectedPlant, setSelectedPlant] = useState(undefined);
    const [collectionId, setCollectionId] = useState(undefined);
    const [collectionName, setCollectionName] = useState(undefined);
    const [collectionPlantCount, setCollectionPlantCount] = useState(undefined);
    const [plantVisible, setPlantVisible] = useState(false);
    const [modalVisible, setModalVisible] = useState(false);
    const [moveOptionVisible, setMoveOptionVisible] = useState(true);

    const [collections, setCollections] = useState([]);

    useEffect(() => {
        const unsubscribe = navigation.addListener('focus', () => {
            getCollections();
        });

        // Return the function to unsubscribe from the event so it gets removed on unmount
        return unsubscribe;
    }, [navigation]);

    const onPlantSelect = (e) => {
        setSelectedPlant(e);
        setPlantVisible(!plantVisible);
    };

    const setModal = () => {
        setModalVisible(!modalVisible);
    };

    const onAddPlant = (id, name) => {
        navigation.navigate('Search', {
            collection_id: id,
            collection_name: name
        })
    }

    const onCollection = (id, name, number) => {
        setCollectionId(id);
        setCollectionName(name);
        setCollectionPlantCount(number);
        setModalVisible(true);
    }

    const renderItem = ({ item }) => (
        <Collection plantNumber={item.plantsCount} name={item.name} plants={item.plants} collection_id={item._id} onCollection={onCollection} onAddPlant={onAddPlant}/>
    );

    async function getCollections() {
        try {
            const response = await API.getUserCollections({
                headers: {
                    'auth-token': await AsyncStorage.getItem('auth-token'),
                    'user_id': await AsyncStorage.getItem('user_id')
                }
            });
            
            if (response.status === 200) {
                if (response.data === []) {
                    setResponseData([]);
                } else {
                    console.log(response.data);
                    setCollections(response.data);
                }
            }
        } catch (error) {
            if (error.response.status === 400) {
                console.log(error.response.status);
            }
        }
    }

    return (
        <TouchableWithoutFeedback>
            {
            plantVisible ?
            <Plant plantId={selectedPlant} onClose={onPlantSelect} /> :
            <Layout style={styles.layout}>
                <Modal
                    visible={modalVisible}
                    // backdropStyle={styles.backdrop}
                    onBackdropPress={() => { setCollectionPlantCount(undefined); setCollectionName(''); setCollectionId(undefined); setModal(false)}}>
                    <CollectionModal collectionName={collectionName} collectionId={collectionId} collectionPlantCount={collectionPlantCount}/>
                </Modal>        
                <View style={styles.header}>
                    <Text style={styles.title}>Moje rośliny</Text>
                    <AddButton onPress={setModal} name={'add-circle'} />
                </View>
                <FlatList
                    data={collections}
                    renderItem={renderItem}
                    keyExtractor={item => item._id}
                    showsVerticalScrollIndicator={false}
                />
            </Layout>
            }
        </TouchableWithoutFeedback>
    );
}

const styles = StyleSheet.create({
    layout: {
        flex: 1,
        backgroundColor: '#F8F8F8',
        borderTopWidth: 1,
        borderTopColor: '#DCDCDC',
        paddingHorizontal: spacing.md,
        paddingTop: spacing.sm
    },
    header: {
        marginBottom: spacing.sm,
        flexDirection: 'row',
        justifyContent: 'space-between'
    },
    title: {
        ...labels.qmd,
        color: colors.greenDark,
    },
    addButton: {
        width: 26,
        height: 26,
        alignSelf: 'center',
    },
    collectionContainer: {
        marginBottom: spacing.md,
    },
    collectionPlant: {
        width: 100, 
        height: 120, 
        backgroundColor: colors.grayBackgroundDark,
        borderColor: colors.grayMedium,
        borderWidth: 3,
        marginTop: spacing.sm,
        marginBottom: spacing.md,
        borderRadius: rounding.xs,
        marginHorizontal: spacing.sm,
    },
    collectionNewPlant: {
        width: 100,
        height: 120,
        marginTop: spacing.sm,
        marginBottom: spacing.md,
        marginHorizontal: spacing.sm,
        justifyContent: 'center',
    },
    collectionPlantImage: {
        flex: 1,
        borderTopLeftRadius: rounding.xs,
        borderTopRightRadius: rounding.xs,
        backgroundColor: colors.grayBackgroundLight
    },
    collectionPlantName: {
        ...labels.qxs,
        alignSelf: 'center',
    },
    trapezoid: {
        alignSelf: 'center',
        bottom: 0,
        position: 'absolute',
        width: Dimensions.get('window').width - 40,
        height: 0,
        borderBottomWidth: 40,
        // borderBottomColor: colors.grayBackgroundLight,
        borderBottomColor: '#567057',
        borderLeftWidth: 50,
        borderLeftColor: 'transparent',
        borderRightWidth: 50,
        borderRightColor: 'transparent',
        borderStyle: 'solid',
    },
    modal: {
        width: Dimensions.get('screen').width * 0.8,
        backgroundColor: colors.appLightBackground,
        padding: spacing.sm,
        borderRadius: rounding.xs,
        elevation: 20,
    },
});

export default Collections;