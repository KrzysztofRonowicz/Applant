import React, { useState, useEffect } from 'react';
import { Layout, Text, Input, MenuItem, OverflowMenu, CheckBox, Toggle, Radio } from '@ui-kitten/components';
import { Icon } from 'react-native-elements'
import { BackHandler, StyleSheet, TouchableOpacity, View, FlatList, Dimensions, Image } from 'react-native';
import { colors, labels, spacing, rounding } from '../../style/base';
import { alertsImages } from '../../assets/alerts/alertsImages';

const DATA = [
    {
        name: 'Monstera',
        params: 
        {
            water: '6',
            light: '10',
            compost: '8',
        }
    },
    {
        name: 'Filodendron',
        params:
        {
            water: '4',
            light: '6',
            compost: '8',
        }
    },
    {
        name: 'Aloes',
        params:
        {
            water: '2',
            light: '8',
            compost: '5',
        }
    },
    {
        name: 'Filodendron',
        params:
        {
            water: '4',
            light: '6',
            compost: '8',
        }
    },
    {
        name: 'Aloes',
        params:
        {
            water: '2',
            light: '8',
            compost: '5',
        }
    },
];

const StoreDATA = [
    {
        name: 'Monstera',
        prize: '60'
    },
    {
        name: 'Filodendron',
        prize: '40'
    },
    {
        name: 'Aloes',
        prize: '15'
    },
    {
        name: 'Monstera',
        prize: '60'
    },
    {
        name: 'Filodendron',
        prize: '40'
    },
    {
        name: 'Aloes',
        prize: '15'
    },
];

const PlantParameters = ({ prize, params }) => {
    return (
        prize ? 
        <View style={styles.plantParameters}>
            <Text style={styles.level}>{prize} zł</Text>
        </View> :
        <View style={styles.plantParameters}>
            <Image style={styles.plantParameterImage} source={alertsImages('water')} />
            <Text style={styles.level}>{params.water}</Text>
            <Image style={styles.plantParameterImage} source={alertsImages('light')} />
            <Text style={styles.level}>{params.light}</Text>
            <Image style={styles.plantParameterImage} source={alertsImages('compost')} />
            <Text style={styles.level}>{params.compost}</Text>
        </View>
    );
}

const Plant = ({ name, params, prize }) => (
    <TouchableOpacity style={styles.plantContainer} activeOpacity={.6}>
        <View style={styles.plantImageContainer}>
            <View style={styles.plantImage}>

            </View>
            <PlantParameters name={name} params={params} prize={prize}/>
        </View>
        <View style={{flex: 1, justifyContent: 'center'}}>
            <Text style={styles.name}>{name}</Text>
        </View>
    </TouchableOpacity>
);

const Search = () => {
    const [inputValue, setInputValue] = useState('');
    const [visibleFilters, setVisibleFilters] = useState(false);
    const [visibleSort, setVisibleSort] = useState(false);
    const [filters, setFilters] = useState(null);
    const [sort, setSort] = useState(null);
    const [marketVisible, setMarketVisible] = useState(false);

    const onFilterSelect = (index) => {
        setFilters(index);
        setVisibleFilters(false);
    };

    const onSortSelect = (index) => {
        setSort(index);
        setVisibleSort(false);
    };

    const renderItem = ({ item }) => (
        <Plant name={item.name} params={item.params} />
    );

    const renderMarketItem = ({ item }) => (
        <Plant name={item.name} prize={item.prize} />
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

    return(
        <Layout style={styles.layout}>
            <Input
                style={styles.input}
                value={inputValue}
                textStyle={{...labels.qsp}}
                size='large'
                placeholder='Szukaj rośliny'
                onChangeText={nextValue => setInputValue(nextValue)}
            />
            <View style={styles.filterSortContainer}>
                <View style={{ flexDirection: 'row' }}>
                    <Icon type='material' name='storefront' size={30} color={colors.greenDark} style={{marginRight: spacing.sm}}/>
                    <Radio
                        checked={marketVisible}
                        onChange={nextChecked => setMarketVisible(nextChecked)}>
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
                data={marketVisible ? StoreDATA : DATA}
                renderItem={marketVisible ? renderMarketItem : renderItem}
                numColumns={2}
                columnWrapperStyle={{justifyContent: 'space-between'}}
                keyExtractor={item => item.name}
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
    },
});

export default Search;