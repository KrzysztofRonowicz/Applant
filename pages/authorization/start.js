import React, { Component } from 'react';
import { registerRootComponent }from 'expo';
import *as Font from 'expo-font';
import AuthorizationNavigator from './authorizationNavigator'

let customFonts = {
	'Courgette': require('../../assets/fonts/Courgette-Regular.ttf'),
    'Quicksand': require('../../assets/fonts/Quicksand-Medium.ttf'),
};
class Start extends Component {
    constructor() {
		super();
		this.state = {
			fontsLoaded: false,
		};
	}

    componentDidMount() {
		this.loadFontsAsync();
	}

    async loadFontsAsync() {
		await Font.loadAsync(customFonts);
		this.setState({ fontsLoaded: true });
	}

    render(){ 
        return(
            this.state.fontsLoaded ? <AuthorizationNavigator/> : <></>
        ) 
    }
}

export default Start;
registerRootComponent(Start);