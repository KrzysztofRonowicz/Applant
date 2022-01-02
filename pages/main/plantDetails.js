import React, { useState, useEffect } from 'react';
import { Layout, Text, MenuItem, OverflowMenu, Input, Calendar, Modal, Button, Datepicker, NativeDateService  } from '@ui-kitten/components';
import { BackHandler, StyleSheet, View, FlatList, TouchableOpacity, Image, Dimensions, TouchableWithoutFeedback, ScrollView } from 'react-native';
import { labels, colors, spacing, rounding } from '../../style/base';
import { alertsImages, alertsImagesDarkColors, alertsImagesLightColors } from '../../assets/alerts/alertsImages';
import { Slider } from '@miblanchard/react-native-slider';
import { Icon } from 'react-native-elements';
import AsyncStorage from '@react-native-async-storage/async-storage';
import * as API from '../../api/apiMethods';

export const About = ({ onTouchCategory, plantId, data, status }) => {
    return(
        <View style={styles.container}>
            <TouchableOpacity activeOpacity={1} style={styles.header} onPress={() => onTouchCategory(undefined)}>
                <Text style={styles.headerText}>O roślinie</Text>
            </TouchableOpacity>
            <View style={styles.content}>
                <ScrollView>
                   <Text style={styles.aboutText}><Text style={styles.aboutTitle}>{data.species_name}</Text> 
                        {data.description}
                    </Text> 
                </ScrollView>
            </View>
        </View>
    );
}

const CarePlantParameter = ({ data, onModal}) => (
    <View style={{flexDirection: 'row', borderBottomWidth: 1, borderBottomColor: colors.grayLight}}>
        <TouchableOpacity 
            style={[styles.plantParameterImage, {backgroundColor: alertsImagesDarkColors(data.name)}]}
            onPress={() => onModal(data)}
        >
            <Image source={alertsImages(data.name)} style={{alignSelf: 'center', width: 30, height: 30}}/>
        </TouchableOpacity>
        <View style={styles.plantParameterIndicator}>
            <Text style={{ ...labels.qsp, marginVertical: spacing.xs }}>{data.description}</Text>
            <IndicatorValue value={data.name === 'fertilization' ? data.frequency * 1.8 : data.frequency *  1.5} care={true} dark={alertsImagesDarkColors(data.name)} light={alertsImagesLightColors(data.name)}/>
        </View>
    </View>
);

const ClimatePlantParameter = ({ data, onModal }) => (
    <View style={{ flexDirection: 'row', borderBottomWidth: 1, borderBottomColor: colors.grayLight }}>
        <TouchableOpacity
            style={[styles.plantParameterImage, { backgroundColor: alertsImagesDarkColors(data.name) }]}
            onPress={() => onModal(data)}
        >
            <Image source={alertsImages(data.name)} style={{ alignSelf: 'center', width: 30, height: 30 }} />
        </TouchableOpacity>
        <View style={styles.plantParameterIndicator}>
            <Text style={{ ...labels.qsp, marginVertical: spacing.xs }}>{data.description}</Text>
            <IndicatorValue temperature={true} value={data.value[0].max - data.value[0].min} dark={alertsImagesDarkColors(data.name)} light={alertsImagesLightColors(data.name)} />
        </View>
    </View>
);

const IndicatorValue = ({value, dark, care, temperature}) => {
    let newValue;
    if (care) {
        newValue = 20 - Math.round(value * 0.66);
    } else {
        if (temperature) {
            newValue = 20 - Math.round(value / 40 * 20);
        } else {
            newValue = 20 - Math.round(value / 100 * 20);
        }
    }
    let tmpArr = [];
    for (let index = 0; index < 20; index++) {
        tmpArr.push(index);
    }
    return (
        <View style={[styles.plantParameterIndicatorWrapper, { backgroundColor: colors.appLightBackground}]}>
            {tmpArr.map((index) => (
                <View key={index} 
                    style={[{ 
                        borderRadius: 2,
                        flex:1, 
                        height: 15, 
                        marginHorizontal: 2,  
                    }, index <= newValue ? { backgroundColor: dark } : { borderColor: colors.appLightBackground}]}
                >
                </View>
            ))}
        </View>
    );
};

const i18n = {
    dayNames: {
        short: ['Pn', 'Wt', 'Śr', 'Czw', 'Pt', 'Sob', 'Niedz'],
        long: ['Poniedziałek', 'Wtorek', 'Środa', 'Czwartek', 'Piątek', 'Sobota', 'Niedziela'],
    },
    monthNames: {
        short: ['St', 'Lut', 'Mrz', 'Kw', 'Maj', 'Cz', 'Lip', 'Sier', 'Wrz', 'Paź', 'Lis', 'Gr'],
        long: [
            'Styczeń',
            'Luty',
            'Marzec',
            'Kwiecień',
            'Maj',
            'Czerwiec',
            'Lipiec',
            'Sierpień',
            'Wrzesień',
            'Październik',
            'Listopad',
            'Grudzień',
        ],
    },
};

const localeDateService = new NativeDateService('pl', { i18n, startDayOfWeek: 0 });

export const Care = ({ onTouchCategory, plantId, careData, status, fullAccess }) => {
    const [saveDisabled, setSaveDisabled] = useState(true);
    const [date, setDate] = useState(null);
    const [calendarVisible, setCalendarVisible] = useState(false);
    const [modalVisible, setModalVisible] = useState(false);
    const [selectedParameter, setSelectedParameter] = useState(careData[0]);

    const [slider, setSlider] = useState([]);
    const [datepicker, setDatepicker] = useState(new Date(Date.now() + (3600 * 1000 * 24)));
    const now = new Date();
    const tomorrow = new Date(now.getFullYear(), now.getMonth(), now.getDate() + 1);
    const yearLater = new Date(now.getFullYear(), now.getMonth(), now.getDate() + 365)

    const [requestData, setRequestData] = useState(careData);
    const [responseData, setResponseData] = useState(careData);

    const renderItem = ({ item }) => (
        <CarePlantParameter onModal={onModal} data={item}/>
    );

    const onModal = (parameter) => {
        setSelectedParameter(parameter);
        setModalVisible(!modalVisible);
        setSlider([parameter.frequency]);
        if (status !== 'wiki') setDatepicker(new Date(parameter.next_date));
    }

    const createUpdateRequest = (data) => {
        setSaveDisabled(false);
        let tmpRequestData = requestData;
        let foundIndex = tmpRequestData.findIndex(parameter => parameter._id === selectedParameter._id);
        tmpRequestData[foundIndex].frequency = slider[0];
        if (data) tmpRequestData[foundIndex].next_date = data;
        tmpRequestData[foundIndex].modified = true;
        setRequestData(tmpRequestData);
    }

    async function updatePlant() {
        try {
            let foundIndex = requestData.findIndex(parameter => parameter._id === selectedParameter._id);
            let request = requestData[foundIndex];
            if (status === 'own' || status === 'ad') {
                response = await API.updateUserPlantCareParameter(plantId, requestData[foundIndex].name ,
                    request,
                    {
                        headers: {
                            'auth-token': await AsyncStorage.getItem('auth-token'),
                            'user_id': await AsyncStorage.getItem('user_id') 
                        }
                    }
                );
            }
            getPlant();
            setModalVisible(false);
        } catch (error) {
            if (error.response.status === 400) {
                console.log(error.response.status);
            }
        }
    }

    async function getPlant() {
        try {
            let response;
            if (status === 'own') {
                response = await API.getUserPlant(plantId, {
                    headers: {
                        'auth-token': await AsyncStorage.getItem('auth-token'),
                        'user_id': await AsyncStorage.getItem('user_id')
                    }
                });
            } else if (status === 'wiki') {
                response = await API.getPlant(plantId, {
                    headers: {
                        'auth-token': await AsyncStorage.getItem('auth-token'),
                    }
                });
            }
            if (response.status === 200) {
                if (!response.data === []) {
                    setResponseData(response.data.care);
                }
            }
        } catch (error) {
            if (error.response.status === 400) {
                console.log(error.response.status);
            }
        }
    };

    function sameDay(d1, d2) {
        return d1.getFullYear() === d2.getFullYear() &&
            d1.getMonth() === d2.getMonth() &&
            d1.getDate() === d2.getDate();
    }

    const DayCell = ({ date }, style) => (
        <View
            style={[styles.dayContainer, style.container]}>
            <Text style={style.text}>{`${date.getDate()}`}</Text>
            <View style={{ flexDirection: 'row' }}>
            {responseData.map(index => {
                if (sameDay(new Date(index.next_date), new Date(date))) {
                    return (<View style={[styles.value, { backgroundColor: alertsImagesDarkColors(index.name)}]}></View>);
                }
            })}
            </View>
            
        </View>
    );

    return (
        <View style={styles.container}>
            <Modal backdropStyle={styles.backdrop} onBackdropPress={() => {setModalVisible(false)}} visible={modalVisible}>
                <View style={styles.modal}>
                    <Text style={styles.modalText}>
                            {selectedParameter.description} co: <Text style={styles.modalAltText}>{slider} </Text> 
                            {selectedParameter.frequency_unit}
                    </Text>
                    <Slider
                        containerStyle={{marginVertical: spacing.xs}}
                        value={slider}
                        onValueChange={value => {setSlider(value); createUpdateRequest()}}
                        minimumValue={1}
                        maximumValue={30}
                        step={1}
                        disabled={status === 'wiki' || fullAccess === 'view'}
                    />
                    <Text style={styles.modalText}>Następny raz: </Text>
                    <Datepicker
                        style={styles.datepicker}
                        dateService={localeDateService}
                        date={datepicker}
                        min={tomorrow}
                        max={yearLater}
                        onSelect={nextDate => { setDatepicker(nextDate); createUpdateRequest(nextDate)}}
                        disabled={status === 'wiki' || fullAccess === 'view'}
                    />
                    <View style={{flex: 1, flexDirection: 'row', marginTop: spacing.sm}}>
                        {/* <Button onPress={() => setModalVisible(false)} style={{ flex: 1, marginRight: spacing.xs }} disabled={!selectedParameter.modified || status === 'wiki' || fullAccess === 'view'}>
                            PRZYWRÓĆ
                        </Button> */}
                        <Button onPress={() => updatePlant()} style={{ flex: 1, marginLeft: spacing.xs }} disabled={saveDisabled || status === 'wiki' || fullAccess === 'view'}>
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
                            dateService={localeDateService}
                            // date={datepicker}
                            min={tomorrow}
                            max={yearLater}
                            renderDay={DayCell}
                            
                        />
                    </ScrollView> :
                    <FlatList
                        data={responseData}
                        renderItem={renderItem}
                        keyExtractor={item => item._id}
                        showsVerticalScrollIndicator={false}
                    />
                }
            </View>
        </View>
    );
}

export const Climate = ({ onTouchCategory, plantId, climateData, status, fullAccess }) => {
    const [saveDisabled, setSaveDisabled] = useState(true);
    const [modalVisible, setModalVisible] = useState(false);
    const [sliderValue, setSliderValue] = useState([40,60]);
    const [selectedParameter, setSelectedParameter] = useState(climateData[0]);
    const [selectedUnit, setSelectedUnit] = useState(undefined);
    const [actualValue, setActualValue] = useState(undefined);

    const [requestData, setRequestData] = useState(climateData);
    const [responseData, setResponseData] = useState(climateData);

    const renderItem = ({ item }) => (
        <ClimatePlantParameter onModal={onModal} data={item}/>
    );

    const onModal = (parameter) => {
        setSelectedUnit(parameter.unit);
        setSelectedParameter(parameter);
        setActualValue(parameter.actual_value);
        setSliderValue([parameter.value[0].min,parameter.value[0].max])
        setModalVisible(!modalVisible);
    }

    const createUpdateRequest = () => {
        setSaveDisabled(false);
        let tmpRequestData = requestData;
        let foundIndex = tmpRequestData.findIndex(parameter => parameter._id === selectedParameter._id);
        tmpRequestData[foundIndex].value[0].min = sliderValue[0];
        tmpRequestData[foundIndex].value[0].max = sliderValue[1];
        tmpRequestData[foundIndex].actual_value = actualValue[0];
        tmpRequestData[foundIndex].modified = true;
        setRequestData(tmpRequestData);
    }

    async function getPlant() {
        try {
            let response;
            if (status === 'own') {
                response = await API.getUserPlant(plantId, {
                    headers: {
                        'auth-token': await AsyncStorage.getItem('auth-token'),
                        'user_id': await AsyncStorage.getItem('user_id')
                    }
                });
            } else if (status === 'wiki') {
                response = await API.getPlant(plantId, {
                    headers: {
                        'auth-token': await AsyncStorage.getItem('auth-token'),
                    }
                });
            }
            if (response.status === 200) {
                if (!response.data === []) {
                    setResponseData(response.data.climate);
                }
            }
        } catch (error) {
            if (error.response.status === 400) {
                console.log(error.response.status);
            }
        }
    };

    async function updatePlant() {
        try {
            let foundIndex = requestData.findIndex(parameter => parameter._id === selectedParameter._id);
            let request = requestData[foundIndex];
            if (status === 'own' || status === 'ad') {
                const response = await API.updateUserPlantClimateParameter(plantId, requestData[foundIndex].name,
                    request,
                    {
                        headers: {
                            'auth-token': await AsyncStorage.getItem('auth-token'),
                            'user_id': await AsyncStorage.getItem('user_id')
                        }
                    }
                );
                if (response.status === 200) {
                    getPlant();
                    setModalVisible(false);
                }
            }
        } catch (error) {
            if (error.response.status === 400) {
                console.log(error.response.status);
            }
        }
    }

    return (
        <View style={styles.container}>
            <Modal backdropStyle={styles.backdrop} onBackdropPress={() => setModalVisible(false)} visible={modalVisible}>
                <View style={styles.modal}>
                    <Text style={styles.modalText}>
                        {selectedParameter.description}: od
                        <Text style={styles.modalAltText}> {sliderValue[0]}{selectedParameter.unit} </Text>do 
                        <Text style={styles.modalAltText}> {sliderValue[1]}{selectedParameter.unit} </Text>
                    </Text>
                    <Slider
                        value={sliderValue}
                        onValueChange={value => { setSliderValue(value); createUpdateRequest()}}
                        minimumValue={0}
                        maximumValue={selectedParameter.name === 'light' ? 100 : 40}
                        step={1}
                        disabled={status === 'wiki' || fullAccess === 'view'}
                    />
                    <Text style={styles.modalText}>Aktualnie: <Text style={styles.modalAltText}>{actualValue}{selectedUnit} </Text></Text>
                    <Slider
                        value={actualValue}
                        onValueChange={value => { setActualValue(value); createUpdateRequest()}}
                        minimumValue={0}
                        maximumValue={selectedParameter.name === 'light' ? 100 : 40}
                        step={1}
                        disabled={status === 'wiki' || fullAccess === 'view'}
                    />
                    <View style={{ flex: 1, flexDirection: 'row', marginTop: spacing.sm }}>
                        {/* <Button onPress={() => setModalVisible(false)} style={{ flex: 1, marginRight: spacing.xs }} disabled={!selectedParameter.modified || status === 'wiki' || fullAccess === 'view'}>
                            PRZYWRÓĆ
                        </Button> */}
                        <Button onPress={() => updatePlant()} style={{ flex: 1, marginLeft: spacing.xs }} disabled={saveDisabled || status === 'wiki' || fullAccess === 'view'}>
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
                    data={responseData}
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
        marginBottom: spacing.md,
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
        elevation: 2,
        // flex: 1,
    },
    backdrop: {
        // backgroundColor: 'rgba(0, 0, 0, 0.5)',
    },
    modal: {
        width: Dimensions.get('screen').width * 0.8,
        backgroundColor: colors.appLightBackground,
        padding: spacing.sm,
        borderRadius: rounding.xs,
        elevation: 20,
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
    },
    dayContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        aspectRatio: 1,
    },
    value: {
        marginHorizontal: 2,
        width: 5,
        height: 5,
        borderRadius: rounding.sm,
    },
});