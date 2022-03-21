import React, { useState, useEffect } from 'react';
import { Layout, Text, Input, Radio, Tooltip, OverflowMenu, MenuItem } from '@ui-kitten/components';
import { Icon } from 'react-native-elements'
import Plant, { LoadingBlur } from './plant';
import { StyleSheet, TouchableOpacity, View, FlatList, Dimensions, Image } from 'react-native';
import { colors, labels, spacing, rounding } from '../../style/base';
import { alertsImages } from '../../assets/alerts/alertsImages';
import AsyncStorage from '@react-native-async-storage/async-storage'
import * as API from '../../api/apiMethods';
import LottieView from 'lottie-react-native';
import { useFocusEffect } from '@react-navigation/native';
import { Slider } from '@miblanchard/react-native-slider';
import { getDistance } from 'geolib';
import * as Location from 'expo-location';

const PlantAdParameters = ({ prize, water_index, light_index, compost_index }) => {
    return (
        prize ? 
        <View style={styles.plantParameters}>
            <Text style={styles.level}>{prize} zł</Text>
        </View> :
        <View style={styles.plantParameters}>
            <Image style={styles.plantParameterImage} source={alertsImages('water')} />
                <Text style={styles.level}>{water_index}</Text>
            <Image style={styles.plantParameterImage} source={alertsImages('light')} />
                <Text style={styles.level}>{light_index}</Text>
            <Image style={styles.plantParameterImage} source={alertsImages('compost')} />
                <Text style={styles.level}>{compost_index}</Text>
        </View>
    );
}

const PlantAd = ({ _id, name, image, water_index, light_index, compost_index, prize, onPlantSelect, adId, rawImage, note }) => (
    <TouchableOpacity style={styles.plantContainer} activeOpacity={.6} onPress={() => onPlantSelect(_id, adId, name, prize, rawImage, note)}>
        <View style={styles.plantImageContainer}>
            <Image style={styles.plantImage} source={{ uri: image}}/>
            <PlantAdParameters water_index={water_index} light_index={light_index} compost_index={compost_index} prize={prize}/>
        </View>
        <View style={{flex: 1, justifyContent: 'center'}}>
            <Text numberOfLines={1} ellipsizeMode='tail' style={styles.name}>{name}</Text>
        </View>
    </TouchableOpacity>
);

const Search = ({route, navigation}) => {
    const [inputValue, setInputValue] = useState('');
    const [isFetchingData, setIsFetchingData] = useState(false);
    const [localization, setLocalization] = useState(false);
    const [Od, setOd] = useState(null);
    const [Do, setDo] = useState(null);
    const [marketVisible, setMarketVisible] = useState(false);
    const [selectedPlant, setSelectedPlant] = useState([]);
    const [plantVisible, setPlantVisible] = useState(false);
    const [slider, setSlider] = useState([50]);

    const [filterVisible, setFilterVisible] = useState(false);
    const [sortVisible, setSortVisible] = useState(false);

    const [selectedSort, setSelectedSort] = useState('');

    const {collection_id = null, collection_name = null} = route.params ?? {};

    const [responseData, setResponseData] = useState([]);
    const [responseMarketData, setResponseMarketData] = useState([]);

    useEffect(() => {
        searchPlant(inputValue, selectedSort);
        searchMarketPlant(inputValue, Od, Do, selectedSort);
    }, []);

    useFocusEffect(
        React.useCallback(() => {

            return () => {
                setTimeout(() => {
                    setPlantVisible(false);
                    setMarketVisible(false);
                    setFilterVisible(false);
                    setSortVisible(false);
                }, 100);
            };
        }, [])
    );

    const onParameterSelect = (state, name) => {
        if (!state) {
            setFilterVisible(false);
            setSortVisible(false);
        }
        if (name === 'filter' && state && !sortVisible) {
            setFilterVisible(true);
        }
        if (name === 'sort' && state && !filterVisible) {
            setSortVisible(true);
        }
        if (state) {
            if (filterVisible) {
                setFilterVisible(false);
                setSortVisible(true);
            }
            if (sortVisible) {
                setFilterVisible(true);
                setSortVisible(false);
            }
        } 
    };

    async function onPrizeChanged(text, name) {
        if (text !== '' || text !== '0' && text !== '00' && text.toString() !== '000') {
            if (name === 'od') {
                if (Number(Do) >= Number(text)) { 
                    await setOd(text.replace(/[^0-9]/g, ''));
                    // setTimeout(() => {
                    //     searchMarketPlant(inputValue, text, Do, selectedSort)
                    // }, 1000); 
                };
            }
            if (name === 'do') {
                if (Number(Od) <= Number(text)) { 
                    await setDo(text.replace(/[^0-9]/g, '')); 
                    // setTimeout(() => {
                    //     searchMarketPlant(inputValue, Od, text, selectedSort)
                    // }, 1000);
                };
            }
        } else {
            if (name === 'od') {
                setOd(null);
            }
            if (name === 'do') {
                setDo(null);
            }
        }
    }

    const filterPrizeResponseData = (responseData, Od, Do) => {
        setIsFetchingData(true);
        if (Do) {
            let tmpResponseData = [];
            let tmpOd;
            if (Od == null) {tmpOd = 0;} else {tmpOd = Od};
            for (let index = 0; index < responseData.length; index++) {
                const prize = Number(responseData[index].prize);
                if (prize >= Number(tmpOd) && prize <= Number(Do)) {
                    tmpResponseData.push(responseData[index]);
                }
            }
            return tmpResponseData;
        } else {
            return responseData;
        }
    }

    async function getCoordinates() {
        setIsFetchingData(true);
        let location;
        try {
            location = await Location.getCurrentPositionAsync({});
            return { latitude: JSON.parse(location.coords.latitude), longitude: JSON.parse(location.coords.longitude) }
        } catch (error) {
            console.log(error);
        }
    }

    async function getLocalizationEnabled() {
        setIsFetchingData(true);
        try {
            const enabled = await AsyncStorage.getItem('localization_enabled');
            return enabled;
        } catch (error) {
            console.log(error);
        }
    }

    async function filterDistanceResponseData (responseData) {
        setIsFetchingData(true);
        let localization_enabled;
        try {
            localization_enabled = await getLocalizationEnabled();
        } catch (error) {
            console.log(error);
        }
        setLocalization(localization_enabled);
        if (localization_enabled === 'true') {
            let tmpResponseData = [];
            let position;
            try {
                position = await getCoordinates();
            } catch (error) {
                console.log(error);
            }
            for (let index = 0; index < responseData.length; index++) {
                if (responseData[index].latitude && responseData[index].longitude) {
                    const distance = getDistance(
                        { latitude: position.latitude, longitude: position.longitude },
                        { latitude: responseData[index].latitude, longitude: responseData[index].longitude }
                    );
                    if (distance <= slider[0] * 1000) {
                        let tmpPlant = responseData[index];
                        tmpPlant.distance = distance;
                        tmpResponseData.push(tmpPlant);
                    }
                }
            }
            return tmpResponseData;
        } else {
            return responseData;
        }
    }

    async function sortResponseData(responseData, parameter) {
        if (marketVisible) {
            if (parameter === 'Rosnąco') {
                return responseData.sort(
                    function (a, b) {
                        return a.prize - b.prize;
                    }
                );
            }
            if (parameter === 'Rosnąco') {
                return responseData.sort(
                    function (a, b) {
                        return a.prize - b.prize;
                    }
                );
            }
            if (parameter === 'Dalej') {
                return responseData.sort(
                    function (a, b) {
                        return b.distance - a.distance;
                    }
                );
            }
            if (parameter === 'Bliżej') {
                return responseData.sort(
                    function (a, b) {
                        return a.distance - b.distance;
                    }
                );
            }
        }
        if (parameter === 'Łatwiejsze') {
            return responseData.sort(
                function (a, b) {
                    const diffA = a.water_index + a.light_index + a.compost_index;
                    const diffB = b.water_index + b.light_index + b.compost_index;
                    return diffA - diffB;
                }
            );
        }
        if (parameter === 'Trudniejsze') {
            return responseData.sort(
                function (a, b) {
                    const diffA = a.water_index + a.light_index + a.compost_index;
                    const diffB = b.water_index + b.light_index + b.compost_index;
                    return diffB - diffA;
                }
            );
        }
        if (parameter === 'A-Z') {
            return responseData.sort(
                function (a, b) {
                    const x = a.name.toLowerCase();
                    const y = b.name.toLowerCase();
                    return x < y ? -1 : x > y ? 1 : 0;
                }
            );
        }
        if (parameter === 'Z-A') {
            return responseData.sort(
                function (a, b) {
                    const x = a.name.toLowerCase();
                    const y = b.name.toLowerCase();
                    return x > y ? -1 : x < y ? 1 : 0;
                }
            );
        }
        return responseData;
    }

    const onRadioChange = (state) => {
        setMarketVisible(state);
        if (state) {
            searchMarketPlant(inputValue, Od, Do, selectedSort);
        } else {
            searchPlant(inputValue, selectedSort);
        }
    }

    const onSortSelect = (name) => {
        if (selectedSort === name) {
            setSelectedSort('');
            marketVisible ? searchMarketPlant(inputValue, Od, Do, '') : searchPlant(inputValue, '');
        } else {
            marketVisible ? searchMarketPlant(inputValue, Od, Do, name) : searchPlant(inputValue, name);
            setSelectedSort(name);
        }
    };

    const onPlantSelect = (id, adId, name, prize, image, note) => {
        setSelectedPlant([id, adId, name, prize, image, note]);
        setPlantVisible(true);
    };

    const onPlantClose = () => {
        navigation.setParams({
            collection_id: null,
            collection_name: null,
        })
        setPlantVisible(false);
    };

    const getImageUrl = (id) => {
        return 'https://drive.google.com/uc?id=' + id;
    };

    const renderItem = ({ item }) => (
        <PlantAd 
            _id={item._id}
            name={item.name} 
            image={getImageUrl(item.image)} 
            water_index={item.water_index} 
            light_index={item.light_index} 
            compost_index={item.compost_index}
            onPlantSelect={onPlantSelect}
            note=''
        />
    );

    const renderMarketItem = ({ item }) => (
        <PlantAd _id={item.plant_id} name={item.name} rawImage={item.image} image={getImageUrl(item.image)} prize={item.prize} note={item.note} onPlantSelect={onPlantSelect} adId={item._id}/>
    );

    const Parameter = ({text}) => {
        return(
            <TouchableOpacity activeOpacity={1} onPress={() => onSortSelect(text)}>
                <View style={[styles.parameterButton, selectedSort === text ? { backgroundColor: colors.greenDark } : { backgroundColor: colors.appLightBackground }]}>
                    <Text style={[{ ...labels.qxs, fontWeight: 'bold' }, selectedSort === text ? { color: colors.white } : { color: colors.greenDark }]}>{text}</Text>
                </View>
            </TouchableOpacity>
        );
    } 

    async function searchPlant(nextValue, sortType){
        setResponseMarketData([]);
        setInputValue(nextValue);
        setIsFetchingData(true);
        try {
            let response = await API.searchPlants( nextValue ,{
                headers: {
                    'auth-token': await AsyncStorage.getItem('auth-token')
                }
            });
            if (response.status === 200) {
                if (response.data === []) {
                    setResponseData([]);
                } else {
                    const data = await sortResponseData(response.data, sortType);
                    setResponseData(data);
                    setIsFetchingData(false);
                }
            }
        } catch (error) {
            if (error.response.status === 400) {
                console.log(error.response.status);
            }
        }
    };

    async function searchMarketPlant(nextValue, Od, Do, sortType) {
        setInputValue(nextValue);
        setIsFetchingData(true);
        try {
            let response = await API.searchAds(nextValue, {
                headers: {
                    'auth-token': await AsyncStorage.getItem('auth-token')
                }
            });
            if (response.status === 200) {
                let data = filterPrizeResponseData(response.data, Od, Do);
                try {
                    data = await filterDistanceResponseData(data);
                    data = await sortResponseData(data, sortType);
                    setResponseMarketData(data);
                    setIsFetchingData(false);
                } catch (error) {
                    console.log(error);
                }
            }
        } catch (error) {
            if (error.response.status === 400) {
                console.log(error.response.status);
            }
        }
    };

    return(
        plantVisible ?
            <Plant 
                plantId={selectedPlant[0]} 
                onClose={onPlantClose} 
                status={marketVisible ? 'ad' : 'wiki'} 
                adId={selectedPlant[1]}
                roomName={collection_name}
                roomId={collection_id}
                ad={{
                    plant_id: selectedPlant[0],
                    _id: selectedPlant[1],
                    name: selectedPlant[2],
                    prize: selectedPlant[3],
                    image: selectedPlant[4],
                    note: selectedPlant[5],
                }}
            /> :
        <Layout style={styles.layout}>
            <Input
                style={styles.input}
                value={inputValue}
                textStyle={{...labels.qsp}}
                size='large'
                placeholder={marketVisible ? 'Szukaj ogłoszenia' : 'Szukaj rośliny'}
                onChangeText={nextValue => marketVisible ? searchMarketPlant(nextValue, Od, Do, selectedSort) : searchPlant(nextValue, selectedSort)}
            />
            <View style={styles.filterSortContainer}>
                <View style={{ flexDirection: 'row' }}>
                    <Icon type='material' name='storefront' size={30} color={colors.greenDark} style={{marginRight: spacing.sm}}/>
                    <Radio
                        checked={marketVisible}
                        onChange={nextChecked => {
                            setFilterVisible(false);
                            setSortVisible(false);
                            onRadioChange(nextChecked);
                        }}>
                    </Radio>
                </View>
                <View style={{flexDirection: 'row'}}>
                    <View style={[styles.filterSort, filterVisible ? {borderBottomWidth: 2, borderBottomColor: colors.greenDark} : <></>]}>
                        <TouchableOpacity disabled={!marketVisible} activeOpacity={1} style={[{flexDirection: 'row'}, marketVisible ? {} : {opacity: .5}]} 
                        onPress={() => onParameterSelect(!filterVisible, 'filter')}>
                            <Text style={styles.filterSortLabel}>Filtruj</Text>
                            <Icon type='material' name='filter-list' size={26} color={colors.greenDark} />
                        </TouchableOpacity>
                    </View>
                        <View style={[styles.filterSort, sortVisible ? { borderBottomWidth: 2, borderBottomColor: colors.greenDark }: <></>]}>
                            <TouchableOpacity activeOpacity={1} style={{ flexDirection: 'row' }} onPress={() => onParameterSelect(!sortVisible, 'sort')}>
                            <Text style={styles.filterSortLabel}>Sortuj</Text>
                            <Icon type='material' name='sort' size={26} color={colors.greenDark} />
                        </TouchableOpacity>
                    </View>
                </View> 
            </View>
            {filterVisible && !sortVisible? 
            <View style={styles.filterSortParameterContainer}>
                <Text style={{ ...labels.qsp, color: colors.greenDark, textAlign: 'center' }}>Cena (zł)</Text>
                <View style={{ flexDirection: 'row', paddingTop: 10, paddingBottom: 5, justifyContent: 'center' }}>
                    <Input
                        style={{ marginRight: spacing.sm, minWidth: 70, marginLeft: 5, elevation: 2 }}
                        textStyle={{ ...labels.qsp }}
                        size='small'
                        placeholder={'0'}
                        value={Od}
                        keyboardType='numeric'
                        onChangeText={(text) => onPrizeChanged(text, 'od')}
                        maxLength={3}
                        onSubmitEditing={() => searchMarketPlant(inputValue, Od, Do, selectedSort) }
                    />
                    <Text style={{ ...labels.qsp, color: colors.greenDark, alignSelf: 'center' }}>-</Text>
                    <Input
                        style={{ marginLeft: spacing.sm, minWidth: 70, elevation: 2 }}
                        textStyle={{ ...labels.qsp }}
                        size='small'
                        placeholder={'999'}
                        value={Do}
                        keyboardType='numeric'
                        onChangeText={(text) => onPrizeChanged(text, 'do')}
                        maxLength={3}
                        onSubmitEditing={() => searchMarketPlant(inputValue, Od, Do, selectedSort)}
                    />
                </View>
                <View style={{ paddingTop: spacing.xs }}>
                    <Text style={[{ ...labels.qsp, color: colors.greenDark, textAlign: 'center' }, localization === 'false' ? { opacity: 0.5 } : <></>]}>Odległość: {slider} (km)</Text>
                    <View style={{ flexDirection: 'row' }}>
                        <Slider
                            containerStyle={{ flex: 1, marginHorizontal: spacing.xs }}
                            value={slider}
                            onValueChange={value => { setSlider(value)}}
                            onSlidingComplete={() => { setIsFetchingData(true); searchMarketPlant(inputValue, Od, Do, selectedSort)} }
                            minimumValue={1}
                            maximumValue={50}
                            step={1}
                            thumbTintColor={colors.greenDark}
                            disabled={localization === 'false'}
                        />
                    </View>
                </View>
            </View> : <></>
            }
            {!filterVisible && sortVisible?
                <View style={[styles.filterSortParameterContainer, marketVisible ? {height: 150} : {height: 75}]}>
                    {marketVisible ? 
                    <View style={{ flexDirection: 'row' }}>
                        <View style={{ flex: 5 }}>
                            <Text style={{ ...labels.qsp, color: colors.greenDark, textAlign: 'center' }}>Cena</Text>
                            <View style={{ flexDirection: 'row', paddingTop: 10, paddingBottom: 5, justifyContent: 'center' }}>
                                <Parameter text='Rosnąco' checked={false} />
                                <Parameter text='Malejąco' checked={false} />
                            </View>
                        </View>
                        <View style={{ flex: 4 }}>
                            <Text style={{ ...labels.qsp, color: colors.greenDark, textAlign: 'center' }}>Odległość</Text>
                            <View style={{ flexDirection: 'row', paddingTop: 10, paddingBottom: 5, justifyContent: 'center' }}>
                                <Parameter text='Dalej' checked={false} />
                                <Parameter text='Bliżej' checked={true} />
                            </View>
                        </View>
                    </View> : <></>
                    }
                    <View style={{ flexDirection: 'row', marginBottom: 5 }}>
                        <View style={{ flex: 5 }}>
                            <Text style={{ ...labels.qsp, color: colors.greenDark, textAlign: 'center' }}>Trudność</Text>
                            <View style={{ flexDirection: 'row', paddingTop: 10, paddingBottom: 5, justifyContent: 'center' }}>
                                <Parameter text='Łatwiejsze' checked={false} />
                                <Parameter text='Trudniejsze' checked={false} />
                            </View>
                        </View>
                        <View style={{ flex: 4 }}>
                            <Text style={{ ...labels.qsp, color: colors.greenDark, textAlign: 'center' }}>Alfabetycznie</Text>
                            <View style={{ flexDirection: 'row', paddingTop: 10, paddingBottom: 5, justifyContent: 'center' }}>
                                <Parameter text='A-Z' checked={false} />
                                <Parameter text='Z-A' checked={true} />
                            </View>
                        </View>
                    </View>
                </View> : <></>
            }
            {isFetchingData ? <View style={{flex: 1}}><LoadingBlur isFetching={true}/></View> : 
                <FlatList
                    data={marketVisible ? responseMarketData : responseData}
                    renderItem={marketVisible ? renderMarketItem : renderItem}
                    numColumns={2}
                    columnWrapperStyle={{justifyContent: 'space-between'}}
                    keyExtractor={item => item._id}
                    showsVerticalScrollIndicator={false}
                    ListEmptyComponent={
                        <View style={{ justifyContent: 'center', flex: 1, alignItems: 'center', marginTop: -50 }}>
                            <View>
                                <LottieView style={{ height: 200 }} source={require('../../assets/lottie/61372-404-error-not-found.json')} autoPlay loop /> 
                            </View>
                            <View style={{ marginTop: spacing.sm, alignItems: 'center' }}>
                                <Text style={{ ...labels.qsp, fontWeight: 'bold' }}>Nie znaleziono :(</Text>
                                <Text style={{ ...labels.qsp, textAlign: 'center' }}>Spróbuj innych parametrów lub nazwy</Text>
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
        backgroundColor: colors.appLightBackground,
        // borderTopWidth: 1,
        // borderTopColor: '#DCDCDC',
        paddingHorizontal: spacing.md,
        paddingTop: spacing.md
    },
    input: {
        backgroundColor: colors.appLightBackground,
        elevation: 5,
        borderWidth: 1,
        borderColor: colors.grayMedium,
    },
    filterSortContainer: {
        marginVertical: spacing.md,
        flexDirection: 'row',
        justifyContent: 'space-between',
    },
    filterSort: {
        flexDirection: 'row',
        alignItems: 'center',
        marginLeft: spacing.sm,
    },
    filterSortLabel: {
        ...labels.qsp,
        color: colors.greenDark,
        marginRight: spacing.sm,
    },
    plantContainer: {
        width: Dimensions.get('window').width * 0.42,
        aspectRatio: 0.7,
        borderWidth: 2,
        borderRadius: rounding.sm,
        borderColor: colors.grayMedium,
        marginHorizontal: spacing.xs,
        marginVertical: Dimensions.get('window').width * 0.02,
        backgroundColor: colors.grayBackgroundDark,
        padding: 1,
        elevation: 5,
    },
    plantImageContainer: {
        width: '100%',
        aspectRatio: 0.8,
        backgroundColor: colors.grayBackgroundLight,
        borderRadius: rounding.sm,
    },
    plantImage: {
        flex: 1,
        borderTopLeftRadius: rounding.sm,
        borderTopRightRadius: rounding.sm,
    },
    plantParameters: {
        height: 30,
        flexDirection: 'row',
        justifyContent: 'space-around',
        alignItems: 'center', 
        alignContent: 'center',
        backgroundColor: colors.grayBackgroundLight,
        paddingRight: spacing.xs,
    },
    plantParameterImage: {
        width: 24,
        height: 24,
        opacity: .4,
    },
    level: {
        ...labels.qsm,
        fontWeight: 'bold',
        opacity: .4,
    },
    name: {
        ...labels.qsm,
        // alignSelf: 'center',
        textAlign: 'center',
        paddingHorizontal: spacing.xs,

    },
    filterSortParameterContainer: {
        borderRadius: rounding.sm,
        backgroundColor: colors.appLightBackground,
        // borderWidth: 2,
        // borderColor: colors.greenDark,
        width: '100%',
        marginBottom: spacing.sm,
        paddingHorizontal: spacing.sm,
        paddingVertical: 5,
        elevation: 3
    },
    parameterButton: {
        borderRadius: rounding.sm, 
        paddingHorizontal: spacing.sm, 
        paddingVertical: spacing.xs, 
        elevation: 5,
        marginHorizontal: 4,
    }
});

export default Search;