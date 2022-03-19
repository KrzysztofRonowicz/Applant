import React, { useState, useEffect } from 'react';
import { Layout, Text, Button, Icon, Toggle } from '@ui-kitten/components';
import { Platform, View } from 'react-native';
import * as API from '../../api/apiMethods';
import { AppContext } from '../../context';
import AsyncStorage from '@react-native-async-storage/async-storage'
import { colors, fonts, labels, spacing } from '../../style/base';
import * as Location from 'expo-location';

const Account = () => {
    const context = React.useContext(AppContext);
    const [username, setUsername] = useState('');
    const [email, setEmail] = useState('');

    const [errorMsg, setErrorMsg] = useState(null);
    const [localizationEnabled, setLocalizationEnabled] = useState(null);

    useEffect(() => {
        getCredentials();
        getLocalizationStatus();
    },[]);
    
    useEffect(() => {
        if (localizationEnabled) {
            getCoordinates();
        } else {
            updateLocation(null, null)
        }
    }, [localizationEnabled]);

    async function updateLocation(latitude, longitude) {
        try {
            const response = await API.updateLocation(
                { 
                    latitude: latitude, longitude: longitude
                }, {
                    headers: {
                        'auth-token': await AsyncStorage.getItem('auth-token'),
                        'user_id': await AsyncStorage.getItem('user_id')
                    }
                }
            )
        } catch (error) {
            console.log(error);
        }
    }

    const getCoordinates = () => {
        let location;
        (async () => {
            let { status } = await Location.requestForegroundPermissionsAsync();
            if (status !== 'granted') {
                setErrorMsg('Permission to access location was denied');
                return;
            }

            location = await Location.getCurrentPositionAsync({});
            updateLocation(location.coords.latitude, location.coords.longitude);
        })();
    }

    async function getLocalizationStatus() {
        try {
            const localization_enabled = await AsyncStorage.getItem('localization_enabled');
            setLocalizationEnabled(JSON.parse(localization_enabled));
        } catch (error) {
            console.log(error);
        }
    }

    async function changeLocalizationStatus(status) {
        try {
            AsyncStorage.setItem('localization_enabled', status.toString());
        } catch (error) {
            console.log(error);
        }
    }

    async function getCredentials() {
        try {
            const un = await AsyncStorage.getItem('user_name');
            const ue = await AsyncStorage.getItem('user_email');
            setUsername(un);
            setEmail(ue);
        } catch (error) {
            console.log(error);
        }
    }

    return(
        <Layout
            style={{
                flex: 1,
                justifyContent: 'space-between',
                backgroundColor: '#F8F8F8',
                padding: spacing.md,
                paddingTop: spacing.sm,
            }}
        >
            <View style={{justifyContent: 'flex-start', flex: 1}}>
                <Text style={{...labels.qmd, color: colors.greenDark, marginBottom: spacing.md}}>Konto</Text>
                <View style={{ flexDirection: 'row', marginBottom: spacing.sm}}>
                    <Icon name='person' fill={colors.grayDark} style={{width: 30, height: 30}}/>
                    <Text style={{...labels.qsp, marginLeft: spacing.sm}}>{username}</Text>
                </View>
                <View style={{ flexDirection: 'row' }}>
                    <Icon name='email' fill={colors.grayDark} style={{ width: 30, height: 30 }} />
                    <Text style={{ ...labels.qsp, marginLeft: spacing.sm }}>{email}</Text>
                </View>
                <Text style={{ ...labels.qmd, color: colors.greenDark, marginVertical: spacing.md }}>Ustawienia</Text>
                <View style={{flexDirection: 'row', justifyContent: 'space-between'}}>
                    <Text style={{ fontFamily: fonts.secondary, fontSize: 20}}>Lokalizacja</Text>
                    <Toggle checked={localizationEnabled} onChange={() => {changeLocalizationStatus(!localizationEnabled); setLocalizationEnabled(!localizationEnabled);}}></Toggle>
                </View>
                
            </View>
            <View>
                <Button onPress={() => {
                    AsyncStorage.removeItem('auth-token');
                    AsyncStorage.removeItem('user_id');
                    context.setLoginState(false);
                }}>WYLOGUJ SIĘ</Button>
                <Text style={{ color: '#25523B', ...labels.csp, marginTop: spacing.md, alignSelf: 'center' }}>Applant &copy;</Text>
            </View>
            
        </Layout>
    ); 
}

export default Account;