import React, { useState, useEffect } from 'react';
import { Layout, Text, MenuItem, OverflowMenu, Input, Calendar, Modal, Button, Datepicker } from '@ui-kitten/components';
import { BackHandler, StyleSheet, View, FlatList, TouchableOpacity, Image, Dimensions, TouchableWithoutFeedback, ScrollView } from 'react-native';
import { labels, colors, spacing, rounding } from '../../style/base';
import { alertsImages, alertsImagesDarkColors, alertsImagesLightColors } from '../../assets/alerts/alertsImages';
import { Slider } from '@miblanchard/react-native-slider';
import { Icon } from 'react-native-elements'

const DATA = [
    {
        id: 0,
        name: 'shower',
        description: 'Prysznic',
        value: 7,
    },
    {
        id: 1,
        name: 'water',
        description: 'Podlewanie',
        value: 4,
    },
    {
        id: 2,
        name: 'bath',
        description: 'Kąpiel',
        value: 5,
    },
    {
        id: 3,
        name: 'fertilization',
        description: 'Nawożenie',
        value: 11,
    },
    {
        id: 4,
        name: 'rotation',
        description: 'Obracanie',
        value: 15,
    },
    {
        id: 5,
        name: 'compost',
        description: 'Wymiana podłoża',
        value: 14,
    }
];

const DATA_CLIMATE = [
    {
        id: 0,
        name: 'light',
        description: 'Słońce',
        value: 7,
        unit: '%',
    },
    {
        id: 1,
        name: 'humidity',
        description: 'Wilgotność',
        value: 4,
        unit: '%',
    },
    {
        id: 2,
        name: 'temperature',
        description: 'Temperatura',
        value: 5,
        unit: '°C',
    }
];

export const About = ({ onTouchCategory }) => {
    return(
        <View style={styles.container}>
            <TouchableOpacity activeOpacity={1} style={styles.header} onPress={() => onTouchCategory(undefined)}>
                <Text style={styles.headerText}>O roślinie</Text>
            </TouchableOpacity>
            <View style={styles.content}>
                <ScrollView>
                   <Text style={styles.aboutText}><Text style={styles.aboutTitle}>Monstera dziurawa</Text> 
                        (Monstera deliciosa) – gatunek rośliny występujący 
                        w lasach tropikalnych od południowego Meksyku 
                        po południową Panamę. 
                        W Polsce jest uprawiany jako roślina ozdobna.{'\n\n'}
                        Gatunek ten należy do największych roślin do dekoracji wnętrz. 
                        Rozmnaża się generatywnie. Roślina łatwa w uprawie. 
                        Dobrze znosi warunki w mieszkaniach. 
                        Wymaga miejsca jasnego do półcienistego, jednak nie bezpośrednio nasłonecznionego. 
                        Optymalna temperatura do rozwoju to 18-22 stopni. 
                        Monstera dziurawa lubi umiarkowaną wilgotność podłoża, należy ją podlewać raz w tygodniu. 
                        Nawożenie zalecane jest co 2 tygodnie od marca do sierpnia
                    </Text> 
                </ScrollView>
            </View>
        </View>
    );
}

const CarePlantParameter = ({ id, name, value, description, onModal, unit}) => (
    <View style={{flexDirection: 'row', borderBottomWidth: 1, borderBottomColor: colors.grayLight}}>
        <TouchableOpacity 
            style={[styles.plantParameterImage, {backgroundColor: alertsImagesDarkColors(name)}]}
            onPress={() => onModal(description, unit)}
        >
            <Image source={alertsImages(name)} style={{alignSelf: 'center', width: 30, height: 30}}/>
        </TouchableOpacity>
        <View style={styles.plantParameterIndicator}>
            <Text style={{...labels.qsp, marginVertical: spacing.xs}}>{description}</Text>
            <IndicatorValue value={value} dark={alertsImagesDarkColors(name)} light={alertsImagesLightColors(name)}/>
        </View>
    </View>
);

const IndicatorValue = ({value, dark, light}) => {
    let tmpArr = [];
    for (let index = 0; index < 20; index++) {
        tmpArr.push(index);
    }
    return (
        <View style={[styles.plantParameterIndicatorWrapper,{ backgroundColor: light}]}>
            {tmpArr.map((index) => (
                <View key={index} 
                    style={[{ 
                        borderRadius: rounding.xs, 
                        flex:1, 
                        height: 15, 
                        marginHorizontal: 2,  
                    }, index <= value ? { backgroundColor: dark } : { backgroundColor: light}]}
                >
                </View>
            ))}
        </View>
    );
};

export const Care = ({ onTouchCategory }) => {
    const [date, setDate] = useState(null);
    const [calendarVisible, setCalendarVisible] = useState(false);
    const [modalVisible, setModalVisible] = useState(false);
    const [sliderValue, setSliderValue] = useState(1);
    const [selectedParameter, setSelectedParameter] = useState(undefined);
    const [datepicker, setDatepicker] = React.useState(new Date());

    const renderItem = ({ item }) => (
        <CarePlantParameter onModal={onModal} id={item.id} name={item.name} value={item.value} description={item.description}/>
    );

    const onModal = (parameter) => {
        setSelectedParameter(parameter);
        setModalVisible(!modalVisible);
    }

    return (
        <View style={styles.container}>
            <Modal backdropStyle={styles.backdrop} onBackdropPress={() => setModalVisible(false)} visible={modalVisible}>
                <View style={styles.modal}>
                    <Text style={styles.modalText}>{selectedParameter} co: <Text style={styles.modalAltText}>{sliderValue}</Text> dni</Text>
                    <Slider
                        value={sliderValue}
                        onValueChange={value => setSliderValue(value)}
                        minimumValue={1}
                        maximumValue={30}
                        step={1}
                    />
                    <Text style={styles.modalText}>Następny raz: </Text>
                    <Datepicker
                        style={styles.datepicker}
                        date={datepicker}
                        onSelect={nextDate => setDatepicker(nextDate)}
                    />
                    <View style={{flex: 1, flexDirection: 'row', marginTop: spacing.sm}}>
                        <Button onPress={() => setModalVisible(false)} style={{flex:1, marginRight: spacing.xs}} disabled={true}>
                            PRZYWRÓĆ
                        </Button>
                        <Button onPress={() => setModalVisible(false)} style={{ flex: 1, marginLeft: spacing.xs }}>
                            ZAPISZ
                        </Button>
                    </View>
                </View>
            </Modal>
            <View style={[styles.header, {flexDirection: 'row'}]}>
                <TouchableOpacity onPress={() => setCalendarVisible(!calendarVisible)}>
                    <Icon type='material' name='chevron-left' size={23} color={colors.white} />
                </TouchableOpacity>
                <TouchableOpacity activeOpacity={1} onPress={() => onTouchCategory(undefined)}>
                    <Text style={styles.headerText}>Pielęgnacja</Text>
                </TouchableOpacity>
                <TouchableOpacity onPress={() => setCalendarVisible(!calendarVisible)}>
                    <Icon type='material' name='chevron-right' size={23} color={colors.white} />
                </TouchableOpacity>
            </View>
            <View style={styles.content}>
                {calendarVisible ? 
                    <ScrollView>
                        <Calendar
                            style={{width: '100%'}}
                            date={date}
                            onSelect={nextDate => setDate(nextDate)}
                            // renderDay={DayCell}
                        />
                    </ScrollView> :
                    <FlatList
                        data={DATA}
                        renderItem={renderItem}
                        keyExtractor={item => item.id}
                        showsVerticalScrollIndicator={false}
                    />
                }
            </View>
        </View>
    );
}

export const Climate = ({ onTouchCategory }) => {
    const [modalVisible, setModalVisible] = useState(false);
    const [sliderValue, setSliderValue] = useState([40,60]);
    const [selectedParameter, setSelectedParameter] = useState(undefined);
    const [selectedUnit, setSelectedUnit] = useState(undefined);
    const [actualValue, setActualValue] = useState(40);

    const renderItem = ({ item }) => (
        <CarePlantParameter onModal={onModal} id={item.id} name={item.name} value={item.value} description={item.description} unit={item.unit}/>
    );

    const onModal = (parameter, unit) => {
        setSelectedUnit(unit);
        setSelectedParameter(parameter);
        setModalVisible(!modalVisible);
    }

    return (
        <View style={styles.container}>
            <Modal backdropStyle={styles.backdrop} onBackdropPress={() => setModalVisible(false)} visible={modalVisible}>
                <View style={styles.modal}>
                    <Text style={styles.modalText}>
                        {selectedParameter}: od
                        <Text style={styles.modalAltText}> {sliderValue[0]}{selectedUnit} </Text>do 
                        <Text style={styles.modalAltText}> {sliderValue[1]}{selectedUnit} </Text>
                    </Text>
                    <Slider
                        value={sliderValue}
                        onValueChange={value => setSliderValue(value)}
                        minimumValue={0}
                        maximumValue={100}
                        step={1}
                    />
                    <Text style={styles.modalText}>Aktualnie: <Text style={styles.modalAltText}>{actualValue}{selectedUnit} </Text></Text>
                    <Slider
                        value={actualValue}
                        onValueChange={value => setActualValue(value)}
                        minimumValue={0}
                        maximumValue={100}
                        step={1}
                    />
                    <View style={{ flex: 1, flexDirection: 'row', marginTop: spacing.sm }}>
                        <Button onPress={() => setModalVisible(false)} style={{ flex: 1, marginRight: spacing.xs }} disabled={true}>
                            PRZYWRÓĆ
                        </Button>
                        <Button onPress={() => setModalVisible(false)} style={{ flex: 1, marginLeft: spacing.xs }}>
                            ZAPISZ
                        </Button>
                    </View>
                </View>
            </Modal>
            <TouchableOpacity activeOpacity={1} style={styles.header} onPress={() => onTouchCategory(undefined)}>
                <Text style={styles.headerText}>Klimat</Text>
            </TouchableOpacity>
            <View style={styles.content}>
                <FlatList
                    data={DATA_CLIMATE}
                    renderItem={renderItem}
                    keyExtractor={item => item.id}
                    showsVerticalScrollIndicator={false}
                />
            </View>
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        // borderRadius: rounding.sm,
        marginBottom: spacing.md,
        // borderColor: colors.greenDark,
    },
    header: {
        backgroundColor: colors.greenDark,
        elevation: 5,
        borderTopRightRadius: rounding.sm,
        borderTopLeftRadius: rounding.sm,
        justifyContent: 'space-between',
        alignItems: 'center',
        padding: spacing.sm,
    },
    headerText: {
        ...labels.qsp,
        color: colors.white,
    },
    content: {
        flex: 1,
        padding: spacing.sm,
        borderBottomLeftRadius: rounding.sm,
        borderBottomRightRadius: rounding.sm,
        backgroundColor: colors.appLightBackground,
        borderLeftWidth: 1,
        borderRightWidth: 1,
        borderBottomWidth: 1,
        borderColor: colors.greenDark,
        elevation: 5,
    },
    aboutTitle: {
        ...labels.qsm,
        color: colors.black,
        fontWeight: 'bold',
    }, 
    aboutText: {
        ...labels.qsm,
        color: colors.black,
    },
    plantParameterImage: {
        width: 53,
        height: 53,
        margin: spacing.sm,
        borderRadius: rounding.sm,
        justifyContent: 'center',
        elevation: 3,
    },
    plantParameterIndicator: {
        flex: 1,
        marginLeft: spacing.xs,
        marginRight: 15,
        // alignItems: 'center',
        // alignContent: 'center', 
        // justifyContent: 'space-around',
    },
    plantParameterIndicatorWrapper: {
        flexDirection: 'row', 
        padding: spacing.xs,
        borderRadius: rounding.sm,
        elevation: 1,
        // flex: 1,
    },
    backdrop: {
        backgroundColor: 'rgba(0, 0, 0, 0.5)',
    },
    modal: {
        width: Dimensions.get('screen').width * 0.8,
        backgroundColor: colors.appLightBackground,
        padding: spacing.sm,
        borderRadius: rounding.xs,
    },
    modalText: {
        ...labels.qsm,
    },
    modalAltText: {
        ...labels.qsm,
        color: colors.greenDark,
        includeFontPadding: true,
        fontWeight: 'bold',
    }, 
    datepicker: {
        marginVertical: spacing.sm,
    }
});