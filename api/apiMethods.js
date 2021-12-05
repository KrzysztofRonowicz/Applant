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
export const searchPlants = (species_name, data) => {
	return axios.get(URI.searchPlants(species_name),
		data,
	);
};
export const getUserPlant = (_id, data) => {
	return axios.get(URI.userPlant(_id),
		data,
	);
};
export const updateUserPlant = (_id, data) => {
	return axios.patch(URI.updateUserPlant(_id),
		data,
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
export const getUserPlantLabel = (_id, data) => {
	return axios.get(URI.userPlantLabel(_id),
		data
	);
};