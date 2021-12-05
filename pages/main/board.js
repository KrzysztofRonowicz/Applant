import React, { useState, useEffect } from 'react';
import { Layout, Text, MenuItem, OverflowMenu } from '@ui-kitten/components';
import { BackHandler, StyleSheet, View, FlatList, TouchableOpacity, Image } from 'react-native';
import {labels, colors, spacing, rounding} from '../../style/base';
import { alertsImages, alertsImagesDarkColors } from '../../assets/alerts/alertsImages';
import { Icon } from 'react-native-elements'
import Plant from './plant';

const DATA = [
    {
        name: 'Monstera',
        alerts: ['water', 'bath', 'fertilization'],
        plant_id: '61a115a21f60a745ac391127'
    },
    {
        name: 'Filodendron',
        alerts: ['water', 'shower'],
        plant_id: '61a115a21f60a745ac391127'
    },
    {
        name: 'Aloes',
        alerts: ['temperature', 'shower'],
        plant_id: '61a115a21f60a745ac391127'
    },
];

const Ticket = ({name, alerts, onPlantSelect, plant_id}) => (
    <View style={styles.ticketContainer}>
        <View style={styles.ticketImage}>

        </View>
        <View style={styles.ticketContent}>
            <TouchableOpacity style={{ alignSelf: 'flex-start' }} onPress={() => onPlantSelect(plant_id)}>
                <Text style={styles.ticketName}>{name}</Text>
            </TouchableOpacity>
            <View style={styles.ticketButtons}>
                {alerts.map((alert) => 
                    <TouchableOpacity 
                        style={[styles.ticketButton, {backgroundColor: alertsImagesDarkColors(alert)}]}
                    >
                        <Image style={styles.ticketButtonImage} source={alertsImages(alert)}/>
                    </TouchableOpacity>
                )}
            </View>
        </View>
    </View>
)

const Board = ({navigation}) => {
    const [selectedIndex, setSelectedIndex] = useState(null);
    const [visible, setVisible] = useState(false);
    const [selectedPlant, setSelectedPlant] = useState(undefined);
    const [plantVisible, setPlantVisible] = useState(false);

    const onPlantSelect = (e) => {
        setSelectedPlant(e);
        setPlantVisible(!plantVisible);
    };

    const onChat = () => {
        onPlantSelect(undefined);
        navigation.navigate('Chat');
    };

    const onItemSelect = (index) => {
        setSelectedIndex(index);
        setVisible(false);
    };

    const renderItem = ({ item }) => (
        <Ticket onPlantSelect={onPlantSelect} name={item.name} alerts={item.alerts} plant_id={item.plant_id}/>
    );

    const renderToggleButton = () => (
        <TouchableOpacity onPress={() => setVisible(true)}>
            <Icon type='material' name='more-horiz' size={30} color={colors.grayDark} />
        </TouchableOpacity>
    );

    return (
        plantVisible ? 
        <Plant plantId={selectedPlant} onClose={onPlantSelect} onChat={onChat} status={'own'} /> :
        <Layout style={styles.layout}>
            <View style={styles.header}>
                <Text style={styles.title}>Terminarz</Text>
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
        marginBottom: spacing.sm,
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
        backgroundColor: colors.grayBackgroundLight,
        borderRadius: rounding.sm,
        borderWidth: 2,
        borderColor: colors.grayMedium,
        padding: spacing.sm,
        flexDirection: 'row',
        marginBottom: spacing.md,
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
    ticketName: {
        color: colors.black,
        ...labels.qsp,
    },
    ticketButtons: {
        flexDirection: 'row',
        borderBottomLeftRadius: rounding.sm,
        borderBottomRightRadius: rounding.sm,
    },
    ticketButton: {
        flex: 1,
        backgroundColor: colors.white,
        borderBottomLeftRadius: rounding.sm,
        borderBottomRightRadius: rounding.sm,
        paddingVertical: spacing.xs,
        marginHorizontal: 2,
        elevation: 3,
    },
    ticketButtonImage: {
        width: 20,
        height: 20,
        alignSelf: 'center',
        resizeMode: 'cover',
    },
});

export default Board;