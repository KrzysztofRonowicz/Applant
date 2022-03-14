import React, { useState, useEffect } from 'react';
import { Layout, Text, Input, Radio, Tooltip } from '@ui-kitten/components';
import { Icon } from 'react-native-elements'
import Plant from './plant';
import { StyleSheet, TouchableOpacity, View, FlatList, Dimensions, Image } from 'react-native';
import { colors, labels, spacing, rounding } from '../../style/base';
import { alertsImages } from '../../assets/alerts/alertsImages';
import AsyncStorage from '@react-native-async-storage/async-storage'
import * as API from '../../api/apiMethods';
import LottieView from 'lottie-react-native';
import { useFocusEffect } from '@react-navigation/native';

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

const PlantAd = ({ _id, name, image, water_index, light_index, compost_index, prize, onPlantSelect, adId, rawImage }) => (
    <TouchableOpacity style={styles.plantContainer} activeOpacity={.6} onPress={() => onPlantSelect(_id, adId, name, prize, rawImage)}>
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
    const [visibleFilters, setVisibleFilters] = useState(false);
    const [visibleSort, setVisibleSort] = useState(false);
    const [filters, setFilters] = useState(null);
    const [sort, setSort] = useState(null);
    const [marketVisible, setMarketVisible] = useState(false);
    const [selectedPlant, setSelectedPlant] = useState([]);
    const [plantVisible, setPlantVisible] = useState(false);

    const {collection_id = null, collection_name = null} = route.params ?? {};

    const [responseData, setResponseData] = useState([]);
    const [responseMarketData, setResponseMarketData] = useState([]);

    useEffect(() => {
        searchPlant(inputValue);
        searchMarketPlant(inputValue);
    }, [marketVisible]);

    useFocusEffect(
        React.useCallback(() => {

            return () => {
                setTimeout(() => {
                    setPlantVisible(false);
                }, 100);
            };
        }, [])
    );

    const onFilterSelect = (index) => {
        setFilters(index);
        setVisibleFilters(false);
    };

    const onSortSelect = (index) => {
        setSort(index);
        setVisibleSort(false);
    };

    const onPlantSelect = (id, adId, name, prize, image) => {
        setSelectedPlant([id, adId, name, prize, image]);
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
            name={item.species_name} 
            image={getImageUrl(item.image)} 
            water_index={item.water_index} 
            light_index={item.light_index} 
            compost_index={item.compost_index}
            onPlantSelect={onPlantSelect}
        />
    );

    const renderMarketItem = ({ item }) => (
        <PlantAd _id={item.plant_id} name={item.name} rawImage={item.image} image={getImageUrl(item.image)} prize={item.prize} onPlantSelect={onPlantSelect} adId={item._id}/>
    );

    const filterButon = () => (
        <TouchableOpacity onPress={() => setVisibleFilters(true)}>
            <Icon type='material' name='filter-list' size={26} color={colors.greenDark} />
        </TouchableOpacity>
    );

    const sortButon = () => (
        <TouchableOpacity onPress={() => setVisibleSort(true)}>
            <Icon type='material' name='sort' size={26} color={colors.greenDark} />
        </TouchableOpacity>
    );

    async function searchPlant(nextValue){
        setInputValue(nextValue);
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
                    setResponseData(response.data);
                }
            }
        } catch (error) {
            if (error.response.status === 400) {
                console.log(error.response.status);
            }
        }
    };

    async function searchMarketPlant(nextValue) {
        setInputValue(nextValue);
        try {
            let response = await API.searchAds(nextValue, {
                headers: {
                    'auth-token': await AsyncStorage.getItem('auth-token')
                }
            });
            if (response.status === 200) {
                setResponseMarketData(response.data);
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
                }}
            /> :
        <Layout style={styles.layout}>
            <Input
                style={styles.input}
                value={inputValue}
                textStyle={{...labels.qsp}}
                size='large'
                placeholder={marketVisible ? 'Szukaj ogłoszenia' : 'Szukaj rośliny'}
                onChangeText={nextValue => marketVisible ? searchMarketPlant(nextValue) : searchPlant(nextValue)}
            />
            <View style={styles.filterSortContainer}>
                <View style={{ flexDirection: 'row' }}>
                    <Icon type='material' name='storefront' size={30} color={colors.greenDark} style={{marginRight: spacing.sm}}/>
                    <Radio
                        checked={marketVisible}
                        onChange={nextChecked => {
                            setMarketVisible(nextChecked);
                        }}>
                    </Radio>
                </View>
                <View style={{flexDirection: 'row'}}>
                    <View style={styles.filterSort}>
                        <Text style={styles.filterSortLabel}>Filtruj</Text>
                        {/* <OverflowMenu
                            anchor={filterButon}
                            visible={visibleFilters}
                            selectedIndex={filters}
                            onSelect={onFilterSelect}
                            onBackdropPress={() => setVisibleFilters(false)}>
                            <MenuItem title='Users' />
                            <MenuItem title='Orders' />
                            <MenuItem title='Transactions' />
                        </OverflowMenu> */}
                            <Tooltip
                                anchor={filterButon}
                                visible={visibleFilters}
                                onBackdropPress={() => setVisibleFilters(false)}>
                                Dostępne wkrótce!
                            </Tooltip>
                    </View>
                    <View style={styles.filterSort}>
                        <Text style={styles.filterSortLabel}>Sortuj</Text>
                        {/* <OverflowMenu
                            anchor={sortButon}
                            visible={visibleSort}
                            selectedIndex={sort}
                            onSelect={onSortSelect}
                            onBackdropPress={() => setVisibleSort(false)}>
                            <MenuItem title='Users' />
                            <MenuItem title='Orders' />
                            <MenuItem title='Transactions' />
                        </OverflowMenu> */}
                            <Tooltip
                                anchor={sortButon}
                                visible={visibleSort}
                                onBackdropPress={() => setVisibleSort(false)}>
                                Dostępne wkrótce!
                            </Tooltip>
                    </View>
                </View> 
            </View>
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
                            <Text style={{ ...labels.qsp }}>Spróbuj innej nazwy</Text>
                        </View>
                    </View>}
                contentContainerStyle={{ flexGrow: 1 }}
            />
        </Layout>
    ); 
}

const styles = StyleSheet.create({
    layout: {
        flex: 1,
        backgroundColor: colors.appLightBackground,
        borderTopWidth: 1,
        borderTopColor: '#DCDCDC',
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
        alignSelf: 'center',
        paddingHorizontal: spacing.xs,
    },
});

export default Search;