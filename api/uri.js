const hostUri = 'https://mighty-refuge-60814.herokuapp.com/api';

const userUri = `${hostUri}/user`;
const plantUri = `${hostUri}/plant`;
const userPlantUri = `${hostUri}/userplant`;
const collectionsUri = `${hostUri}/collections`;
const ticketUri = `${hostUri}/ticket`;
const adUri = `${hostUri}/ad`;
const messageUri = `${hostUri}/message`;
const conversationUri = `${hostUri}/conversation`;

export const register = `${userUri}/register`;
export const login = `${userUri}/login`;
export const updateLocation = `${userUri}/location`; 

export const plant = (_id) => `${plantUri}/?_id=${_id}`;
export const searchPlants = (name) => `${plantUri}/search?name=${name}`;

export const userPlant = (_id) => `${userPlantUri}/?_id=${_id}`;
export const copyUserPlant = (plant_id) => `${userPlantUri}/copy?plant_id=${plant_id}`;
export const addUserPlant = `${userPlantUri}/add`;
export const updateUserPlant = (_id) => `${userPlantUri}/update?_id=${_id}`;
export const updateUserPlantCareParameter = (_id, care_name) => `${userPlantUri}/update/careparameter?_id=${_id}&care_name=${care_name}`;
export const updateUserPlantClimateParameter = (_id, climate_name) => `${userPlantUri}/update/climateparameter?_id=${_id}&climate_name=${climate_name}`;
export const removeUserPlant = (_id) => `${userPlantUri}/remove?_id=${_id}`;

export const collections = `${collectionsUri}/`;
export const addCollection = `${collectionsUri}/add`;
export const removeCollection = (_id) => `${collectionsUri}/remove?_id=${_id}`;
export const updateCollection = (_id) => `${collectionsUri}/update?_id=${_id}`;
export const addPlantToCollection = (_id) => `${collectionsUri}/plantadd?_id=${_id}`;
export const removePlantFromCollection = (_id) => `${collectionsUri}/plantremove?_id=${_id}`;

export const tickets = (days_ahead) => `${ticketUri}/?days_ahead=${days_ahead}`;
export const addTicket = `${ticketUri}/add`;
export const updateTicket = (_id) => `${ticketUri}/update?_id=${_id}`;
export const removeAllTickets = (plant_id) => `${ticketUri}/remove?plant_id=${plant_id}`;

export const addAd = `${adUri}/add`;
export const searchAd = (name) => `${adUri}/search?name=${name}`;
export const removeAd = (plant_id) => `${adUri}/remove?plant_id=${plant_id}`;

export const messages = (ad_id, owner_id, user_id) => `${messageUri}/messages?ad_id=${ad_id}&owner_id=${owner_id}&user_id=${user_id}`;
export const addMessage = `${messageUri}/add`;
export const prefixmessages = `${messageUri}/prefixmessages`;

export const removeConversation = (_id) => `${conversationUri}/remove?_id=${_id}`;
export const removeAllConversations = (ad_id) => `${conversationUri}/removeall?ad_id=${ad_id}`;
