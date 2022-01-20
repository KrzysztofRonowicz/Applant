import *as React from 'react';
import { createStackNavigator, TransitionPresets }from '@react-navigation/stack';
import { NavigationContainer } from '@react-navigation/native';
import Login from './login';
import Registration from './registration';

const Stack = createStackNavigator();

const AuthorizationNavigator = () => {
	return (
		<NavigationContainer>
			<Stack.Navigator
				initialRouteName="Login"
				screenOptions={{
					headerShown: false,
				}}
				>
				<Stack.Screen name="Login" component={Login}
					options={{
						title: 'Login',
						...TransitionPresets.ModalFadeTransition,
					}}/>
				<Stack.Screen name="Registration" component={Registration}
					options={{
						title: 'Registration',
						...TransitionPresets.SlideFromRightIOS,
					}}/>
			</Stack.Navigator>
		</NavigationContainer>
		
	);
};
export default AuthorizationNavigator;