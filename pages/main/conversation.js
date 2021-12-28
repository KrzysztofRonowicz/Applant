import React, { useState, useEffect, useRef } from 'react';
import { Layout, Text, Input, OverflowMenu, MenuItem } from '@ui-kitten/components';
import { BackHandler, StyleSheet, FlatList, View, TouchableOpacity, TouchableWithoutFeedback, Keyboard, Dimensions, Image } from 'react-native';
import { colors, labels, rounding, spacing } from '../../style/base';
import { Icon } from 'react-native-elements';
import AsyncStorage from '@react-native-async-storage/async-storage';
import * as API from '../../api/apiMethods';

const DirectedMessage = ({message, sender, user}) => {
    const setDirection = () => {
        if (sender === user) {
            return (
                <View style={[styles.messageRow, { alignItems: 'flex-end' }]}>
                    <View style={[styles.message, { backgroundColor: '#daf2df' }]}>
                        <Text adjustsFontSizeToFit style={styles.messageText}>{message}</Text>
                    </View>
                </View>
            );
        } else {
            return (
                <View style={[styles.messageRow, { alignItems: 'flex-start' }]}>
                    <View style={styles.message}>
                        <Text adjustsFontSizeToFit style={styles.messageText}>{message}</Text>
                    </View>
                </View>
            );
        }
    }

    return setDirection();
}

const getImageUrl = (id) => {
    return 'https://drive.google.com/uc?id=' + id;
};

const Message = ({message, sender_id, user_id}) => (
    <DirectedMessage sender={sender_id} message={message} user={user_id}/>
);

const Conversation = ({ onMessageClose, ad_id, owner_id, ad }) => {
    const [userId, setUserId] = useState(undefined);
    const [conversationVisible, setConversationVisible] = useState(true);
    const [conversationId, setConversationId] = useState(undefined);
    const [overflowVisible, setOverflowVisible] = useState(false);
    const [clearVisible, setClearVisible] = useState(false);
    const [message, setMessage] = useState('');
    const [messages, setMessages] = useState([]);

    const [selectedIndex, setSelectedIndex] = useState(null);
    const [responseData, setResponseData] = useState([]);
    const flatListRef = useRef();

    useEffect(() => {
        getUser();
        getMessages();
        let intervalId = setInterval(() => {
            getMessages();
        }, 5000);
        
        const keyboardDidShowListener = Keyboard.addListener(
            'keyboardDidShow',
            () => {
                scrollToTop();
            }
        );

        return () => {
            keyboardDidShowListener.remove();
            clearInterval(intervalId);
        };
    }, []);

    async function getUser() {
        try {
            const user = await AsyncStorage.getItem('user_id');
            setUserId(user);
        } catch (error) {
            console.log(error);
        }
    }

    const renderItem = ({ item }) => (
        <Message message={item.message} sender_id={item.sender_id} user_id={userId}/>
    );

    const scrollToTop = () => {
        flatListRef.current.scrollToOffset({ animated: true, offset: 0 })
    }

    const RenderSendIcon = () => (
        <TouchableOpacity 
            onPress={() => sendMessage()} 
            style={{backgroundColor: colors.white, elevation: 3, borderRadius: rounding.sm, width: 45,aspectRatio: 1, justifyContent: 'center'}}>
            <Icon name={'send'} color={colors.greenDark}/>
        </TouchableOpacity>
    );

    const renderClearIcon = (props) => (
        <TouchableWithoutFeedback
            onPress={() => onClear()}
        >
            <Icon {...props} name={'clear'} color={colors.grayMedium} />
        </TouchableWithoutFeedback>
    );

    async function sendMessage() {
        scrollToTop();
        if (message.replace(/\s+/g, '').length !== 0) {
            let tmpMsg = { 
                sender_id: userId,
                message : message
            };
            setResponseData((msgs) => [tmpMsg, ...msgs]);
            setMessage('');
            try {
                await API.sendMessage({
                    conversation_id: conversationId,
                    message: message,
                    sender_id: userId
                },{
                    headers: {
                        'auth-token': await AsyncStorage.getItem('auth-token')
                    }
                });
            } catch (error) {
                if (error.response.status === 400) {
                    console.log(error.response.status);
                }
            }
        }
        getMessages();
    }

    const onClear = () => {
        scrollToTop();
        if(message) {
            setMessage('');
        }else {
            Keyboard.dismiss();
            setClearVisible(false);
        }
    }

    const renderToggleButton = () => (
        <TouchableOpacity onPress={() => setOverflowVisible(true)} style={{justifyContent: 'center'}}>
            <Icon type='material' name='more-vert' size={30} color={colors.white} />
        </TouchableOpacity>
    );

    async function getMessages() {
        try {
            const response = await API.getMessages(ad_id, owner_id, await AsyncStorage.getItem('user_id'), 
            {
                headers: {
                    'auth-token': await AsyncStorage.getItem('auth-token')
                }
            })
            if (response.status === 200) {
                setConversationId(response.data[0].conversation_id);
                if (response.data[0].message) {
                    setResponseData(response.data);
                }
            }
        } catch (error) {
            if (error.response.status === 400) {
                console.log(error.response.status);
            }
        }
    }

    return(
        <Layout style={styles.layout}>
            <View style={styles.adContainer}>
                <TouchableOpacity
                    style={{ justifyContent: 'center', aspectRatio: 1 }}
                    onPress={() => { onMessageClose()}}
                >
                    <Icon color={colors.grayDark} name={'arrow-back'} size={28} />
                </TouchableOpacity>
                <View style={styles.ad}>
                    <Image source={{uri: getImageUrl(ad.image)}} style={styles.adImage}/>
                    <View style={{ flex: 1 }}>
                        <Text style={{ ...labels.qsm, fontWeight: 'bold', color: colors.white }}>{ad.name}</Text>
                        <Text style={{ ...labels.qxs, fontWeight: 'bold', color: colors.grayLight }}>{ad.prize} zł</Text>
                    </View>
                    <OverflowMenu
                        anchor={renderToggleButton}
                        visible={overflowVisible}
                        onSelect={index => setSelectedIndex(index.row)}
                        onBackdropPress={() => setOverflowVisible(false)}>
                        <MenuItem title='Szczegóły' />
                        <MenuItem title='Kopiuj profil' />
                        <MenuItem title='Usuń konwersację' />
                    </OverflowMenu>
                </View>
            </View>
            <FlatList
                ref={flatListRef}
                data={responseData}
                renderItem={renderItem}
                keyExtractor={item => item._id}
                showsVerticalScrollIndicator={false}
                inverted={true}
                style={{ marginBottom: spacing.sm}}
                scroll
            />
            <View style={{width: '100%', maxHeight: 150, paddingBottom: spacing.sm, flexDirection: 'row', alignItems: 'center'}}>
                <Input
                    placeholder='Napisz wiadomość..'
                    value={message}
                    multiline={true}
                    scrollEnabled={true}
                    numberOfLines={1}
                    accessoryLeft={clearVisible ? renderClearIcon : <></>}
                    style={styles.input}
                    textStyle={{paddingVertical: spacing.xs}}
                    onChangeText={(msg) => { setMessage(msg)}}
                    autoCorrect={false}
                    onFocus={() => {setClearVisible(true); scrollToTop()}}
                    onEndEditing={() => setClearVisible(false)}
                    onPress={() => scrollToTop()}
                />
                <RenderSendIcon/>
            </View>
        </Layout>
    ); 
}

const styles = StyleSheet.create({
    layout: {
        flex: 1,
        backgroundColor: colors.grayBackgroundLight,
        borderTopWidth: 1,
        borderTopColor: '#DCDCDC',
        paddingHorizontal: spacing.sm,
    },
    messageRow: {
        flex: 1,
        // alignItems: 'flex-start', // Direction of message
        justifyContent: 'center',
        padding: spacing.xs
    },
    message: {
        borderRadius: rounding.sm,
        alignItems: 'flex-start',
        alignContent: 'flex-start',
        paddingVertical: spacing.sm,
        paddingHorizontal: 15,
        backgroundColor: colors.white,
        elevation: 2,
        maxWidth: '70%',
    },
    messageText: {
        ...labels.qsm,
        color: colors.black,
    },
    input: {
        borderWidth: 0, 
        borderRadius: rounding.sm, 
        elevation: 3, 
        flex: 1, 
        marginRight: spacing.sm,
    },
    adContainer: {
        height: 70,
        width: Dimensions.get('screen'). width,
        alignSelf: 'center',
        padding: spacing.sm,
        flexDirection: 'row',
        borderRadius: rounding.xs,
        backgroundColor: colors.grayBackgroundLight,
        elevation: 10,
    },
    ad: {
        flex: 1,
        backgroundColor: colors.greenMedium,
        padding: spacing.xs,
        flexDirection: 'row',
        borderRadius: rounding.xs,
    },
    adImage: {
        aspectRatio: 1,
        height: '100%',
        borderRadius: rounding.xs,
        backgroundColor: 'pink',
        marginRight: spacing.sm,
    },
});

export default Conversation;