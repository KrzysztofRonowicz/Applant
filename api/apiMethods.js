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