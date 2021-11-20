import React, { useEffect, useState } from 'react';
import { TouchableWithoutFeedback, StyleSheet, View, Image, Keyboard, BackHandler, TouchableOpacity } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage'
import * as API from '../../api/apiMethods';
import { Layout, Text, Icon, Input, Button, CheckBox } from '@ui-kitten/components';
import Board from '../main/board';

const AlertIcon = (props) => (
    <Icon {...props} name='alert-circle-outline'/>
);

const Registration = ({navigation}) => {
    const [name, setName] = useState('');
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [errorMessage, setErrorMessage] = useState('');
    const [errorPath, setErrorPath] = useState('');
    const [secureTextEntry, setSecureTextEntry] = useState(true);
    const [termsChecked, setTermsChecked] = useState(false);

    const toggleSecureEntry = () => {
        setSecureTextEntry(!secureTextEntry);
    };
    
    const renderEyeIcon = (props) => (
        <TouchableWithoutFeedback onPress={toggleSecureEntry}>
            <Icon {...props} name={secureTextEntry ? 'eye-off' : 'eye'}/>
        </TouchableWithoutFeedback>
    );

    const renderPersonIcon = (props) => (
        <View>
            <Icon {...props} name={'person'}/>
        </View>
    );

    const renderEmailIcon = (props) => (
        <View>
            <Icon {...props} name={'email'}/>
        </View>
    );

    const renderNameCaption = () => {
        return (
        <View style={styles.captionContainer}>
            {AlertIcon(styles.captionIcon)}
            <Text style={styles.captionText}>{errorPath === 'name' ? errorMessage : ''}</Text>
        </View>
        )
    }
    
    const renderEmailCaption = () => {
        return (
        <View style={styles.captionContainer}>
            {AlertIcon(styles.captionIcon)}
            <Text style={styles.captionText}>{errorPath === 'email' ? errorMessage : ''}</Text>
        </View>
        )
    }

    const renderPasswordCaption = () => {
        return (
        <View style={styles.captionContainer}>
            {AlertIcon(styles.captionIcon)}
            <Text style={styles.captionText}>{errorPath === 'password' ? errorMessage : ''}</Text>
        </View>
        )
    }

    async function connect(){
        Keyboard.dismiss();
        try {
            const response = await API.register({
                name: name,
                email: email,
                password: password
            });
            if (response.status === 200) {
                setErrorPath(''),
                navigation.navigate('Login');
			}
        } catch (error) {
            if (error.response.status === 400) {
                setErrorPath(error.response.data.path),
                setErrorMessage(error.response.data.message)
            }
        }
    }

    return(
        <TouchableWithoutFeedback onPress={Keyboard.dismiss} accessible={false}>
            <Layout style={{flex: 1, justifyContent: 'center', backgroundColor: '#25523B',}}>
                <Image 
                    source={require('../../assets/background1.png')} 
                    style={{
                        position: 'absolute', 
                        // resizeMode: 'cover',
                    }}
                />
                <View style={{position: 'absolute', backgroundColor: '#18241b', width: '100%', height: '100%', opacity: .2}}></View>
                <TouchableOpacity style={{position: 'absolute', left: 20, top: 40}} onPress={() => navigation.navigate('Login')}>
                    <Icon fill='white' name={'arrow-back'} style={{width: 35, height:35}}/>
                </TouchableOpacity>
                <Text style={{color: 'white', fontSize: 50, fontFamily: 'Quicksand', alignSelf: 'center', marginBottom: 20}}>Witaj!</Text>
                <Text style={{color: 'white', fontSize: 20, fontFamily: 'Quicksand', alignSelf: 'center'}}>Zarejestruj się a Applant</Text>
                <View 
                style={{
                    marginHorizontal: 20, 
                    paddingHorizontal: 10, 
                    justifyContent: "center", 
                    backgroundColor: "#F1F1F1", 
                    paddingVertical: 30,
                    marginVertical: 70,
                    borderRadius: 10,
                }}
                >
                    <Input
                        value={name}
                        placeholder='Nazwa użytkownika'
                        status={errorPath === 'name' ? 'danger' : 'basic'}
                        caption={errorPath === 'name' ? renderNameCaption : <></>}
                        accessoryRight={renderPersonIcon}
                        onChangeText={nextValue => setName(nextValue)}
                        style={{marginBottom: errorPath === 'name' ? 0 : 18}}
                    />
                    <Input
                        value={email}
                        placeholder='Email'
                        status={errorPath === 'email' ? 'danger' : 'basic'}
                        caption={errorPath === 'email' ? renderEmailCaption : <></>}
                        accessoryRight={renderEmailIcon}
                        onChangeText={nextValue => setEmail(nextValue)}
                        style={{marginBottom: errorPath === 'email' ? 0 : 18}}
                    />
                    <Input
                        value={password}
                        placeholder='Hasło'
                        status={errorPath === 'password' ? 'danger' : 'basic'}
                        caption={errorPath === 'password' ? renderPasswordCaption : <></>}
                        accessoryRight={renderEyeIcon}
                        secureTextEntry={secureTextEntry}
                        onChangeText={nextValue => setPassword(nextValue)}
                        style={{marginBottom: errorPath === 'password' ? 0 : 18}}
                    />
                    <View style={{alignSelf: 'flex-end', flexDirection: 'row'}}>
                        <TouchableOpacity style={{marginBottom: 15}}>
                            <Text style={{color: 'grey', fontWeight: 'bold'}}>Warunki użytkowania  </Text>
                        </TouchableOpacity>
                        <CheckBox
                            style={{width: 20, height: 20, marginRight: 5}}
                            checked={termsChecked}
                            onChange={nextChecked => setTermsChecked(nextChecked)}>
                        </CheckBox>
                    </View>
                    <Button disabled={!termsChecked} onPress={() => connect()}>ZAREJESTRUJ</Button>
                </View>
                <View style={{bottom: 20, position: 'absolute', flexDirection: 'row', alignSelf: 'center'}}>
                    <Text style={{fontSize: 17, color: '#F1F1F1', fontFamily: 'Quicksand'}}> Posiadasz konto? </Text> 
                    <TouchableOpacity onPress={() => navigation.navigate('Login')}>
                        <Text style={{fontWeight:'bold', fontSize: 17, color: '#F1F1F1', fontFamily: 'Quicksand'}}>Zaloguj się</Text>
                    </TouchableOpacity> 
                </View>
            </Layout>
        </TouchableWithoutFeedback>
    )
};

const styles = StyleSheet.create({
    captionContainer: {
        display: 'flex',
        flexDirection: 'row',
        alignItems: 'center',
        marginVertical: 10,
    },
    captionIcon: {
        width: 10,
        height: 10,
        marginRight: 5
    },
    captionText: {
        fontSize: 12,
        fontWeight: "400",
        alignSelf: 'flex-start',
        color: "grey",
    }
});

export default Registration;

