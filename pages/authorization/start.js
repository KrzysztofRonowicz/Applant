import React, { Component, useState, useContext } from 'react';
import { Image, View, TextInput, Button } from 'react-native';
import { registerRootComponent }from 'expo';
import { AppContext } from '../../context';
import * as API from '../../api/apiMethods';
import *as Font from 'expo-font';
import { Layout, Text } from '@ui-kitten/components';

let customFonts = {
	'Courgette': require('../../assets/fonts/Courgette-Regular.ttf'),
};

const Hello = () => (
    <Layout style={{flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: '#25523B', flexDirection: 'row'}}>
        <Image source={require('../../assets/applant.png')} style={{width: 60, height: 60, borderRadius: 10, marginRight: 20}}/>
        <Text style={{color: 'white', fontSize: 50, fontFamily: 'Courgette'}}>Applant</Text>
    </Layout>
);

const Login = () => {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [ok, setOk] = useState('--');
    const context = useContext(AppContext);
    // React.useEffect(()=>{
	// 	setTimeout(()=>context.setLoadingState(false), 1000);
	// }, []);
    async function connect(){
        Keyboard.dismiss();
        context.setLoadingState(true);
        try {
            const res = await API.login({
                email: email,
                password: password
            });
            // console.log(response.status);
            setOk(res);
            if (res.status === 200){
				AsyncStorage.setItem('auth-token', res.headers['auth-token']);
				context.setLoginState(true);
                // console.log('ok');
                setOk(res.status);
			}
        } catch (error) {
            // console.log('ok' + error);
            setOk(res.status);
            context.setLoadingState(false);
            // if (error.res) {
			// 	switch (error.res.status) {
			// 	case 400:
			// 		console.log('Błędny email lub hasło');
			// 		break;
			// 	default:
            //         console.log('Coś jest nie tak, spróbuj ponownie');
			// 		break;
			// 	}
			// }else if (error.request) {
			// 	console.log('Problem podczas połączenia z serwerem');
			// }else {
			// 	console.log('Cos nie tak');
			// }
        }
    }
    return(
        <Layout style={{flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: '#25523B', flexDirection: 'row'}}>
            <TextInput onChangeText={setEmail} placeholder='email'/>
            <TextInput onChangeText={setPassword} placeholder='password'/>
            <Button onPress={() => connect()} title='butto'/>
            <Text>{ok}</Text>
        </Layout>
    )
};


class Start extends Component {
    constructor() {
		super();
		this.state = {
			fontsLoaded: false,
            appStarted: false,
		};
	}

    componentDidMount() {
		this.loadFontsAsync();
        setTimeout(()=>this.setState({ appStarted: true }) , 1000);
	}

    async loadFontsAsync() {
		await Font.loadAsync(customFonts);
		this.setState({ fontsLoaded: true });
	}

    render(){ 
        return(
            this.state.appStarted ? <Login/> : <Hello/>
        ) 
    }
}

export default Start;
registerRootComponent(Start);