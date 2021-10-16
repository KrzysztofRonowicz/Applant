import React, { Component, useEffect, useState } from 'react';
import { Image } from 'react-native';
import { Layout, Text } from '@ui-kitten/components';
import AsyncStorage from '@react-native-async-storage/async-storage'
import Home from '../main/home';

const Hello = ({navigation}) => {
    const [isLogged, setIsLogged] = useState(false);
    useEffect(() => {
        removeToken();
        getToken();
    }, []);

    async function removeToken() {
        try {
            await AsyncStorage.removeItem('auth-token');
            return true;
        } catch (error) {
            setTimeout(()=>navigation.navigate('Login') , 1000);
        }
    }

    async function getToken() {
        try {
            const auth_token = await AsyncStorage.getItem('auth-token');
            if (auth_token !== null) {
                setTimeout(()=> setIsLogged(true), 1000);
            } else {
                setTimeout(()=>navigation.navigate('Login') , 1000);
            }
        } catch (error) {
            setTimeout(()=>navigation.navigate('Login') , 1000);
        }
    }

    return(
        isLogged ? 
        <Home/> 
        :
        <Layout style={{flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: '#25523B', flexDirection: 'row'}}>
            <Image source={require('../../assets/applant_s.png')} style={{width: 60, height: 60, borderRadius: 10, marginRight: 20}}/>
            <Text style={{color: 'white', fontSize: 50, fontFamily: 'Courgette'}}>Applant</Text>
        </Layout>
    );
}
    


export default Hello;