import React, { useEffect, useState } from 'react';
import { TouchableWithoutFeedback, StyleSheet, View, Image, Keyboard, BackHandler, TouchableOpacity } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage'
import * as API from '../../api/apiMethods';
import { Layout, Text, Icon, Input, Button } from '@ui-kitten/components';
import Board from '../main/board';
import { AppContext } from '../../context';

const AlertIcon = (props) => (
    <Icon {...props} name='alert-circle-outline'/>
);

const Login = ({navigation}) => {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [errorMessage, setErrorMessage] = useState('');
    const [errorPath, setErrorPath] = useState('');
    const [secureTextEntry, setSecureTextEntry] = useState(true);

    const context = React.useContext(AppContext);
      
    const handleBackButton = () => {
        BackHandler.exitApp();
        return true;
    }

    useEffect(() => {
        BackHandler.addEventListener('hardwareBackPress', handleBackButton);
    }, []);

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
            const response = await API.login({
                email: email,
                password: password
            });
            if (response.status === 200) {
                setErrorPath(''),
                AsyncStorage.setItem('auth-token', response.headers['auth-token']);
                AsyncStorage.setItem('user_id', response.data['user_id']);
                context.setLoginState(true);
                console.log(response.data['user_id']);
			}
        } catch (error) {
            if (error.response.status === 400) {
                context.setLoginState(false);
                setErrorPath(error.response.data.path),
                setErrorMessage(error.response.data.message)
            }
        }
    }

    return(
        <TouchableWithoutFeedback onPress={Keyboard.dismiss} accessible={false}>
            <>
            <Image
                source={require('../../assets/background1.png')}
                style={{
                    position: 'absolute',
                    width: '100%',
                    height: '100%',
                }}
            />
            <Layout style={{flex: 1, justifyContent: 'center', backgroundColor: 'rgba(0,0,0,0)',}}>
                {/* <View style={{position: 'absolute', backgroundColor: '#18241b', width: '100%', height: '100%', opacity: .2}}></View> */}
                <TouchableOpacity style={{position: 'absolute', right: 20, top: 40}}  onPress={() => navigation.navigate('Registration')}>
                    <Icon fill='white' name={'arrow-forward'} style={{width: 35, height:35}}/>
                </TouchableOpacity>
                <Text style={{color: 'white', fontSize: 50, fontFamily: 'Quicksand', alignSelf: 'center', marginBottom: 20}}>Witaj!</Text>
                <Text style={{color: 'white', fontSize: 20, fontFamily: 'Quicksand', alignSelf: 'center'}}>Zaloguj się na swoje konto</Text>
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
                        value={email}
                        placeholder='Email'
                        status={errorPath === 'email' ? 'danger' : 'basic'}
                        caption={errorPath === 'email' ? renderEmailCaption : <></>}
                        accessoryRight={renderPersonIcon}
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
                    <TouchableOpacity style={{alignSelf: 'flex-end', marginBottom: 15}}><Text style={{color: 'grey'}}>Zapomniałeś hasła?</Text></TouchableOpacity>
                    <Button onPress={() => connect()}>ZALOGUJ</Button>
                </View>
                <View style={{bottom: 20, position: 'absolute', flexDirection: 'row', alignSelf: 'center'}}>
                    <Text style={{fontSize: 17, color: '#F1F1F1', fontFamily: 'Quicksand'}}> Nie posiadasz konta? </Text> 
                    <TouchableOpacity onPress={() => navigation.navigate('Registration')}>
                        <Text style={{fontWeight:'bold', fontSize: 17, color: '#F1F1F1', fontFamily: 'Quicksand'}}>Zarejestruj się</Text>
                    </TouchableOpacity> 
                </View>
            </Layout>
            </>
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

export default Login;

