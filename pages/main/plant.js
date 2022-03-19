import React, { useState, useEffect } from 'react';
import { Layout, Text, Modal, Input, Button, Spinner } from '@ui-kitten/components';
import { StyleSheet, View, FlatList, TouchableOpacity, Image, Dimensions, ScrollView } from 'react-native';
import { labels, colors, spacing, rounding } from '../../style/base';
import { alertsImages } from '../../assets/alerts/alertsImages';
import { Icon } from 'react-native-elements'
import { About, Care, Climate } from './plantDetails';
import AsyncStorage from '@react-native-async-storage/async-storage'
import * as API from '../../api/apiMethods';
import Toast from 'react-native-toast-message';
import Conversation from './conversation';
import { LoadingScreen } from './board';


const PlantParameter = ({lightColor, darkColor, icon, index}) => {
    return(
        <View style={[styles.plantParameter, {borderColor: darkColor, backgroundColor: lightColor}]}>
            <TouchableOpacity style={{flexDirection: 'row'}}>
                <Image style={styles.plantParameterImage} source={alertsImages(icon)} />
                <Text style={styles.level}>{index}</Text>
            </TouchableOpacity>
        </View>
    );
}

const DATA = [
    {
        id: 0,
        category: 'O roślinie'
    },
    {
        id: 1,
        category: 'Pielęgnacja'
    },
    {
        id: 2,
        category: 'Klimat'
    },
];

const SwitchCategory = ({ onTouchCategory, id, data, status, plantId, fullAccess}) => {
    switch (id) {
        case 0:
            return (<About status={status} data={data} onTouchCategory={onTouchCategory} plantId={plantId} fullAccess={fullAccess}/>);
        case 1:
            return (<Care status={status} careData={data.care} onTouchCategory={onTouchCategory} plantId={plantId} fullAccess={fullAccess}/>);
        case 2:
            return (<Climate status={status} climateData={data.climate} onTouchCategory={onTouchCategory} plantId={plantId} fullAccess={fullAccess}/>);
    }
}

export const AdToCollectionModal = ({onClose, collections, createPlant}) => {

    async function addPlantToCollection(collectionId) {
        try {
            let plantId;
            plantId = await createPlant();
            console.log(plantId + ' ss' + collectionId);
            const response = await API.addPlantToCollection(collectionId,
                { plant_id: plantId },
                {
                    headers: {
                        'auth-token': await AsyncStorage.getItem('auth-token')
                    }
                }
            );
            console.log(response.data);
            if (response.status === 200) {
                onClose();
            }
        } catch (error) {
            if (error.response.status === 400) {
                console.log(error.response.status);
            }
        }
    }

    const renderCollectionItem = ({ item }) => (
        <TouchableOpacity style={styles.collectionButton} onPress={() => addPlantToCollection(item._id)}>
            <Text style={styles.collectionText}>{item.name}</Text>
        </TouchableOpacity>
    );

    return (
        <View style={[styles.modal, { maxHeight: Dimensions.get('screen').width * 0.8}]}>
            <Text style={{...labels.qsp, fontWeight: 'bold'}}>Dodaj do</Text>
            <FlatList
                data={collections}
                renderItem={renderCollectionItem}
                keyExtractor={item => item._id}
                showsVerticalScrollIndicator={false}
            />
        </View>
    );
}

const SellModal = ({plant_id, image, visible, changeFetching}) => {
    const [name, setName] = useState('');
    const [prize,setPrize] = useState(undefined);

    const onPrizeChange = (text) => {
        if (text !== '' || text !== '0' && text !== '00' && text !== '000') {
            setPrize(text.replace(/[^0-9]/g, ''));
        } else {
            setPrize(undefined);
        }
    }

    async function addAd() {
        changeFetching(true);
        try {
            await API.addAd({
                plant_id: plant_id,
                prize: prize,
                name: name,
                image: image
            },{
                headers: {
                    'auth-token': await AsyncStorage.getItem('auth-token')
                }
            })
        } catch (error) {
            if (error.response.status === 400) {
                console.log(error.response.status);
            }
        }
        visible();
        changeFetching(false);
    }
    return (
        <View style={styles.modal}>
            <Input value={name} placeholder='Nazwa ogłoszenia' style={{margin: spacing.sm, marginBottom: 0}} onChangeText={(text) => setName(text)}/>
            <Input value={prize} placeholder='Cena (PLN)' style={{ margin: spacing.sm }} maxLength={3} keyboardType='numeric' onChangeText={(text) => onPrizeChange(text)}/>
            <Button style={{marginTop: spacing.sm}} disabled={!prize || !name} onPress={() => addAd()}>DODAJ OGŁOSZENIE</Button>
        </View>
    );
}

const RemoveModal = ({ onSubmit }) => {
    return (
        <View style={styles.modal}>
            <Text style={{...labels.qsp, margin: spacing.sm, textAlign: 'center', marginBottom: spacing.md}}>Czy chcesz bezpowrotnie usunąć tę roślinę?</Text>
            <Button status={'warning'} onPress={() => onSubmit()}>Usuń</Button>
        </View>
    );
}

export const LoadingBlur = ({isFetching}) => {
    return (
        isFetching ? 
        <View style={{ position: 'absolute', width: '100%', height: '100%', backgroundColor : 'rgba(255,255,255,0.3)', justifyContent: 'center', alignItems: 'center'}}>
            <Spinner size={'giant'}/>
        </View> : <></>
    );
}

const Plant = ({plantId, onClose, status, adId, ad, roomName, roomId, label}) => {
    const [isLoading, setIsLoading] = useState(false);
    const [isFetchingData, setIsFetchingData] = useState(false);
    const [statusPlant, setStatusPlant] = useState(status);
    const [collectionName, setCollectionName] = useState(roomName);
    const [collectionId, setCollectionId] = useState(roomId);
    const [modalVisible, setModalVisible] = useState(false);
    const [collectionModalVisible, setCollectionModalVisible] = useState(false);
    const [modalContent, setModalContent] = useState(false);
    const [conversationVisible, setConversationVisible] = useState(false);
    const [fullAccess, setFullAccess] = useState(false);
    const [plantName, setPlantName] = useState('');
    const [imageUrl, setImageUrl] = useState('');
    const [indexes, setIndexes] = useState([]);

    const [collections, setCollections] = useState([]);

    const [categoryVisible, setCategoryVisible] = useState(false);
    const [categorySelected, setCategorySelected] = useState(undefined);

    const [responseData, setResponseData] = useState([]);

    const showToast = (props) => {
        Toast.show({
            type: 'success',
            text1: 'Dodano roślinę!',
            text2: 'Dodano '+ props.name + ' do Twojej kolekcji 👋'
        });
    }

    const showAddedAdToast = (props) => {
        Toast.show({
            type: 'info',
            text1: 'Wystawiono ogłoszenie!',
            text2: 'Roślina została dodana do twoich ogłoszeń!'
        });
    }

    const showRemovedAdToast = (props) => {
        Toast.show({
            type: 'info',
            text1: 'Usunięto ogłoszenie!',
            text2: 'Roślina została usunięta z listy ogłoszeń!'
        });
    }

    useEffect(() => {
        setIsLoading(true);
    },[]);

    useEffect(() => {
        if (!roomId && status === 'wiki') {
            getCollections();
        }
        getPlant();
    }, [modalVisible]);

    const onModalClose = () => {
        showToast({ name: responseData.species_name });
        setModalVisible(false);
        setCollectionModalVisible(false);
    }

    const onSellModalClose = () => {
        showAddedAdToast();
        setModalVisible(false);
        setCollectionModalVisible(false);
    }

    const onConversation = () => {
        setConversationVisible(!conversationVisible);
    }

    useEffect(() => {
        setPlantName(responseData.name);
        setImageUrl('https://drive.google.com/uc?id=' + responseData.image)
        setIndexes([responseData.water_index, responseData.light_index, responseData.compost_index]);
    }, [responseData]);

    const renderItem = ({ item }) => (
        <TouchableOpacity activeOpacity={1} style={styles.category} onPress={() => onTouchCategory(item.id)}>
            <Text style={styles.categoryText}>{item.category}</Text>
        </TouchableOpacity>
    );

    const onTouchCategory = (id) => {
        setCategorySelected(id);
        setCategoryVisible(!categoryVisible);
    }

    const onRemovePlantSubmit = () => {
        setModalVisible(false);
        removeUserPlant();
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
                if (response.data[0]) {
                    setCollections(response.data);
                } else {
                    try {
                        addCollection();
                    } catch (error) {
                        console.log(error);
                    }
                }
            }
        } catch (error) {
            if (error.response.status === 400) {
                console.log(error.response.status);
            }
        }
    }

    async function addCollection() {
        try {
            const response = await API.addCollection({ name: 'Nowe rośliny' }, {
                headers: {
                    'auth-token': await AsyncStorage.getItem('auth-token'),
                    'user_id': await AsyncStorage.getItem('user_id')
                }
            });
            if (response.status === 200) {
                let responseData = response.data;
                setCollections(data => [...data, responseData]);
            }
        } catch (error) {
            console.log(error);
        }
    }

    async function removeAd() {
        setIsFetchingData(true);
        try {
            const response = await API.removeAd(plantId, {
                headers: {
                    'auth-token': await AsyncStorage.getItem('auth-token')
                }
            });
            getPlant();
            if (response.status === 200) {
                try {
                    const response2 = await API.removeAllConversations(response.data.ad_id, {
                        headers: {
                            'auth-token': await AsyncStorage.getItem('auth-token')
                        }
                    });
                    getPlant();
                    setIsFetchingData(false);
                    showRemovedAdToast();
                } catch (error) {
                    if (error.response.status === 400) {
                        console.log(error.response2.data);
                    }
                }
            }
        } catch (error) {
            if (error.response.status === 400) {
                console.log(error.response.data);
            }
        }
    }

    async function removeUserPlant() {
        setIsFetchingData(true);
        try {
            console.log('remove ad start');
            removeAd();
            try {
                const response = await API.removeUserPlant(plantId, {
                    headers: {
                        'auth-token': await AsyncStorage.getItem('auth-token')
                    }
                });
            } catch (error) {
                if (error.response.status === 400) {
                    console.log(error.response.data);
                }
            }
            try {
                onClose(undefined);
            } catch (error) {
                console.log('on close error');
            }
        } catch (error) {
            if (error.response.status === 400) {
                console.log(error.response.data);
            }
        };
    }

    async function updatePlant() {
        let tmpResponseData = responseData;
        tmpResponseData.name = plantName;
        try {
            await API.updateUserPlant(plantId, tmpResponseData, {
                headers: {
                    'auth-token': await AsyncStorage.getItem('auth-token')
                }
            })
        } catch (error) {
            if (error.response.status === 400) {
                console.log(error.response.status);
            }
        }
    }

    async function getPlant() {
        try {
            let response;
            if (status === 'own' || status === 'ad') {
                response = await API.getUserPlant(plantId, {
                    headers: {
                        'auth-token': await AsyncStorage.getItem('auth-token'),
                        'user_id': await AsyncStorage.getItem('user_id')
                    }
                });
            } else if (status === 'wiki') {
                response = await API.getPlant(plantId, {
                    headers: {
                        'auth-token': await AsyncStorage.getItem('auth-token')
                    }
                });
            }
            if (response.status === 200) {
                setFullAccess(() => response.headers['scopes']);
                if (response.data === []) {
                    setResponseData([]);
                    setIsLoading(false);
                } else {
                    setResponseData(response.data);
                    setStatusPlant(response.data.status);
                    setIsLoading(false);
                }
                setIsLoading(false);
            }
        } catch (error) {
            if (error.response.status === 400) {
                console.log('get plant error');
            }
        }
        setIsLoading(false);
    };

    async function addPlantToUser() {
        setIsFetchingData(true);
        let tmpPlant = responseData;
        tmpPlant.user_id = await AsyncStorage.getItem('user_id');
        tmpPlant.status = 'own';
        let date = new Date();
        console.log(date);
        date.setDate(date.getDate());
        date.setHours(0,0,0,0);
        console.log(date);
        for (let index = 0; index < tmpPlant.care.length; index++) {
            tmpPlant.care[index].next_date = date;
        }
        delete tmpPlant._id;
        try {
            const response = await API.addPlantToUser(tmpPlant,{
                headers: {
                    'auth-token': await AsyncStorage.getItem('auth-token')
                }
            });
            if (response.status === 200) {
                if (!roomId) {
                    setIsFetchingData(false);
                    return response.data.userPlant;
                } else {
                    try {
                        const response2 = await API.addPlantToCollection(collectionId, 
                            { plant_id: response.data.userPlant },
                            {
                                headers: {
                                    'auth-token': await AsyncStorage.getItem('auth-token')
                                }  
                            }
                        );
                        if (response2.status === 200) {
                            showToast({ name: tmpPlant.species_name });
                            setIsFetchingData(false);
                        }
                    } catch (error) {
                        if (error.response.status === 400) {
                            console.log(error.response.status + '2');
                        }
                    }
                }
            }
        } catch (error) {
            if (error.response.status === 400) {
                console.log(error.response.statusText);
            }
        }
    }

    return (
        conversationVisible ? <Conversation ad_id={adId} ad={ad} owner_id={responseData.user_id} onMessageClose={onConversation}/> :
        <Layout style={styles.layout}>
            <Modal onBackdropPress={() => setModalVisible(false)} visible={modalVisible}>
                {modalContent == 'sell' ? <SellModal changeFetching={setIsFetchingData} plant_id={responseData._id} image={responseData.image} visible={onSellModalClose}/>:<RemoveModal onSubmit={onRemovePlantSubmit}/>}
            </Modal>
            <Modal onBackdropPress={() => setCollectionModalVisible(false)} visible={collectionModalVisible}>
                <AdToCollectionModal createPlant={addPlantToUser} collections={collections} onClose={onModalClose}/>
            </Modal>
            {isLoading ? <LoadingScreen/> :
            <ScrollView showsVerticalScrollIndicator={false}>
            <View style={styles.container}>
                <View style={styles.imageContainer}>
                    <Image style={{ flex: 1, marginHorizontal: spacing.xs, borderTopRightRadius: rounding.sm, borderTopLeftRadius: rounding.sm}} source={{ uri: imageUrl}}/>
                    <TouchableOpacity
                    activeOpacity={1}
                        style={{ position: 'absolute', right: 10, width: 30, height: 35, paddingTop: 4 }}
                            onPress={() => { updatePlant();onClose(undefined);}}
                    >
                        <View style={{ backgroundColor: colors.white, borderRadius: rounding.xxl, width: 30, height: 30, justifyContent: 'center', elevation: 5}}>
                            <Icon type='material' name='close' size={25} color={colors.grayDark} />
                        </View>
                    </TouchableOpacity>
                    {/* <TouchableOpacity
                        style={{ position: 'absolute', bottom: 5, right: 10, width: 30, height: 30 }}
                    >
                        <Icon type='material' name='photo' size={30} color={colors.grayDark} />
                    </TouchableOpacity> */}
                </View>
                <View style={styles.details}>
                    <Input
                        textStyle={{color: colors.greenDark, ...labels.qsm, fontWeight: 'bold'}}
                        style={styles.plantNameInput}
                        placeholder='Nazwa rośliny'
                        value={plantName}
                        onChangeText={nextValue => setPlantName(nextValue)}
                        autoCorrect={false}
                        disabled={statusPlant !== 'own' && fullAccess !== 'edit' || label}
                    />
                    <View style={{flexDirection: 'row', justifyContent: 'space-between'}}>
                        <Text style={{ ...labels.qsp, color: colors.grayDark }}>{responseData.species_name}</Text>
                    </View>
                    <View style={{flexDirection: 'row', marginVertical: spacing.md}}>
                        <PlantParameter index={indexes[0]} lightColor={colors.waterLight} darkColor={colors.waterDark} icon={'water'}/>
                        <PlantParameter index={indexes[1]} lightColor={colors.lightLight} darkColor={colors.lightDark} icon={'light'}/>
                        <PlantParameter index={indexes[2]} lightColor={colors.compostLight} darkColor={colors.compostDark} icon={'compost'}/>
                    </View>
                    {categoryVisible ? <SwitchCategory onTouchCategory={onTouchCategory} id={categorySelected} data={responseData} status={statusPlant} fullAccess={fullAccess} plantId={plantId}/> :
                        <View style={{justifyContent: 'space-between', flex: 1}}>
                            <View style={{height: 162}}>
                                <FlatList
                                    data={DATA}
                                    renderItem={renderItem}
                                    keyExtractor={item => item.id}
                                    showsVerticalScrollIndicator={false}
                                />
                            </View>
                            <View style={{flexDirection: 'row', justifyContent: 'space-between', height: 60}}>
                                {statusPlant === 'own' || fullAccess === 'edit' && !label ? 
                                    <TouchableOpacity style={styles.specialAction} onPress={() => { setModalContent('remove'); setModalVisible(true) }}>
                                        <Icon type='material' name='delete' size={28} color={colors.grayDark} />
                                        <Text style={styles.specialActionText}>Usuń</Text>
                                    </TouchableOpacity>
                                : <></>}
                                {statusPlant === 'own' && !label ?
                                    <TouchableOpacity style={styles.specialAction} onPress={() => {setModalContent('sell'); setModalVisible(true)}}>
                                        <Icon type='material' name='storefront' size={28} color={colors.grayDark} />
                                        <Text style={[styles.specialActionText, { marginLeft: spacing.xs }]}>Sprzedaj</Text>
                                    </TouchableOpacity>
                                : <></>}
                                {statusPlant === 'ad' && fullAccess === 'edit' && !label ?
                                    <TouchableOpacity style={styles.specialAction} onPress={removeAd}>
                                        <Icon type='material' name='close' size={28} color={colors.grayDark} />
                                        <Text style={[styles.specialActionText, { marginLeft: spacing.xs }]}>Usuń ogłoszenie</Text>
                                    </TouchableOpacity>
                                : <></>}
                                {statusPlant === 'ad' && fullAccess === 'view' && !label ?
                                    <TouchableOpacity style={styles.specialAction} onPress={() => onConversation()}>
                                        <Icon type='material' name='send' size={28} color={colors.grayDark} />
                                        <Text style={[styles.specialActionText, { marginLeft: spacing.xs }]}>Wiadomość</Text>
                                    </TouchableOpacity>
                                : <></>}
                                {statusPlant === 'wiki' && !label ?
                                                <TouchableOpacity style={styles.specialAction} onPress={() => roomId ? addPlantToUser() : setCollectionModalVisible(true)}>
                                        <Icon type='material' name='add-circle-outline' size={28} color={colors.greenMedium} />
                                            <Text style={[styles.specialActionText, { marginLeft: spacing.xs }]}>Dodaj{collectionName ? ' do ' + collectionName : ''}</Text>
                                    </TouchableOpacity>
                                : <></>}
                            </View>
                        </View>
                    }
                </View>
            </View>
            <LoadingBlur isFetching={isFetchingData} />
            </ScrollView>
            }
            <Toast />
        </Layout>
    );
}

const styles = StyleSheet.create({
    layout: {
        flex: 1,
        backgroundColor: colors.appLightBackground,
        borderTopWidth: 1,
        borderTopColor: '#DCDCDC',
    },
    container: {
        minHeight: Dimensions.get('window').height - 100,
        alignItems: 'center',
        paddingTop: spacing.xs,
        backgroundColor: colors.appLightBackground,
    },
    imageContainer: {
        width: '100%', 
        aspectRatio: 16 / 10, 
    },
    details: {
        alignSelf: 'stretch',
        flex: 1,
        backgroundColor: colors.grayBackgroundDark,
        paddingHorizontal: spacing.md,
        paddingTop: spacing.lg,
        marginHorizontal: spacing.xs,
        marginBottom: spacing.xs,
        borderBottomLeftRadius: rounding.md,
        borderBottomRightRadius: rounding.md,
    },
    plantNameInput: {
        position: 'absolute',
        left: 20,
        top: -20,
        height: 40,
        backgroundColor: colors.grayBackgroundLight,
        borderWidth: 3,
        borderColor: colors.grayMedium,
        borderRadius: rounding.xs,
        elevation: 2,
        minWidth: '40%',
    },
    plantParameter: {
        height: 30,
        marginRight: spacing.sm,
        borderWidth: 2,
        borderRadius: rounding.sm,
        justifyContent: 'center',
        paddingHorizontal: spacing.xs,
    },
    plantParameterImage: {
        width: 24,
        height: 24,
        marginRight: spacing.xs,
    },
    level: {
        ...labels.qsp,
        fontWeight: 'bold',
        marginRight: spacing.xs,
    },
    category: {
        height: 40,
        backgroundColor: colors.greenMedium,
        borderRadius: rounding.sm,
        paddingHorizontal: spacing.sm,
        paddingVertical: spacing.xs,
        marginBottom: 14,
        marginHorizontal: spacing.xs,
        justifyContent: 'center',
    },
    categoryText: {
        ...labels.qsp,
        color: colors.white,
        alignSelf: 'center'
    },
    specialAction: {
        backgroundColor: colors.grayBackgroundLight,
        paddingHorizontal: spacing.md,
        paddingVertical: spacing.xs,
        borderRadius: rounding.lg,
        marginVertical: spacing.sm,
        elevation: 3,
        flexDirection: 'row',
    },
    specialActionText: {
        ...labels.qsp,
        color: colors.grayDark,
        marginRight: spacing.xs,
        alignSelf: 'center',
        fontWeight: 'bold'
    },
    backdrop: {
        backgroundColor: 'rgba(0, 0, 0, 0.5)',
    },
    modal: {
        width: Dimensions.get('screen').width * 0.8,
        backgroundColor: colors.appLightBackground,
        padding: spacing.sm,
        borderRadius: rounding.xs,
        elevation: 20,
    },
    collectionButton: {
        backgroundColor: colors.appLightBackground,
        borderColor: colors.grayDark,
        marginVertical: spacing.xs,
        paddingVertical: 2,
        borderLeftWidth: 2,
        borderRightWidth: 2,
    },
    collectionText: {
        ...labels.qsp,
        color: colors.grayDark,
        textAlign: 'center'
    }
});

export default Plant;