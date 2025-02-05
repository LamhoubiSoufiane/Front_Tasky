import axios from "axios";
import { API_BASE_URL, API_ENDPOINTS } from "../../config";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { USER_LOADING, USER_ERROR, USER_SUCCESS, USER_UPDATE } from "../types";

// Configuration axios
const api = axios.create({
	baseURL: API_BASE_URL,
	timeout: 10000,
	headers: {
		"Content-Type": "application/json",
	},
});

// Intercepteur pour ajouter le token
api.interceptors.request.use(
	async (config) => {
		const token = await AsyncStorage.getItem("access_token");
		if (token) {
			config.headers.Authorization = `Bearer ${token}`;
		}
		return config;
	},
	(error) => {
		return Promise.reject(error);
	}
);

// Rechercher des utilisateurs
export const searchUsers = (query) => async (dispatch) => {
	try {
		dispatch({ type: USER_LOADING });

		const response = await api.get(`${API_ENDPOINTS.USERS.SEARCH}?q=${query}`);

		dispatch({
			type: USER_SUCCESS,
			payload: response.data,
		});

		return { success: true, data: response.data };
	} catch (error) {
		dispatch({
			type: USER_ERROR,
			payload:
				error.response?.data?.message ||
				"Erreur lors de la recherche d'utilisateurs",
		});
		return {
			success: false,
			error:
				error.response?.data?.message ||
				"Erreur lors de la recherche d'utilisateurs",
		};
	}
};

// Mettre à jour le profil utilisateur
export const updateUserProfile = (userData) => async (dispatch) => {
	try {
		dispatch({ type: USER_LOADING });

		const response = await api.put(
			`${API_ENDPOINTS.USERS.BASE}/profile`,
			userData
		);

		if (response.status === 200) {
			console.log("~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~ ",userData);
			console.log(' ********************************************************* API Response:', response.data); // Vérifie la réponse de l'API
	  
			// Mettre à jour le store avec les nouvelles données
			dispatch({
			  type: USER_UPDATE,
			  payload: response.data,  // On s'assure ici que la réponse contient les données mises à jour
			});
	  
			return { success: true, user: response.data };
		  } else {
			// Si la réponse de l'API est différente d'une réponse 2xx
			throw new Error('Erreur lors de la mise à jour du profil : Réponse de l\'API invalide');
		  }
	} catch (error) {
		console.error("Erreur lors de la mise à jour du profil:", error.response?.data || error.message);
		dispatch({
			type: USER_ERROR,
			payload:
				error.response?.data?.message ||
				"Erreur lors de la mise à jour du profil",
		});
		return {
			success: false,
			error:
				error.response?.data?.message ||
				"Erreur lors de la mise à jour du profil",
		};
	}
};

export const getUserProfile = () => async (dispatch) => {
	try{
		dispatch({ type: USER_LOADING});
		const token = await AsyncStorage.getItem('access_token');
		if (!token) {
			console.error("Token is missing or expired.");
			return dispatch({ type: USER_ERROR, payload: "Token is missing or expired." });
		  }
		  const response = await axios.get(`${API_BASE_URL}${API_ENDPOINTS.USERS.PROFILE}`, {
			headers: { Authorization: `Bearer ${token}` },
		  });
		  

		dispatch({
			type: USER_SUCCESS,
			payload: response.data,
		});
	} catch(error){
		console.error("Error fetching user info: ", error.response || error.message);
		dispatch({
			type: USER_ERROR,
			payload: error.response ? error.response.data.message : "Unknown error occurred",
		  });
		  
	}
};
