import React, { useState, useEffect } from 'react';
import { Layout, Text, MenuItem, OverflowMenu } from '@ui-kitten/components';
import { BackHandler, StyleSheet, View, FlatList, TouchableOpacity, Image, Vibration } from 'react-native';
import { labels, colors, spacing, rounding } from '../../style/base';
import { alertsImages, alertsImagesDarkColors } from '../../assets/alerts/alertsImages';
import { Icon } from 'react-native-elements'
import Plant from './plant';
import Conversation from './conversation';
import AsyncStorage from '@react-native-async-storage/async-storage';
import * as API from '../../api/apiMethods';

const getImageUrl = (id) => {
    return 'https://drive.google.com/uc?id=' + id;
};

const printConversationMember = (id, users) => {
    if(users[0]._id !== id) {
        return (users[0].name); 
    } else {
        return (users[1].name);
    }
};

const printDate = (dateString) => {
    const date = new Date(dateString);
    const month = date.getMonth() + 1;
    const day = date.getDate();
    const monthString = month >= 10 ? month : `0${month}`;
    const dayString = day >= 10 ? day : `0${day}`;
    return `${dayString}/${monthString}`;
}

const PrefixMessageText = ({id, senderId, readed, message}) => {
    if (!readed && id !== senderId) {
        return (<Text numberOfLines={1} ellipsizeMode='tail' style={styles.altTicketAdMessage}>{message}</Text>);
    } else {
        if (id === senderId) {
            return (<Text numberOfLines={1} ellipsizeMode='tail' style={styles.ticketAdMessage}>Ja: {message}</Text>); 
        } else {
            return (<Text numberOfLines={1} ellipsizeMode='tail' style={styles.ticketAdMessage}>Ja: {message}</Text>);
        }
    }
}

const Ticket = ({ data, onMessageSelect, user_id }) => (
    <View style={styles.ticketContainer}>
        <Image source={{uri: getImageUrl(data.ad.image)}} style={styles.ticketImage}/>
        <View style={styles.ticketContent}>
            <TouchableOpacity 
                style={{ alignSelf: 'flex-start', width: '100%' }} 
                onPress={() => {
                    // Vibration.vibrate(1);
                    onMessageSelect(data.ad._id, data.users[0]._id, data.ad);
                }}
            >
                <View style={{flexDirection: 'row', justifyContent: 'space-between'}}>
                    <Text style={styles.ticketUserName}>{printConversationMember(user_id,data.users)}</Text>
                    <Text style={styles.ticketDate}>{printDate(data.message[0].createdAt)}</Text>
                </View>
                <Text numberOfLines={1} ellipsizeMode='tail' style={styles.ticketAdName}>{data.ad.name}</Text>
                <PrefixMessageText 
                    id={user_id} 
                    senderId={data.message[0].sender_id} 
                    readed={data.message[0].readed} 
                    message={data.message[0].message}
                />
            </TouchableOpacity>
        </View>
    </View>
)

const Chat = ({ navigation }) => {
    const [userId, setUserId] = useState(undefined);
    const [selectedIndex, setSelectedIndex] = useState(null);
    const [visible, setVisible] = useState(false);
    const [selectedPlant, setSelectedPlant] = useState(undefined);
    const [plantOwner, setPlantOwner] = useState(undefined);
    const [ad, setAd] = useState(undefined);
    const [messageVisible, setMessageVisible] = useState(false);

    const [responseData, setResponseData] = useState([]);

    useEffect(() => {
        const unsubscribe = navigation.addListener('focus', () => {
            getUser();
            getPrefixMessages();
        });
        return unsubscribe;
    }, [navigation]);

    const onMessageSelect = (plant, owner, ad) => {
        setSelectedPlant(plant);
        setPlantOwner(owner);
        setAd(ad);
        setMessageVisible(!messageVisible);
    };

    const onMessageClose = () => {
        getPrefixMessages();
        setMessageVisible(!messageVisible);
    }

    const onItemSelect = (index) => {
        setSelectedIndex(index);
        setVisible(false);
    };

    async function getUser() {
        try {
            const user = await AsyncStorage.getItem('user_id');
            setUserId(user);
        } catch (error) {
            console.log(error);
        }
    }

    async function getPrefixMessages(){
        try {
            const response = await API.getPrefixMessages({
                headers: {
                    'auth-token': await AsyncStorage.getItem('auth-token'),
                    'user_id': await AsyncStorage.getItem('user_id'),
                }
            });
            if (response.status === 200) {
                setResponseData(response.data);
            }
        } catch (error) {
            console.log(error);
        }
    }

    const renderItem = ({ item }) => (
        <Ticket onMessageSelect={onMessageSelect} data={item} user_id={userId}/>
    );

    const renderToggleButton = () => (
        <TouchableOpacity onPress={() => setVisible(true)}>
            <Icon type='material' name='more-horiz' size={30} color={colors.grayDark} />
        </TouchableOpacity>
    );

    return (
        messageVisible ?
            <Conversation 
                onMessageClose={onMessageClose} 
                ad_id={selectedPlant} 
                owner_id={plantOwner}
                ad={ad}
            /> :
            <Layout style={styles.layout}>
                <View style={styles.header}>
                    <Text style={styles.title}>Wiadomości</Text>
                    <OverflowMenu
                        style={styles.overflowMenu}
                        anchor={renderToggleButton}
                        visible={visible}
                        selectedIndex={selectedIndex}
                        onSelect={onItemSelect}
                        onBackdropPress={() => setVisible(false)}>
                        <MenuItem title='Środa (03.11)' />
                        <MenuItem title='Czwartek (04.11)' />
                        <MenuItem title='Piątek (05.11)' />
                    </OverflowMenu>
                </View>
                <FlatList
                    data={responseData}
                    renderItem={renderItem}
                    keyExtractor={item => item.message[0].conversation_id}
                    showsVerticalScrollIndicator={false}
                />
            </Layout>
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
        marginBottom: spacing.md,
        flexDirection: 'row',
        justifyContent: 'space-between'
    },
    title: {
        ...labels.qmd,
        color: colors.blueLabel,
    },
    overflowMenu: {
        alignSelf: 'flex-end',
        width: 150,
    },
    ticketContainer: {
        backgroundColor: colors.grayBackgroundLight,
        borderRadius: rounding.sm,
        borderWidth: 1,
        borderColor: colors.grayMedium,
        padding: spacing.xs,
        flexDirection: 'row',
        marginBottom: spacing.sm,
    },
    ticketImage: {
        width: 80,
        height: 80,
        marginRight: spacing.sm,
        borderRadius: rounding.sm,
    },
    ticketContent: {
        backgroundColor: colors.grayBackgroundDark,
        justifyContent: 'space-between',
        paddingHorizontal: spacing.sm,
        paddingVertical: spacing.xs,
        borderRadius: rounding.sm,
        flex: 1,
    },
    ticketUserName: {
        color: colors.blueLabel,
        ...labels.qxs,
    },
    ticketAdName: {
        color: colors.black,
        ...labels.qsp,
        // borderBottomWidth: 1,
    },
    ticketAdMessage: {
        color: colors.grayDark,
        ...labels.qxs,
    },
    altTicketAdMessage: {
        color: colors.black,
        ...labels.qxs,
    },
    ticketDate: {
        color: colors.grayDark,
        ...labels.qxs,
    },
});

export default Chat;