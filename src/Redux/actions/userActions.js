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

		dispatch({
			type: USER_UPDATE,
			payload: response.data,
		});

		return { success: true, user: response.data };
	} catch (error) {
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
