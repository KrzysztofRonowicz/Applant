import React, { useState, useEffect } from 'react';
import { Layout, Text, Modal, Input, Button } from '@ui-kitten/components';
import { BackHandler, StyleSheet, View, FlatList, TouchableOpacity, Image, Dimensions, KeyboardAvoidingView } from 'react-native';
import { labels, colors, spacing, rounding } from '../../style/base';
import { alertsImages } from '../../assets/alerts/alertsImages';
import { Icon } from 'react-native-elements'
import { About, Care, Climate } from './plantDetails';
import AsyncStorage from '@react-native-async-storage/async-storage'
import * as API from '../../api/apiMethods';
import Toast from 'react-native-toast-message';
import Conversation from './conversation';


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
    // {
    //     id: 3,
    //     category: 'Akcje Ratunkowe'
    // }
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

const SellModal = ({plant_id, image, visible}) => {
    const [name, setName] = useState('');
    const [prize,setPrize] = useState(undefined);

    async function addAd() {
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
    }
    return (
        <View style={styles.modal}>
            <Input value={name} placeholder='Nazwa ogłoszenia' style={{margin: spacing.sm, marginBottom: 0}} onChangeText={(text) => setName(text)}/>
            <Input value={prize} placeholder='Cena (PLN)' style={{ margin: spacing.sm }} keyboardType='numeric' onChangeText={(text) => setPrize(text)}/>
            <Button style={{marginTop: spacing.sm}} onPress={() => addAd()}>DODAJ OGŁOSZENIE</Button>
        </View>
    );
}

const RemoveModal = ({ onSubmit }) => {
    return (
        <View style={styles.modal}>
            <Text style={{...labels.qsp, margin: spacing.sm, textAlign: 'center', marginBottom: spacing.md}}>Czy chcesz bezpowrotnie usunąć tę roślinę?</Text>
            <Button status={'warning'}>Usuń</Button>
        </View>
    );
}

const Plant = ({plantId, onClose, onChat, status, adId, roomName, roomId}) => {
    const [statusPlant, setStatusPlant] = useState(status);
    const [collectionName, setCollectionName] = useState(roomName);
    const [collectionId, setCollectionId] = useState(roomId);
    const [modalVisible, setModalVisible] = useState(false);
    const [modalContent, setModalContent] = useState(false);
    const [conversationVisible, setConversationVisible] = useState(false);
    const [fullAccess, setFullAccess] = useState(false);
    const [plantName, setPlantName] = useState('');
    const [imageUrl, setImageUrl] = useState('');
    const [indexes, setIndexes] = useState([]);

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

    useEffect(() => {
        getPlant();
    }, [modalVisible]);

    const onModalClose = () => {
        setModalVisible(false);
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
                } else {
                    setResponseData(response.data);
                    setStatusPlant(response.data.status);
                }
            }
        } catch (error) {
            if (error.response.status === 400) {
                console.log(error.response.status);
            }
        }
    };

    async function addPlantToUser() {
        let tmpPlant = responseData;
        tmpPlant.user_id = await AsyncStorage.getItem('user_id');
        tmpPlant.status = 'own';
        delete tmpPlant._id;
        try {
            const response = await API.addPlantToUser(tmpPlant,{
                headers: {
                    'auth-token': await AsyncStorage.getItem('auth-token')
                }
            });
            if (response.status === 200) {
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
                    }
                } catch (error) {
                    if (error.response.status === 400) {
                        console.log(error.response.status);
                    }
                }
            }
        } catch (error) {
            if (error.response.status === 400) {
                console.log(error.response.status);
            }
        }
    }

    return (
        conversationVisible ? <Conversation ad_id={adId} owner_id={responseData.user_id} onMessageClose={onConversation}/> :
        <Layout style={styles.layout}>
            <Modal onBackdropPress={() => setModalVisible(false)} visible={modalVisible}>
                {modalContent == 'sell' ? <SellModal plant_id={responseData._id} image={responseData.image} visible={onModalClose}/>:<RemoveModal/>}
            </Modal>
            <View style={styles.container}>
                <View style={styles.imageContainer}>
                    <Image style={{ flex: 1, marginHorizontal: spacing.xs, borderTopRightRadius: rounding.sm, borderTopLeftRadius: rounding.sm}} source={{ uri: imageUrl}}/>
                    <TouchableOpacity
                        style={{ position: 'absolute', right: 10, width: 30, height: 30 }}
                            onPress={() => { onClose(undefined);}}
                    >
                        <Icon type='material' name='close' size={30} color={colors.grayDark} />
                    </TouchableOpacity>
                    <TouchableOpacity
                        style={{ position: 'absolute', bottom: 5, right: 10, width: 30, height: 30 }}
                    >
                        <Icon type='material' name='photo' size={30} color={colors.grayDark} />
                    </TouchableOpacity>
                </View>
                <View style={styles.details}>
                    <Input
                        textStyle={{color: colors.greenDark, ...labels.qsm, fontWeight: 'bold'}}
                        style={styles.plantNameInput}
                        placeholder='Nazwa rośliny'
                        value={plantName}
                        onChangeText={nextValue => setPlantName(nextValue)}
                        autoCorrect={false}
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
                        <>
                            <FlatList
                                data={DATA}
                                renderItem={renderItem}
                                keyExtractor={item => item.id}
                                showsVerticalScrollIndicator={false}
                            />
                            <View style={{flexDirection: 'row', justifyContent: 'space-between'}}>
                                {statusPlant === 'own' || fullAccess === 'edit' ? 
                                    <TouchableOpacity style={styles.specialAction} onPress={() => { setModalContent('remove'); setModalVisible(true) }}>
                                        <Icon type='material' name='delete' size={28} color={colors.grayDark} />
                                        <Text style={styles.specialActionText}>Usuń</Text>
                                    </TouchableOpacity>
                                : <></>}
                                {statusPlant === 'own' ?
                                    <TouchableOpacity style={styles.specialAction} onPress={() => {setModalContent('sell'); setModalVisible(true)}}>
                                        <Icon type='material' name='storefront' size={28} color={colors.grayDark} />
                                        <Text style={[styles.specialActionText, { marginLeft: spacing.xs }]}>Sprzedaj</Text>
                                    </TouchableOpacity>
                                : <></>}
                                {statusPlant === 'ad' && fullAccess === 'edit' ?
                                    <TouchableOpacity style={styles.specialAction}>
                                        <Icon type='material' name='close' size={28} color={colors.grayDark} />
                                        <Text style={[styles.specialActionText, { marginLeft: spacing.xs }]}>Usuń ogłoszenie</Text>
                                    </TouchableOpacity>
                                : <></>}
                                {statusPlant === 'ad' && fullAccess === 'view' ?
                                    <TouchableOpacity style={styles.specialAction} onPress={() => onConversation()}>
                                        <Icon type='material' name='send' size={28} color={colors.grayDark} />
                                        <Text style={[styles.specialActionText, { marginLeft: spacing.xs }]}>Wiadomość</Text>
                                    </TouchableOpacity>
                                : <></>}
                                {statusPlant === 'wiki' ?
                                    <TouchableOpacity style={styles.specialAction} onPress={() => addPlantToUser()}>
                                        <Icon type='material' name='add-circle-outline' size={28} color={colors.greenMedium} />
                                            <Text style={[styles.specialActionText, { marginLeft: spacing.xs }]}>Dodaj{collectionName ? ' do ' + collectionName : ''}</Text>
                                    </TouchableOpacity>
                                : <></>}
                            </View>
                        </>
                    }
                </View>
            </View>
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
        flex: 1,
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
        // marginTop: spacing.xs,
        // borderTopWidth: 1,
        // borderTopColor: colors.grayDark,
        backgroundColor: colors.grayBackgroundDark,
        paddingHorizontal: spacing.md,
        paddingTop: spacing.lg,
        marginHorizontal: spacing.xs,
        marginBottom: spacing.xs,
        borderBottomLeftRadius: rounding.md,
        borderBottomRightRadius: rounding.md,
        // borderRadius: rounding.md,
    },
    plantNameInput: {
        position: 'absolute',
        left: 20,
        top: -20,
        height: 40,
        width: Dimensions.get('window').width * 0.6,
        backgroundColor: colors.grayBackgroundLight,
        borderWidth: 3,
        borderColor: colors.grayMedium,
        borderRadius: rounding.xs,
        elevation: 2,
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
        // borderWidth: 1,
        // borderColor: colors.grayDark,
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
});

export default Plant;