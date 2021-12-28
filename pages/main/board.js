import React, { useState, useEffect } from 'react';
import { Layout, Text, MenuItem, OverflowMenu } from '@ui-kitten/components';
import { BackHandler, StyleSheet, View, FlatList, TouchableOpacity, Image } from 'react-native';
import {labels, colors, spacing, rounding} from '../../style/base';
import { alertsImages, alertsImagesDarkColors } from '../../assets/alerts/alertsImages';
import { Icon } from 'react-native-elements'
import Plant from './plant';
import AsyncStorage from '@react-native-async-storage/async-storage';
import * as API from '../../api/apiMethods';

const getImageUrl = (id) => {
    return 'https://drive.google.com/uc?id=' + id;
};

const PrintDate = ({date}) => {
    let d = new Date(date);
    return (
            <Text 
                style={{ 
                    ...labels.qsm, 
                    color: colors.grayDark, 
                    alignSelf: 'flex-start', 
                }}>
                    {d.toLocaleDateString()}
            </Text>
        );
}

const Ticket = ({data, onPlantSelect}) => (
    <View style={styles.ticketContainer}>
        <Image style={styles.ticketImage} source={{uri: getImageUrl(data.image)}}/>
        <View style={styles.ticketContent}>
            <TouchableOpacity style={{ alignSelf: 'flex-start' }} onPress={() => onPlantSelect(data.plant_id)}>
                <Text style={styles.ticketName}>{data.plant_name}</Text>
            </TouchableOpacity>
            <View style={styles.ticketButtons}>
                <PrintDate date={data.exec_date} />
                <TouchableOpacity 
                    style={[styles.ticketButton, { backgroundColor: alertsImagesDarkColors(data.name)}]}
                >
                    {/* <Text style={{...labels.qxs, alignSelf: 'center', marginRight: 3}}>Wykonaj</Text> */}
                    <Image style={styles.ticketButtonImage} source={alertsImages(data.name)}/>
                </TouchableOpacity>
            </View>
        </View>
    </View>
)

const Board = ({navigation}) => {
    const [selectedIndex, setSelectedIndex] = useState(null);
    const [visible, setVisible] = useState(false);
    const [selectedPlant, setSelectedPlant] = useState(undefined);
    const [plantVisible, setPlantVisible] = useState(false);

    const [response, setResponse] = useState([]);

    useEffect(() => {
        const unsubscribe = navigation.addListener('focus', () => {
            getTickets();
        });

        // Return the function to unsubscribe from the event so it gets removed on unmount
        return unsubscribe;
    }, [navigation]);

    async function getTickets() {
        try {
            const response = await API.getTickets({
                headers: {
                    'auth-token': await AsyncStorage.getItem('auth-token'),
                    'user_id': await AsyncStorage.getItem('user_id')
                }
            });
            if (response.status === 200) {
                setResponse(response.data);
            }
        } catch (error) {
            if (error.response.status === 400) {
                console.log(error.response.status);
            }
        }
    }

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
        <Ticket onPlantSelect={onPlantSelect} data={item}/>
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
                    onSelect={onItemSelect}
                    onBackdropPress={() => setVisible(false)}>
                    <MenuItem title='Środa (03.11)' />
                    <MenuItem title='Czwartek (04.11)' />
                    <MenuItem title='Piątek (05.11)' />
                </OverflowMenu>
            </View>
            <FlatList
                data={response}
                renderItem={renderItem}
                keyExtractor={item => item._id}
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
        color: colors.greenDark,
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
        marginBottom: 15,
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
    },
    ticketButton: {
        // flex: 1,
        backgroundColor: colors.white,
        borderRadius: rounding.sm,
        // borderBottomLeftRadius: rounding.sm,
        // borderBottomRightRadius: rounding.sm,
        paddingVertical: 5,
        paddingHorizontal: spacing.md,
        // marginBottom: 5,
        // marginHorizontal: 2,
        elevation: 3,
        flexDirection: 'row'
    },
    ticketButtonImage: {
        width: 20,
        height: 20,
        alignSelf: 'center',
        resizeMode: 'cover',
    },
});

export default Board;