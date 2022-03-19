import axios from 'axios';
import *as URI from './uri';


export const login = (data) => {
	return axios.post(URI.login,
		data
	);
};
export const register = (data) => {
	return axios.post(URI.register,
		data
	);
};
export const getPlant = (_id, data) => {
	return axios.get(URI.plant(_id),
		data
	);
};
export const searchPlants = (name, data) => {
	return axios.get(URI.searchPlants(name),
		data,
	);
};
export const getUserPlant = (_id, data) => {
	return axios.get(URI.userPlant(_id),
		data,
	);
};
export const updateUserPlant = (_id, data, headers) => {
	return axios.patch(URI.updateUserPlant(_id),
		data,
		headers
	);
};
export const updateUserPlantCareParameter = (_id, care_name, data, headers) => {
	return axios.put(URI.updateUserPlantCareParameter(_id, care_name),
		data,
		headers
	);
};
export const updateUserPlantClimateParameter = (_id, climate_name, data, headers) => {
	return axios.put(URI.updateUserPlantClimateParameter(_id, climate_name),
		data,
		headers
	);
};
export const getUserCollections = (data) => {
	return axios.get(URI.collections,
		data
	);
};
export const addPlantToCollection = (_id, data, headers) => {
	console.log(URI.addPlantToCollection(_id));
	return axios.put(URI.addPlantToCollection(_id),
		data,
		headers
	);
};
export const removePlantFromCollection = (_id, data, headers) => {
	return axios.put(URI.removePlantFromCollection(_id),
		data,
		headers
	);
};
export const addPlantToUser = (data, headers) => {
	return axios.post(URI.addUserPlant,
		data,
		headers
	);
};
export const copyUserPlant = (plant_id, headers) => {
	return axios.post(URI.copyUserPlant(plant_id),{},
		headers
	);
};
export const getTickets = (days_ahead, data) => {
	return axios.get(URI.tickets(days_ahead),
		data
	);
};
export const addAd = (data, headers) => {
	return axios.post(URI.addAd,
		data,
		headers
	);
};
export const searchAds = (name, data) => {
	return axios.get(URI.searchAd(name),
		data,
	);
};
export const getMessages = (ad_id, owner_id, user_id, headers) => {
	return axios.get(URI.messages(ad_id, owner_id, user_id), 
		headers
	);
};
export const sendMessage = (data, headers) => {
	return axios.post(URI.addMessage,
		data,
		headers
	);
};
export const getPrefixMessages = (data) => {
	return axios.get(URI.prefixmessages,
		data
	);
};
export const addCollection = (data, headers) => {
	return axios.post(URI.addCollection,
		data,
		headers
	);
};
export const removeCollection = (_id, data) => {
	return axios.delete(URI.removeCollection(_id),
		data,
	);
};
export const updateCollection = (_id, data, headers) => {
	return axios.put(URI.updateCollection(_id),
		data,
		headers
	);
};
export const updateTicket = (_id, data) => {
	console.log(URI.updateTicket(_id));
	return axios.put(URI.updateTicket(_id),
		{},
		data
	);
};
export const removeConversation = (_id, data) => {
	return axios.delete(URI.removeConversation(_id),
		data
	);
};
export const removeAllConversations = (ad_id, data) => {
	console.log(URI.removeAllConversations(ad_id));
	return axios.delete(URI.removeAllConversations(ad_id),
		data
	);
};
export const removeAd = (plant_id, data) => {
	console.log(URI.removeAd(plant_id));
	return axios.delete(URI.removeAd(plant_id),
		data
	);
};
export const removeUserPlant = (_id, data) => {
	return axios.delete(URI.removeUserPlant(_id),
		data
	);
};
export const updateLocation = (data, headers) => {
	return axios.put(URI.updateLocation,
		data,
		headers
	);
};