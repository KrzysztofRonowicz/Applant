import React, { useState, useEffect } from 'react';
import { Layout, Text, MenuItem, OverflowMenu } from '@ui-kitten/components';
import { BackHandler, StyleSheet, View, FlatList, TouchableOpacity, Image, Vibration } from 'react-native';
import { labels, colors, spacing, rounding } from '../../style/base';
import { alertsImages, alertsImagesDarkColors } from '../../assets/alerts/alertsImages';
import { Icon } from 'react-native-elements'
import Plant from './plant';
import Conversation from './conversation';

const DATA = [
    {
        id: '1',
        usernames: ['Jan Kowalski', 'Krzysztof Ronowicz'],
        name: 'Monstera',
        messages:
            [
                {
                    name: 'Jan Kowalski',
                    date: '13.11',
                    message: 'Dzień dobry!'
                },
                {
                    name: 'Krzysztof Ronowicz',
                    date: '13.11',
                    message: 'Dzień dobry!'
                },
            ],
    },
    {
        id: '1',
        usernames: ['Jan Kowalski', 'Krzysztof Ronowicz'],
        name: 'Monstera',
        messages:
            [
                {
                    name: 'Jan Kowalski',
                    date: '13.11',
                    message: 'Dzień dobry!'
                },
                {
                    name: 'Krzysztof Ronowicz',
                    date: '13.11',
                    message: 'Dzień dobry!'
                },
            ],
    },
    {
        id: '1',
        usernames: ['Jan Kowalski', 'Krzysztof Ronowicz'],
        name: 'Monstera',
        messages:
            [
                {
                    name: 'Jan Kowalski',
                    date: '13.11',
                    message: 'Dzień dobry!'
                },
                {
                    name: 'Krzysztof Ronowicz',
                    date: '13.11',
                    message: 'Dzień dobry!'
                },
            ],
    },
    {
        id: '1',
        usernames: ['Jan Kowalski', 'Krzysztof Ronowicz'],
        name: 'Monstera',
        messages:
            [
                {
                    name: 'Jan Kowalski',
                    date: '13.11',
                    message: 'Dzień dobry!'
                },
                {
                    name: 'Krzysztof Ronowicz',
                    date: '13.11',
                    message: 'Dzień dobry!'
                },
            ],
    },
];
const Ticket = ({ name, alerts, onMessageSelect }) => (
    <View style={styles.ticketContainer}>
        <View style={styles.ticketImage}>

        </View>
        <View style={styles.ticketContent}>
            <TouchableOpacity 
                style={{ alignSelf: 'flex-start', width: '100%' }} 
                onPress={() => {
                    Vibration.vibrate(1);
                    onMessageSelect(1);
                }}
            >
                <View style={{flexDirection: 'row', justifyContent: 'space-between'}}>
                    <Text style={styles.ticketUserName}>Jan Kowalski</Text>
                    <Text style={styles.ticketDate}>11.11</Text>
                </View>
                <Text style={styles.ticketAdName}>{name}</Text>
                <Text style={styles.ticketAdMessage}>Dzień dobry! Czy ogłoszenie nada...</Text>
            </TouchableOpacity>
        </View>
    </View>
)

const Chat = ({ navigation }) => {
    const [selectedIndex, setSelectedIndex] = useState(null);
    const [visible, setVisible] = useState(false);
    const [selectedPlant, setSelectedPlant] = useState(undefined);
    const [messageVisible, setMessageVisible] = useState(false);

    const onMessageSelect = (e) => {
        setSelectedPlant(e);
        setMessageVisible(!messageVisible);
    };

    const onMessageClose = () => {
        setMessageVisible(!messageVisible);
    }

    const onChat = () => {
        onPlantSelect(undefined);
        navigation.navigate('Chat');
    };

    const onItemSelect = (index) => {
        setSelectedIndex(index);
        setVisible(false);
    };

    const renderItem = ({ item }) => (
        <Ticket onMessageSelect={onMessageSelect} name={item.name} alerts={item.alerts} />
    );

    const renderToggleButton = () => (
        <TouchableOpacity onPress={() => setVisible(true)}>
            <Icon type='material' name='more-horiz' size={30} color={colors.grayDark} />
        </TouchableOpacity>
    );

    return (
        messageVisible ?
            <Conversation onMessageClose={onMessageClose}/> :
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
                    data={DATA}
                    renderItem={renderItem}
                    keyExtractor={item => item.name}
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
        // color: colors.black,
        ...labels.qxs,
    },
    ticketDate: {
        color: colors.grayDark,
        ...labels.qxs,
    },
});

export default Chat;