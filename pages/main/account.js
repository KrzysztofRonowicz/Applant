import React, { useState, useEffect, useReducer } from 'react';
import { Layout, Text, Button, Icon } from '@ui-kitten/components';
import { BackHandler, View } from 'react-native';
import { AppContext } from '../../context';
import AsyncStorage from '@react-native-async-storage/async-storage'
import { colors, labels, spacing } from '../../style/base';

const Account = () => {
    const context = React.useContext(AppContext);
    const [username, setUsername] = useState('');
    const [email, setEmail] = useState('');
    
    useEffect(() => {
        getCredentials();
    }, []);

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
                borderTopWidth: 1,
                borderTopColor: '#DCDCDC',
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
            </View>
            <View>
                <Button onPress={() => {
                    // AsyncStorage.removeItem('foh-key');
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