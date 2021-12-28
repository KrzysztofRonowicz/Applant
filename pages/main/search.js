import React, { useState, useEffect } from 'react';
import { Layout, Text, Input, MenuItem, OverflowMenu, CheckBox, Toggle, Radio } from '@ui-kitten/components';
import { Icon } from 'react-native-elements'
import Plant from './plant';
import { BackHandler, StyleSheet, TouchableOpacity, View, FlatList, Dimensions, Image } from 'react-native';
import { colors, labels, spacing, rounding } from '../../style/base';
import { alertsImages } from '../../assets/alerts/alertsImages';
import AsyncStorage from '@react-native-async-storage/async-storage'
import * as API from '../../api/apiMethods';

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

const PlantAd = ({ _id, name, image, water_index, light_index, compost_index, prize, onPlantSelect, adId }) => (
    <TouchableOpacity style={styles.plantContainer} activeOpacity={.6} onPress={() => onPlantSelect(_id, adId)}>
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
    const [marketVisible, setMarketVisible] = useState(true);
    const [selectedPlant, setSelectedPlant] = useState([]);
    const [plantVisible, setPlantVisible] = useState(false);

    const {collection_id = null, collection_name = null} = route.params ?? {};

    const [responseData, setResponseData] = useState([]);
    const [responseMarketData, setResponseMarketData] = useState([]);

    const onFilterSelect = (index) => {
        setFilters(index);
        setVisibleFilters(false);
    };

    const onSortSelect = (index) => {
        setSort(index);
        setVisibleSort(false);
    };

    const onPlantSelect = (id, adId) => {
        setSelectedPlant([id, adId]);
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
        <PlantAd _id={item.plant_id} name={item.name} image={getImageUrl(item.image)} prize={item.prize} onPlantSelect={onPlantSelect} adId={item._id}/>
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
            /> :
        <Layout style={styles.layout}>
            <Input
                style={styles.input}
                value={inputValue}
                textStyle={{...labels.qsp}}
                size='large'
                placeholder='Szukaj rośliny'
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
                        <OverflowMenu
                            anchor={filterButon}
                            visible={visibleFilters}
                            selectedIndex={filters}
                            onSelect={onFilterSelect}
                            onBackdropPress={() => setVisibleFilters(false)}>
                            <MenuItem title='Users' />
                            <MenuItem title='Orders' />
                            <MenuItem title='Transactions' />
                        </OverflowMenu>
                    </View>
                    <View style={styles.filterSort}>
                        <Text style={styles.filterSortLabel}>Sortuj</Text>
                        <OverflowMenu
                            anchor={sortButon}
                            visible={visibleSort}
                            selectedIndex={sort}
                            onSelect={onSortSelect}
                            onBackdropPress={() => setVisibleSort(false)}>
                            <MenuItem title='Users' />
                            <MenuItem title='Orders' />
                            <MenuItem title='Transactions' />
                        </OverflowMenu>
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
        marginVertical: Dimensions.get('window').width * 0.03,
        backgroundColor: colors.grayBackgroundDark,
        padding: 1,
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