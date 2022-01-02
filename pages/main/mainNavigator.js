import *as React from 'react';
import { View, Image, TouchableOpacity, TouchableWithoutFeedback, Keyboard } from 'react-native';
import { NavigationContainer }from '@react-navigation/native';
import { createMaterialTopTabNavigator } from '@react-navigation/material-top-tabs';
import Board from './board';
import Collections from './collections';
import Search from './search';
import Chat from './chat';
import Account from './account';
import { Icon } from 'react-native-elements'
import { Layout, Text } from '@ui-kitten/components';

const Tab = createMaterialTopTabNavigator();

const HeaderMainNavigator = () => {
	return (
		<View style={{ height: 75,justifyContent: 'center', alignItems: 'flex-end', backgroundColor: 'white', flexDirection: 'row', paddingTop: 30, paddingHorizontal: 20, paddingBottom: 5}}>
			<Image source={require('../../assets/logo2.png')} style={{ width: 40, height: 35, borderRadius: 7 }} />
			<Text style={{ color: '#25523B', fontSize: 25, fontFamily: 'Courgette', marginLeft: 10 }}>Applant</Text>
			{/* <TouchableOpacity style={{ alignSelf: 'flex-end', marginBottom: 2, padding: 3, backgroundColor: '#DCDCDC', borderRadius: 20 }}>
				<Icon type='material' name='settings' color={'gray'}/>
			</TouchableOpacity> */}
		</View>
	);
}

const MainNavigator = () => {
	return (
			<>
				<HeaderMainNavigator/>
				<NavigationContainer>
					<Tab.Navigator
						screenOptions={({route}) => ({
							tabBarIcon: ({focused, color, size}) => {
								let iconName;
								if (route.name === 'Board') {
									iconName = 'today';
								}
								else if (route.name === 'Collections') {
									iconName = 'grass';
								}
								else if (route.name === 'Search') {
									iconName = 'search';
								}
								else if (route.name === 'Chat') {
									iconName = 'chat';
								}
								else if (route.name === 'Account') {
									iconName = 'person';
								}
								return <Icon type='material' name={iconName} color={color} size={26}/>
							},
							tabBarActiveTintColor: '#25523B',
							tabBarInactiveTintColor: 'gray',
							tabBarShowLabel: false,
							tabBarIndicatorStyle: {
								backgroundColor: '#25523B',
								borderTopRightRadius: 5,
								borderTopLeftRadius: 5,
							},
							tabBarStyle: {
								backgroundColor: 'white',
							}
						})}
						style={{
							elevation: 0
						}}
					>
						<Tab.Screen name="Board" component={Board}/>
						<Tab.Screen name="Collections" component={Collections} />
						<Tab.Screen name="Search" component={Search} />
						<Tab.Screen name="Chat" component={Chat} />
						<Tab.Screen name="Account" component={Account} />
					</Tab.Navigator>
				</NavigationContainer>
			</>
	);
};
export default MainNavigator;