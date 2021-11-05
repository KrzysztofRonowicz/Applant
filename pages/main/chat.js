import React, { useState, useEffect } from 'react';
import { Layout, Text } from '@ui-kitten/components';
import { BackHandler } from 'react-native';

const Chat = () => {
    // const handleBackButton = () => {
    //     BackHandler.exitApp();
    //     return true;
    // }

    // useEffect(() => {
    //     BackHandler.addEventListener('hardwareBackPress', handleBackButton);
    // }, []);

    return(
        <Layout
            style={{
                flex: 1,
                justifyContent: 'center',
                alignItems: 'center',
                backgroundColor: '#F8F8F8',
                flexDirection: 'row',
                borderTopWidth: 1,
                borderTopColor: '#DCDCDC'
            }}
        >
            <Text style={{ color: '#25523B', fontSize: 50, fontFamily: 'Courgette' }}>Home</Text>
        </Layout>
    ); 
}

export default Chat;