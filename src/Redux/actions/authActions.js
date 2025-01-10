import axios from "axios";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { API_BASE_URL, API_ENDPOINTS } from "../../config";
import {
	AUTH_LOADING,
	AUTH_ERROR,
	AUTH_LOGIN_SUCCESS,
	AUTH_LOGIN_FAIL,
	AUTH_REGISTER_SUCCESS,
	AUTH_REGISTER_FAIL,
	AUTH_LOGOUT,
	AUTH_RESET,
	SET_LOGIN_FORM,
	SET_REGISTER_FORM,
	RESET_FORMS,
} from "../types";

// Configuration axios
const api = axios.create({
	baseURL: API_BASE_URL,
	timeout: 15000,
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

// Action de connexion
export const login = (credentials) => async (dispatch) => {
	try {
		const response = await api.post(API_ENDPOINTS.AUTH.LOGIN, {
			email: credentials.email,
			password: credentials.password,
		});

		if (response.data && response.data.access_token) {
			const userData = {
				id: response.data.id,
				email: response.data.email,
				username: response.data.username,
				nom: response.data.nom,
				prenom: response.data.prenom,
			};

			// Sauvegarder les tokens et les données utilisateur
			await AsyncStorage.multiSet([
				["access_token", response.data.access_token],
				["refresh_token", response.data.refresh_token],
				["user", JSON.stringify(userData)],
			]);

			dispatch({
				type: AUTH_LOGIN_SUCCESS,
				payload: {
					user: userData,
					access_token: response.data.access_token,
					refresh_token: response.data.refresh_token,
				},
			});

			return {
				success: true,
				message: "Connexion réussie",
			};
		} else {
			throw new Error("Réponse invalide du serveur");
		}
	} catch (error) {
		console.error("Login error details:", error.response?.data);

		let errorMessage = "Email ou mot de passe incorrect";

		if (error.response?.data?.message) {
			if (typeof error.response.data.message === "object") {
				errorMessage = Object.values(error.response.data.message).join(", ");
			} else {
				errorMessage = error.response.data.message;
			}
		} else if (error.response?.data?.error) {
			errorMessage = error.response.data.error;
		}

		dispatch({
			type: AUTH_LOGIN_FAIL,
			payload: errorMessage,
		});

		return {
			success: false,
			error: errorMessage,
		};
	}
};

// Action d'inscription
export const register = (userData) => async (dispatch) => {
	try {
		dispatch({ type: AUTH_LOADING });

		const response = await api.post(API_ENDPOINTS.AUTH.REGISTER, userData);

		dispatch({
			type: AUTH_REGISTER_SUCCESS,
			payload: response.data,
		});
		return {
			success: true,
			message: "Inscription réussie ! Vous pouvez maintenant vous connecter.",
		};
	} catch (error) {
		dispatch({
			type: AUTH_REGISTER_FAIL,
			payload: error.response?.data?.message || "Erreur lors de l'inscription",
		});
		return {
			success: false,
			error: error.response?.data?.message || "Erreur lors de l'inscription",
		};
	}
};

// Action de déconnexion
export const logout = () => async (dispatch) => {
	try {
		await api.post(API_ENDPOINTS.AUTH.LOGOUT);
		await AsyncStorage.multiRemove(["access_token", "refresh_token", "user"]);

		dispatch({ type: AUTH_LOGOUT });
		dispatch({ type: RESET_FORMS });

		return { success: true };
	} catch (error) {
		console.error("Erreur lors de la déconnexion:", error);
		// On déconnecte quand même localement en cas d'erreur
		await AsyncStorage.multiRemove(["access_token", "refresh_token", "user"]);
		dispatch({ type: AUTH_LOGOUT });
		return { success: true };
	}
};

// Actions pour les formulaires
export const setLoginForm = (field, value) => ({
	type: SET_LOGIN_FORM,
	payload: { field, value },
});

export const setRegisterForm = (field, value) => ({
	type: SET_REGISTER_FORM,
	payload: { field, value },
});

export const resetForms = () => ({
	type: RESET_FORMS,
});
