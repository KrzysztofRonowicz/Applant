import React, { useState, useEffect } from 'react';
import { Layout, Text, MenuItem, OverflowMenu, Input } from '@ui-kitten/components';
import { BackHandler, StyleSheet, View, FlatList, TouchableOpacity, Image, Dimensions } from 'react-native';
import { labels, colors, spacing, rounding } from '../../style/base';

const Plant = ({navigation}) => {
    const[plantName, setPlantName] = useState('');

    return (
        <Layout style={styles.layout}>
            <View style={styles.container}>
                <View style={styles.imageContainer}>
                    <TouchableOpacity 
                        style={{position: 'absolute', right: 20, top: 20, width: 40, height: 40, backgroundColor: 'steelblue'}}
                        onPress={() => navigation.goBack()}
                    >

                    </TouchableOpacity>
                </View>
                <View style={styles.details}>
                    <Input
                        textStyle={{color: colors.blueLabel, ...labels.qsm, fontWeight: 'bold'}}
                        style={styles.plantNameInput}
                        placeholder='Nazwa rośliny'
                        value={plantName}
                        onChangeText={nextValue => setPlantName(nextValue)}
                        autoCorrect={false}
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
        height: '100%',
        marginTop: spacing.xs,
        borderTopWidth: 2,
        // borderTopColor: colors.greenDark,
        borderTopColor: colors.blueLabel,
        backgroundColor: colors.grayBackgroundDark,
        paddingHorizontal: spacing.md,
        paddingVertical: spacing.sm,
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

export default Plant;