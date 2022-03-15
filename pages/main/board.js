import React, { useState, useEffect } from 'react';
import { Layout, Text, MenuItem, OverflowMenu, Spinner } from '@ui-kitten/components';
import { BackHandler, StyleSheet, View, FlatList, TouchableOpacity, Image } from 'react-native';
import {labels, colors, spacing, rounding} from '../../style/base';
import { alertsImages, alertsImagesDarkColors } from '../../assets/alerts/alertsImages';
import { Icon } from 'react-native-elements'
import Plant from './plant';
import AsyncStorage from '@react-native-async-storage/async-storage';
import * as API from '../../api/apiMethods';
import { useFocusEffect } from '@react-navigation/native';
import LottieView from 'lottie-react-native';
import { sameLessDay } from './plantDetails';

const getImageUrl = (id) => {
    return 'https://drive.google.com/uc?id=' + id;
};

export const LoadingScreen = (text) => {
    return(
        <View style={styles.loadingScreen}>
            <Text style={{...labels.qsm, color: colors.greenDark, marginBottom: spacing.md}}>Trwa ładowanie</Text>
            <Spinner size={'giant'} />
        </View>
    );
}

const PrintDate = ({dateString}) => {
    let date = new Date(dateString);
    const month = date.getMonth() + 1;
    const day = date.getDate();
    const monthString = month >= 10 ? month : `0${month}`;
    const dayString = day >= 10 ? day : `0${day}`;
    return (
        <View>
            <Text
                style={{
                    ...labels.qsm,
                    color: colors.grayDark,
                    alignSelf: 'center',
                }}>
                {`${dayString}.${monthString}.${date.getFullYear()}`}
            </Text>
        </View>
        );
}

const TicketButton = ({data, onUpdateTicket, inactive}) => {
    const [updatePressed, setUpdatePressed] = useState(false);

    const RenderButon = () => {
        if (updatePressed) {
            return (
                // <View style={[styles.ticketButton, { backgroundColor: 'rgba(0,0,0,0)', elevation: 0, borderWidth: 1, borderColor: colors.greenLight}]}>
                //     <Icon type='material' name='done' size={22} color={colors.greenLight} style={styles.ticketButtonImage}/>
                // </View>
                <View style={{ width:60, height:50, position: 'absolute', top: -10, right: 0}}>
                    <LottieView style={{ backgroundColor: 'rgba(0,0,0,0)'}} colorFilters='red' source={require('../../assets/lottie/91749-done.json')} autoPlay loop={false} cacheStrategy='strong'/>
                </View>
            )
        } else {
            return (
                <TouchableOpacity
                    disabled={inactive}
                    onPress={() => { setUpdatePressed(true); onUpdateTicket(data._id) }}
                    style={[styles.ticketButton, inactive ? { backgroundColor: colors.grayLight} : { backgroundColor: alertsImagesDarkColors(data.name) }]}
                >
                    {/* <Text style={{...labels.qxs, alignSelf: 'center', marginRight: 3}}>Wykonaj</Text> */}
                    <Image style={styles.ticketButtonImage} source={alertsImages(data.name)} />
                </TouchableOpacity>
            );
        }   
    }

    return (<RenderButon/>);
}

const Ticket = ({data, onPlantSelect, onUpdateTicket, inactive}) => (
    <View style={styles.ticketContainer}>
        <Image style={styles.ticketImage} source={{uri: getImageUrl(data.image)}}/>
        <View style={styles.ticketContent}>
            <TouchableOpacity style={{ alignSelf: 'flex-start' }} onPress={() => onPlantSelect(data.plant_id)}>
                <Text style={styles.ticketName}>{data.plant_name}</Text>
            </TouchableOpacity>
            <View style={styles.ticketButtons}>
                <PrintDate dateString={data.exec_date} />
                <TicketButton inactive={inactive} data={data} onUpdateTicket={onUpdateTicket}/>
            </View>
        </View>
    </View>
)

const Board = ({navigation}) => {
    const [isLoading, setIsLoading] = useState(false);
    const [selectedIndex, setSelectedIndex] = useState(null);
    const [visible, setVisible] = useState(false);
    const [selectedPlant, setSelectedPlant] = useState(undefined);
    const [selectedTicket, setSelectedTicket] = useState(undefined);
    const [plantVisible, setPlantVisible] = useState(false);
    const [daysAhead, setDaysAhead] = useState(0);

    const today = new Date();

    const [response, setResponse] = useState([]);
    const [updatedResponse, setUpdatedResponse] = useState([]);

    useFocusEffect(
        React.useCallback(() => {
            const unsubscribe = navigation.addListener('focus', () => {
                setIsLoading(false);
                getTickets(0, true);
            });

            return () => {
                setTimeout(() => {
                    setSelectedPlant(undefined);
                    setPlantVisible(false);
                    setSelectedIndex(null);
                    // setResponse([]);
                }, 100);
                unsubscribe;
            };
        }, [])
    );

    async function getTickets(days_ahead, loadingScreen, update) {
        loadingScreen ? 
        setIsLoading(true) : <></>;
        try {
            const response = await API.getTickets(days_ahead, {
                headers: {
                    'auth-token': await AsyncStorage.getItem('auth-token'),
                    'user_id': await AsyncStorage.getItem('user_id')
                }
            });
            if (response.status === 200) {
                update ?
                setResponse([]) : <></>;
                setResponse(response.data);
                setIsLoading(false);
            }
        } catch (error) {
            setIsLoading(false);
            if (error.response.status === 400) {
                console.log(error.response.status);
            }
        }
    }

    async function updateTicket(e) {
        try {
            const response = await API.updateTicket(e, {
                headers: {
                    'auth-token': await AsyncStorage.getItem('auth-token')
                }
            });
            if (response.status === 200) {
                console.log(response.data);
            }
        } catch (error) {
            if (error.response.status === 400) {
                console.log(error.response.status);
            }
        }
        setTimeout(() => {
            getTickets(daysAhead, false, true);
        }, 600);
    }

    const onPlantSelect = (e) => {
        setSelectedPlant(e);
        setPlantVisible(!plantVisible);
    };

    const onUpdateTicket = (e) => {
        setSelectedTicket(e);
        updateTicket(e);
    };

    const onChat = () => {
        onPlantSelect(undefined);
        navigation.navigate('Chat');
    };

    const onItemSelect = (index) => {
        setSelectedIndex(index);
        setVisible(false);
    };

    const onMenuItemSelect = (index) => {
        setDaysAhead(index);
        setVisible(false);
        if (index === 0) {
            getTickets(0, true);
        }
        if (index === 1) {
            getTickets(1, true);
        }
        if (index === 2) {
            getTickets(2, true);
        }
    };

    const renderItem = ({ item }) => (
        <Ticket inactive={sameLessDay(new Date(item.exec_date), today) === false} onPlantSelect={onPlantSelect} onUpdateTicket={onUpdateTicket} data={item}/>
    );

    const renderToggleButton = () => (
        <TouchableOpacity onPress={() => setVisible(true)}>
            <Icon type='material' name='more-horiz' size={30} color={colors.grayDark} />
        </TouchableOpacity>
    );

    return (
        plantVisible ? 
        <Plant plantId={selectedPlant} onClose={onPlantSelect} onChat={onChat} status={'own'}/> :
        <Layout style={styles.layout}>
            <View style={styles.header}>
                <Text style={styles.title}>Terminarz</Text>
                <OverflowMenu
                    style={styles.overflowMenu}
                    anchor={renderToggleButton}
                    visible={visible}
                    selectedIndex={selectedIndex}
                    onSelect={index => {onItemSelect(index); onMenuItemSelect(index.row)}}
                    onBackdropPress={() => setVisible(false)}>
                    <MenuItem title='Do dzisiaj' />
                    <MenuItem title='Do jutra' />
                    <MenuItem title='Do pojutrza' />
                </OverflowMenu>
            </View>
            {isLoading ? 
            <LoadingScreen/> : 
            <FlatList
                data={response}
                extraData={updatedResponse}
                renderItem={renderItem}
                keyExtractor={item => item._id}
                showsVerticalScrollIndicator={false}
                ListEmptyComponent={
                <View style={{flex: 1}}>
                        <View style={{ alignItems: 'center', flex: 3.5, justifyContent: 'center'}}>
                        <Text style={{...labels.qsp, fontWeight: 'bold'}}>To już wszystko!</Text>
                        <Text style={{...labels.qsp}}>Twoje rośliny niczego nie potrzebują :) </Text>
                    </View>
                    <View style={{flex: 1 }}>
                        <LottieView source={require('../../assets/lottie/58375-plantas-y-hojas.json')} autoPlay loop />
                    </View>
                </View>}
                contentContainerStyle={{ flexGrow: 1 }}
            />
            }
        </Layout>
    );
}

const styles = StyleSheet.create({
    layout: {
        flex: 1,
        backgroundColor: '#F8F8F8',
        // borderTopWidth: 1,
        // borderTopColor: '#DCDCDC',
        paddingHorizontal: spacing.md,
        paddingTop: spacing.sm
    },
    header: {
        marginBottom: spacing.md,
        flexDirection: 'row',
        justifyContent: 'space-between'
    },
    title: {
        ...labels.qmd,
        color: colors.greenDark,
    },
    overflowMenu: {
        alignSelf: 'flex-end',
        width: 150,
    },
    ticketContainer: {
        justifyContent: 'center',
        backgroundColor: colors.white,
        borderRadius: rounding.sm,
        borderTopWidth: 1,
        borderTopColor: colors.grayMedium,
        padding: spacing.xs,
        flexDirection: 'row',
        marginBottom: 15,
        marginHorizontal: 5,
        elevation: 5,
    },
    ticketImage: {
        width: 80,
        height: 80,
        // marginRight: spacing.sm,
        borderRadius: rounding.sm,
        borderWidth: 3,
        borderColor: colors.white,
        alignSelf: 'center',
    },
    ticketContent: {
        backgroundColor: colors.white,
        justifyContent: 'space-between',
        paddingHorizontal: spacing.sm,
        paddingVertical: spacing.sm,
        borderRadius: rounding.sm,
        flex: 1,
    },
    ticketName: {
        color: colors.black,
        ...labels.qsp,
    },
    ticketButtons: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        height: 30,
    },
    ticketButton: {
        borderRadius: rounding.sm,
        // paddingVertical: 5,
        // paddingHorizontal: spacing.md,
        justifyContent: 'center',
        width: 60,
        height:30,
        elevation: 3,
        flexDirection: 'row'
    },
    ticketButtonImage: {
        width: 20,
        height: 20,
        alignSelf: 'center',
        resizeMode: 'cover',
    },
    loadingScreen: {
        flex: 1,
        backgroundColor: colors.appLightBackground,
        justifyContent: 'center',
        alignItems: 'center',
    }
});

export default Board;