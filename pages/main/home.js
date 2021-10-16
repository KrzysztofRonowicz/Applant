import React, { useState, useEffect } from 'react';
import { Layout, Text } from '@ui-kitten/components';
import { BackHandler } from 'react-native';

const Home = () => {
    const handleBackButton = () => {
        BackHandler.exitApp();
        return true;
    }

    useEffect(() => {
        BackHandler.addEventListener('hardwareBackPress', handleBackButton);
    }, []);

    return(
        <Layout style={{flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: '#25523B', flexDirection: 'row'}}>
            <Text style={{color: 'white', fontSize: 50, fontFamily: 'Courgette'}}>Home</Text>
        </Layout>
    ); 
}

export default Home;