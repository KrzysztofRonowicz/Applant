import React, { useState, useEffect, useRef } from 'react';
import { Layout, Text, Input, OverflowMenu, MenuItem } from '@ui-kitten/components';
import { BackHandler, StyleSheet, FlatList, View, TouchableOpacity, TouchableWithoutFeedback, Keyboard, Dimensions } from 'react-native';
import { colors, labels, rounding, spacing } from '../../style/base';
import { Icon } from 'react-native-elements'

const Message = ({message}) => (
    <View style={styles.messageRow}>
        <View style={styles.message}>
           <Text adjustsFontSizeToFit style={styles.messageText}>{message}</Text> 
        </View>
    </View>
);

const Conversation = ({ onMessageClose }) => {
    const [overflowVisible, setOverflowVisible] = useState(false);
    const [clearVisible, setClearVisible] = useState(false);
    const [message, setMessage] = useState('');
    const [messages, setMessages] = useState([]);

    const [selectedIndex, setSelectedIndex] = useState(null);
    const flatListRef = useRef();

    useEffect(() => {
        const keyboardDidShowListener = Keyboard.addListener(
            'keyboardDidShow',
            () => {
                scrollToTop();
            }
        );

        return () => {
            keyboardDidShowListener.remove();
        };
    }, []);

    const renderItem = ({ item }) => (
        <Message message={item.message}/>
    );

    const scrollToTop = () => {
        flatListRef.current.scrollToOffset({ animated: true, offset: 0 })
    }

    const RenderSendIcon = () => (
        <TouchableOpacity 
            onPress={() => onChangeInput()} 
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

    const onChangeInput = () => {
        scrollToTop();
        if (message.replace(/\s+/g, '').length !== 0) {
            let tmpMsg = { message : message};
            setMessages((msgs) => [tmpMsg, ...msgs]);
            setMessage('');
        }
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

    const onItemSelect = (index) => {
        setSelectedIndex(index);
        setOverflowVisible(false);
    };

    const renderToggleButton = () => (
        <TouchableOpacity onPress={() => setOverflowVisible(true)} style={{justifyContent: 'center'}}>
            <Icon type='material' name='more-vert' size={30} color={colors.white} />
        </TouchableOpacity>
    );

    return(
        <Layout style={styles.layout}>
            <View style={styles.adContainer}>
                <TouchableOpacity
                    style={{ justifyContent: 'center', aspectRatio: 1 }}
                    onPress={() => onMessageClose()}
                >
                    <Icon color={colors.grayDark} name={'arrow-back'} size={28} />
                </TouchableOpacity>
                <View style={styles.ad}>
                    <View style={styles.adImage}>

                    </View>
                    <View style={{ flex: 1 }}>
                        <Text style={{ ...labels.qsm, fontWeight: 'bold', color: colors.white }}>Monstera</Text>
                        <Text style={{ ...labels.qxs, fontWeight: 'bold', color: colors.grayLight }}>60 zł</Text>
                    </View>
                    <OverflowMenu
                        anchor={renderToggleButton}
                        visible={overflowVisible}
                        selectedIndex={selectedIndex}
                        onSelect={onItemSelect}
                        onBackdropPress={() => setOverflowVisible(false)}>
                        <MenuItem title='Środa (03.11)' />
                        <MenuItem title='Czwartek (04.11)' />
                        <MenuItem title='Piątek (05.11)' />
                    </OverflowMenu>
                </View>
            </View>
            <FlatList
                ref={flatListRef}
                data={messages}
                renderItem={renderItem}
                keyExtractor={item => item.id}
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
        alignItems: 'flex-start', // Direction of message
        justifyContent: 'center',
        padding: spacing.xs
    },
    message: {
        borderRadius: rounding.sm,
        alignItems: 'flex-start',
        alignContent: 'flex-start',
        paddingVertical: spacing.sm,
        paddingHorizontal: spacing.sm,
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