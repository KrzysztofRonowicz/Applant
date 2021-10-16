import *as React from 'react';
import { createStackNavigator, TransitionPresets }from '@react-navigation/stack';
import { NavigationContainer }from '@react-navigation/native';
import Home from './home';

const Stack = createStackNavigator();

const MainNavigator = () => {
	return (
		<NavigationContainer>
			<Stack.Navigator
				initialRouteName="Home"
				
				screenOptions={{
					headerShown: false,
				}}
				>
				<Stack.Screen name="Home" component={Home}
					options={{
						title: 'Home',
						...TransitionPresets.SlideFromRightIOS,
				}}/>
			</Stack.Navigator>
		</NavigationContainer>
		
	);
};
export default MainNavigator;