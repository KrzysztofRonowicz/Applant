const hostUri = 'https://mighty-refuge-60814.herokuapp.com/api';

const userUri = `${hostUri}/user`;
const plantUri = `${hostUri}/plant`;
const userPlantUri = `${hostUri}/userplant`;
const collectionsUri = `${hostUri}/collections`;

export const register = `${userUri}/register`;
export const login = `${userUri}/login`;

export const plant = (_id) => `${plantUri}/?_id=${_id}`;
export const searchPlants = (species_name) => `${plantUri}/search?species_name=${species_name}`;

export const userPlant = (_id) => `${userPlantUri}/?_id=${_id}`;
export const userPlantLabel = (_id) => `${userPlantUri}/label?_id=${_id}`
export const updateUserPlant = (_id) => `${userPlantUri}/update?_id=${_id}`;
export const updateUserPlantCareParameter = (_id, care_name) => `${userPlantUri}/update/careparameter?_id=${_id}&care_name=${care_name}`;
export const updateUserPlantClimateParameter = (_id, climate_name) => `${userPlantUri}/update/climateparameter?_id=${_id}&climate_name=${climate_name}`;

export const collections = `${collectionsUri}/`;
export const addCollection = `${collectionsUri}/add`;
export const removeCollection = (_id) => `${collectionsUri}/remove?_id=${_id}`;
export const addPlantToCollection = (_id) => `${collectionsUri}/plantadd?_id=${_id}`;
export const removePlantFromCollection = (_id) => `${collectionsUri}/plantremove?_id=${_id}`;