import React, { useState, useEffect } from 'react';
import { Layout, Text, MenuItem, OverflowMenu, Card, Modal, Input, Button } from '@ui-kitten/components';
import { BackHandler, StyleSheet, View, FlatList, TouchableOpacity, Image, Dimensions, TouchableWithoutFeedback } from 'react-native';
import { labels, colors, spacing, rounding } from '../../style/base';
import { alertsImages, alertsImagesDarkColors } from '../../assets/alerts/alertsImages';
import { Icon } from 'react-native-elements'
import Plant from './plant';
import AsyncStorage from '@react-native-async-storage/async-storage';
import * as API from '../../api/apiMethods';
import { LoadingScreen } from './board';

const getImageUrl = (id) => {
    return 'https://drive.google.com/uc?id=' + id;
};

const PlantCard = ({plantData, insertPlantAbove, insertPlantBelow, onPlantSelect}) => {
    const [moveEnabled, setMoveEnabled] = useState(false);

    const onMovePress = () => {
        setMoveEnabled(!moveEnabled);
    }

    return (
        <TouchableOpacity style={styles.collectionPlant} activeOpacity={.6} onLongPress={onMovePress} onPress={() => onPlantSelect(plantData._id)}>
            <Image source={{ uri: getImageUrl(plantData.image) }} style={styles.collectionPlantImage} />
            <Text numberOfLines={1} ellipsizeMode='tail' style={styles.collectionPlantName}>{plantData.name}</Text>
            {moveEnabled ? 
                <View style={{ position: 'absolute', width: '100%', height: '100%' }}>
                    <TouchableOpacity 
                        style={{ 
                            borderBottomColor: colors.appLightBackground, 
                            bordeBottomrWidth: 1, 
                            justifyContent: 'center', 
                            width: '100%', 
                            height: '50%', 
                            backgroundColor: 'rgba(248, 248, 248, 0.5)' 
                        }}
                        onLongPress={onMovePress}
                        onPress={() => insertPlantAbove(plantData._id)}
                    >
                        <Icon type='material' name='arrow-drop-up' size={60} color={'white'} />
                    </TouchableOpacity>
                    <TouchableOpacity 
                        style={{ 
                            borderTopColor: colors.appLightBackground, 
                            borderTopWidth: 1, 
                            justifyContent: 'center', 
                            width: '100%', 
                            height: '50%', 
                            backgroundColor: 'rgba(248, 248, 248, 0.5)' 
                        }}
                        onLongPress={onMovePress}
                        onPress={() => insertPlantBelow(plantData._id)}
                    >
                        <Icon type='material' name='arrow-drop-down' size={60} color={'white'} />
                    </TouchableOpacity>
                </View>
            :    
                <></>
            }
        </TouchableOpacity>
    );
}

const CollectionPlant = ({ plantData, onAddPlant, insertPlantAbove, insertPlantBelow, onPlantSelect }) => (
    plantData._id === 'New' ?
        <TouchableOpacity style={styles.collectionNewPlant} onPress={() => onAddPlant(plantData.collection_id, plantData.collection_name)}>
        <Icon type='material' name={'add-circle-outline'} size={40} color={colors.grayMedium} />
    </TouchableOpacity> :
    <PlantCard plantData={plantData} insertPlantAbove={insertPlantAbove} insertPlantBelow={insertPlantBelow} onPlantSelect={onPlantSelect}/>
);

const renderCollectionItem = ({ item, onAddPlant, insertPlantAbove, insertPlantBelow, onPlantSelect }) => (
    <CollectionPlant plantData={item} onAddPlant={onAddPlant} insertPlantAbove={insertPlantAbove} insertPlantBelow={insertPlantBelow} onPlantSelect={onPlantSelect}/>
);

const Collection = ({ name, plants, collection_id, onAddPlant, onCollection, plantNumber, insertPlantAbove, insertPlantBelow, onPlantSelect }) => (
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
            renderItem={
                ({item}) => 
                renderCollectionItem({
                    onAddPlant: onAddPlant, 
                    item: item, 
                    insertPlantAbove: (data) => insertPlantAbove(collection_id, data),
                    insertPlantBelow: (data) => insertPlantBelow(collection_id, data),
                    onPlantSelect: onPlantSelect
                })}
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

const CollectionModal = ({ collectionName, collectionId, collectionPlantCount, onClose, onSubmit }) => {
    const [name, setName] = useState(collectionName);
    const [id, setId] = useState(collectionId);

    const save = () => {
        id ? updateCollection() : addCollection();
        onClose();  
    }

    const remove = () => {
        if (id) removeCollection();
        onClose();
    }

    async function addCollection() {
        try {
            await API.addCollection({name: name}, {
                headers: {
                'auth-token': await AsyncStorage.getItem('auth-token'),
                'user_id': await AsyncStorage.getItem('user_id')
            }});
            onSubmit();
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
            });
            onSubmit();
        } catch (error) {
            console.log(error);
        }
    }

    async function updateCollection() {
        try {
            await API.updateCollection(id, {name: name},{
                headers: {
                    'auth-token': await AsyncStorage.getItem('auth-token'),
                }
            });
            onSubmit();
        } catch (error) {
            console.log(error);
        }
    }

    return (
        <View style={styles.modal}>
            <Input value={name} placeholder='Nazwa pomieszczenia' style={{ margin: spacing.sm, marginBottom: 0 }} onChangeText={(text) => setName(text)} />
            <Button disabled={!name} style={{ marginTop: spacing.md }} onPress={() => save()}>ZAPISZ</Button>
            <Button disabled={!id} status={'danger'} style={{ marginTop: spacing.sm }} onPress={() => remove()}>USUŃ wraz z {collectionPlantCount} szt. roślin</Button>
        </View>
    );
}

const Collections = ({navigation}) => {
    const [isLoading, setIsLoading] = useState(false);
    const [selectedPlant, setSelectedPlant] = useState(undefined);
    const [collectionId, setCollectionId] = useState(undefined);
    const [collectionName, setCollectionName] = useState(undefined);
    const [collectionPlantCount, setCollectionPlantCount] = useState(undefined);
    const [plantVisible, setPlantVisible] = useState(false);
    const [modalVisible, setModalVisible] = useState(false);

    const [collections, setCollections] = useState([]);

    useEffect(() => {
        setIsLoading(true);
        const unsubscribe = navigation.addListener('focus', () => {
            getCollections();
        });

        // Return the function to unsubscribe from the event so it gets removed on unmount
        return unsubscribe;
    }, [navigation]);

    const onPlantSelect = (e) => {
        setSelectedPlant(e);
        setPlantVisible(!plantVisible);
        if (!e) {
            getCollections();
        }
    };

    const setModal = () => {
        setCollectionPlantCount(undefined); 
        setCollectionName(''); 
        setCollectionId(undefined);
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
        <Collection 
            plantNumber={item.plantsCount} 
            name={item.name} 
            plants={item.plants} 
            collection_id={item._id} 
            onCollection={onCollection} 
            onAddPlant={onAddPlant}
            onPlantSelect={onPlantSelect}
            insertPlantAbove={insertPlantAbove}
            insertPlantBelow={insertPlantBelow}
        />
    );

    const insertPlantAbove = (collectionId, plantId) => {
        const currentRow = collections.findIndex(collection => collection._id === collectionId);
        if (currentRow !== 0) {
            const aboveCollectionId = collections[currentRow - 1]._id;
            addPlantToCollection(aboveCollectionId, plantId);
            removePlantFromCollection(collectionId, plantId);
        }
    }

    const insertPlantBelow = (collectionId, plantId) => {
        const currentRow = collections.findIndex(collection => collection._id === collectionId);
        if (currentRow !== collections.length - 1) {
            const belowCollectionId = collections[currentRow + 1]._id;
            addPlantToCollection(belowCollectionId, plantId);
            removePlantFromCollection(collectionId, plantId);
        }
    }

    async function addPlantToCollection(collectionId, plantId) {
        try {
            const response2 = await API.addPlantToCollection(collectionId,
                { plant_id: plantId },
                {
                    headers: {
                        'auth-token': await AsyncStorage.getItem('auth-token')
                    }
                }
            );
            if (response2.status === 200) {
                
            }
            getCollections();
        } catch (error) {
            if (error.response.status === 400) {
                console.log(error.response.status);
            }
        }
    }

    async function removePlantFromCollection(collectionId, plantId) {
        try {
            const response2 = await API.removePlantFromCollection(collectionId,
                { plant_id: plantId },
                {
                    headers: {
                        'auth-token': await AsyncStorage.getItem('auth-token')
                    }
                }
            );
            if (response2.status === 200) {

            }
            getCollections();
        } catch (error) {
            if (error.response.status === 400) {
                console.log(error.response.status);
            }
        }
    }

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
                    setCollections(response.data);
                }
                setIsLoading(false);
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
            <Plant plantId={selectedPlant} onClose={onPlantSelect} status={'own'}/> :
            <Layout style={styles.layout}>
                <Modal
                    visible={modalVisible}
                    // backdropStyle={styles.backdrop}
                    onBackdropPress={() => { setModal(false)}}>
                    <CollectionModal onSubmit={getCollections} onClose={setModal} collectionName={collectionName} collectionId={collectionId} collectionPlantCount={collectionPlantCount}/>
                </Modal>        
                <View style={styles.header}>
                    <Text style={styles.title}>Moje rośliny</Text>
                    <AddButton onPress={setModal} name={'add-circle'} />
                </View>
                {isLoading ? <LoadingScreen/> : 
                <FlatList
                    data={collections}
                    renderItem={renderItem}
                    keyExtractor={item => item._id}
                    showsVerticalScrollIndicator={false}
                    ListEmptyComponent={
                        <View style={{ justifyContent: 'center', flex: 1, alignItems: 'center' }}>
                            <Text style={{ ...labels.qsp, fontWeight: 'bold' }}>Nie posiadasz żadnej kolekcji roślin</Text>
                            <Text style={{ ...labels.qsp }}>Utwórz kolekcję za pomocą </Text>
                            <Icon type='material' name={'add-circle'} size={20} color={colors.greenLight} style={{marginTop: 10}}/>
                        </View>}
                    contentContainerStyle={{ flexGrow: 1 }}
                />
                }
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