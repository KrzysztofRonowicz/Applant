import React, { useState, useEffect } from 'react';
import { Layout, Text, MenuItem, OverflowMenu, Input } from '@ui-kitten/components';
import { BackHandler, StyleSheet, View, FlatList, TouchableOpacity, Image, Dimensions, TouchableWithoutFeedback } from 'react-native';
import { labels, colors, spacing, rounding } from '../../style/base';
import { alertsImages } from '../../assets/alerts/alertsImages';
import { Icon } from 'react-native-elements'

const PlantParameter = ({lightColor, darkColor, icon, level}) => {
    return(
        <View style={[styles.plantParameter, {borderColor: darkColor, backgroundColor: lightColor}]}>
            <TouchableOpacity style={{flexDirection: 'row'}}>
                <Image style={styles.plantParameterImage} source={alertsImages(icon)} />
                <Text style={styles.level}>{level}</Text>
            </TouchableOpacity>
        </View>
    );
}

const Category = ({name}) => {
    return(
        <TouchableOpacity style={styles.category}>
            <Text style={styles.categoryText}>{name}</Text>
        </TouchableOpacity>
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
    {
        id: 3,
        category: 'Kup / Sprzedaj'
    },
    {
        id: 4,
        category: 'Akcje Ratunkowe'
    }
];

const Plant = ({plantId, onClose}) => {
    const [plantName, setPlantName] = useState(plantId === '' ? '' : plantId);
    const [visible, setVisible] = useState(false);
    const [selectedIndex, setSelectedIndex] = useState(null);

    const renderItem = ({ item }) => (
        <TouchableWithoutFeedback onPress={() => {}}>
            <Category name={item.category} />
        </TouchableWithoutFeedback>
    );

    const onItemSelect = (index) => {
        setSelectedIndex(index);
        setVisible(false);
    };

    const renderToggleButton = () => (
        <TouchableOpacity style={{right: -10}} onPress={() => setVisible(true)}>
            <Icon type='material' name='more-vert' size={30} color={colors.grayDark} />
        </TouchableOpacity>
    );

    return (
        <Layout style={styles.layout}>
            <View style={styles.container}>
                <View style={styles.imageContainer}>
                    <TouchableOpacity 
                        style={{position: 'absolute', right: 10, width: 30, height: 30}}
                        onPress={() => onClose(undefined)}
                    >
                        <Icon type='material' name='close' size={30} color={colors.grayDark} />
                    </TouchableOpacity>
                    <TouchableOpacity
                        style={{ position: 'absolute', bottom: 5, right: 10, width: 30, height: 30 }}
                        onPress={() => onClose(undefined)}
                    >
                        <Icon type='material' name='camera' size={30} color={colors.grayDark} />
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
                        <Text style={{ ...labels.qsp, color: colors.grayDark }}>Monstera deliciosa</Text>
                        <OverflowMenu
                            anchor={renderToggleButton}
                            visible={visible}
                            selectedIndex={selectedIndex}
                            onSelect={onItemSelect}
                            onBackdropPress={() => setVisible(false)}>
                            <MenuItem title='Przypisz do' />
                            <MenuItem title='Usuń' />
                        </OverflowMenu>
                    </View>
                    <View style={{flexDirection: 'row', marginVertical: spacing.md}}>
                        <PlantParameter lightColor={colors.waterLight} darkColor={colors.waterDark} icon={'water'} level={6}/>
                        <PlantParameter lightColor={colors.lightLight} darkColor={colors.lightDark} icon={'light'} level={10}/>
                        <PlantParameter lightColor={colors.compostLight} darkColor={colors.compostDark} icon={'compost'} level={8}/>
                    </View>
                    <FlatList
                        data={DATA}
                        renderItem={renderItem}
                        keyExtractor={item => item.id}
                        showsVerticalScrollIndicator={false}
                    />
                </View>
            </View>
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
        aspectRatio: 16 / 9, 
        backgroundColor: colors.grayBackgroundLight,
    },
    details: {
        alignSelf: 'stretch',
        flex: 1,
        marginTop: spacing.xs,
        borderTopWidth: 2,
        borderTopColor: colors.grayDark,
        backgroundColor: colors.grayBackgroundDark,
        paddingHorizontal: spacing.md,
        paddingTop: spacing.lg,
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
        elevation: 5,
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
        backgroundColor: colors.grayBackgroundDark,
        elevation: 4,
        borderRadius: rounding.xs,
        paddingHorizontal: spacing.sm,
        paddingVertical: spacing.xs,
        marginVertical: 7,
        marginHorizontal: spacing.xs,
        justifyContent: 'center',
    },
    categoryText: {
        ...labels.qsp,
        color: colors.greenDark,
    },
});

export default Plant;