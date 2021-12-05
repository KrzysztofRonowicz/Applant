import React, { useState, useEffect } from 'react';
import { Layout, Text, MenuItem, OverflowMenu, Card, Modal, } from '@ui-kitten/components';
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

const CollectionPlant = ({ plantData }) => (
    // plant.name === 'New' ?
    // <TouchableOpacity style={styles.collectionNewPlant}>
    //     <Icon type='material' name={'add-circle-outline'} size={40} color={colors.grayMedium} />
    // </TouchableOpacity> :
    <TouchableOpacity style={styles.collectionPlant} activeOpacity={.6}>
        <Image source={{uri: getImageUrl(plantData.image)}} style={styles.collectionPlantImage}/>
        <Text style={styles.collectionPlantName}>{plantData.name}</Text>
    </TouchableOpacity>
);

const renderCollectionItem = ({ item }) => (
    <CollectionPlant plantData={item} />
);

const Collection = ({ name, plants }) => (
    <View style={styles.collectionContainer}>
        <View style={styles.trapezoid}></View>
        <FlatList
            data={plants}
            renderItem={renderCollectionItem}
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

const Collections = () => {
    const [selectedPlant, setSelectedPlant] = useState(undefined);
    const [plantVisible, setPlantVisible] = useState(false);
    const [addRoom, setAddRoom] = useState(false);
    const [moveOptionVisible, setMoveOptionVisible] = useState(true);

    const [collections, setCollections] = useState([]);

    useEffect(() => {
        getCollections();
    }, []);

    const onPlantSelect = (e) => {
        setSelectedPlant(e);
        setPlantVisible(!plantVisible);
    };

    const onAddRoom = () => {
        setAddRoom(!addRoom);
    };

    // const onPlantSelectLong = (index) => {
    //     setMoveOptionVisible(!moveOptionVisible);
    //     index === selectedPlant ? setSelectedPlant(undefined) : setSelectedPlant(index);
    // };

    const renderItem = ({ item }) => (
        <Collection name={item.name} plants={item.plants}/>
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
                    console.log(response.data)
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
                    visible={addRoom}
                    // backdropStyle={styles.backdrop}
                    onBackdropPress={() => setAddRoom(false)}>
                    <Card disabled={true}>
                        <Text>Welcome to UI Kitten 😻</Text>
                        <TouchableOpacity onPress={() => setAddRoom(false)}>
                            <Text>DIMMIS</Text>
                        </TouchableOpacity>
                    </Card>
                </Modal>        
                <View style={styles.header}>
                    <Text style={styles.title}>Moje rośliny</Text>
                    <AddButton onPress={onAddRoom} name={'add-circle'} />
                </View>
                <FlatList
                    data={collections}
                    renderItem={renderItem}
                    keyExtractor={item => item._id}
                    showsVerticalScrollIndicator={false}
                />
                {moveOptionVisible === true ? 
                    <View style={styles.moveButtons}>
                        <TouchableOpacity style={styles.moveButton}>
                            <Icon type='material' name={'arrow-left'} size={50} color={colors.greenMedium} />
                        </TouchableOpacity>
                        <TouchableOpacity style={styles.moveButton}>
                            <Icon type='material' name={'arrow-right'} size={50} color={colors.greenMedium} />
                        </TouchableOpacity>
                        {/* <TouchableOpacity style={styles.moveButton}>
                            <Icon type='material' name={'delete-outline'} size={50} color={colors.greenMedium} />
                        </TouchableOpacity> */}
                    </View>
                    : <></>
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
        flexDirection: 'row',
    },
    collectionPlant: {
        width: 84, 
        height: 100, 
        backgroundColor: colors.grayBackgroundDark,
        borderColor: colors.grayMedium,
        borderWidth: 2,
        marginTop: spacing.sm,
        marginBottom: spacing.md,
        borderRadius: rounding.xs,
        marginHorizontal: spacing.sm,
    },
    collectionNewPlant: {
        width: 84,
        height: 100,
        marginTop: spacing.sm,
        marginBottom: spacing.md,
        marginHorizontal: spacing.sm,
        justifyContent: 'center',
    },
    collectionPlantImage: {
        width: 80,
        height: 80,
        backgroundColor: colors.grayBackgroundLight,
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
        borderBottomColor: colors.compostLight,
        borderLeftWidth: 50,
        borderLeftColor: 'transparent',
        borderRightWidth: 50,
        borderRightColor: 'transparent',
        borderStyle: 'solid',
    },
    moveButtons: {
        flexDirection: 'row',
    },
    moveButton: {
        borderTopColor: colors.greenMedium,
        borderTopWidth: 2,
        justifyContent: 'center',
        flex: 1,
        alignItems: 'center',
    },
});

export default Collections;