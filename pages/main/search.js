import React, { useState, useEffect } from 'react';
import { Layout, Text, Input } from '@ui-kitten/components';
import { Icon } from 'react-native-elements'
import { BackHandler, StyleSheet } from 'react-native';
import { colors, labels, spacing } from '../../style/base';

const Search = () => {
    const [inputValue, setInputValue] = useState('');

    return(
        <Layout style={styles.layout}>
            <Input
                style={styles.input}
                value={inputValue}
                textStyle={{...labels.qsp}}
                size='large'
                placeholder='Szukaj rośliny'
                // accessoryRight={<Icon type='material' name={'search'} size={28} color={colors.greenDark} />}
                onChangeText={nextValue => setInputValue(nextValue)}
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
        flex: 1,
        backgroundColor: colors.appLightBackground,
        elevation: 5,
        borderWidth: 1,
        borderColor: colors.grayMedium,
    },
});

export default Search;