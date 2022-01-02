import React, { Component, useEffect, useState } from 'react';
import { Image } from 'react-native';
import { Layout, Text } from '@ui-kitten/components';
import AsyncStorage from '@react-native-async-storage/async-storage';
import Board from '../main/board';
import MainNavigator from '../main/mainNavigator';
import AuthorizationNavigator from './authorizationNavigator';
import { AppContext } from '../../context';
import { render } from 'react-dom';
import { colors } from '../../style/base';

class Hello extends React.Component {
    constructor() {
        super();
        this.state = {
            isLogged: false,
            isLoaded: false,
        };
    }

    componentDidMount() {
        setTimeout(() => this.setState({ isLoaded: true }), 1000);
        // this.removeToken();
        this.getToken();
    }

    async removeToken() {
        try {
            await AsyncStorage.removeItem('auth-token');
            await AsyncStorage.removeItem('user_id');
            await AsyncStorage.removeItem('user_name');
            await AsyncStorage.removeItem('user_email');
            return true;
        } catch (error) {
            setTimeout(()=>navigation.navigate('Login') , 1000);
        }
    }

    async getToken() {
        try {
            const auth_token = await AsyncStorage.getItem('auth-token');
            if (auth_token !== null) {
                this.setState({ isLogged: true});
            } else {
                this.setState({ isLogged: false });
            }
        } catch (error) {
            this.setState({ isLogged: false });
        }
    }

    render() {
        return(
        <AppContext.Provider value={{
            state: this.state,
            setLoginState: (state) => this.setState({ isLogged: state }),
        }}>
            
                {this.state.isLoaded == true ?
                   
                        this.state.isLogged ? (<MainNavigator />) : (<AuthorizationNavigator />)
                   
                    :
                    <Layout style={{ flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: 'white', flexDirection: 'row' }}>
                        <Image source={require('../../assets/logo2.png')} style={{ width: 69, height: 60, borderRadius: 10, marginRight: 20 }} />
                        <Text style={{ color: colors.greenDark, fontSize: 50, fontFamily: 'Courgette' }}>Applant</Text>
                    </Layout>
                }
            
        </AppContext.Provider>
        );
    }
}
    


export default Hello;