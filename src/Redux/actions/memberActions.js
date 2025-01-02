import axios from "axios";
import { API_BASE_URL, API_ENDPOINTS } from "../../config";
import {
	MEMBER_LOADING,
	MEMBER_ERROR,
	MEMBER_ADD_SUCCESS,
	MEMBER_REMOVE_SUCCESS,
} from "../types";

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

// Ajouter un membre à une équipe
export const addTeamMember = (teamId, userId) => async (dispatch) => {
	try {
		dispatch({ type: MEMBER_LOADING });

		const response = await api.post(API_ENDPOINTS.TEAMS.MEMBERS(teamId), {
			userId: userId,
		});

		dispatch({
			type: MEMBER_ADD_SUCCESS,
			payload: response.data,
		});

		return { success: true, member: response.data };
	} catch (error) {
		dispatch({
			type: MEMBER_ERROR,
			payload:
				error.response?.data?.message || "Erreur lors de l'ajout du membre",
		});
		return {
			success: false,
			error:
				error.response?.data?.message || "Erreur lors de l'ajout du membre",
		};
	}
};

// Retirer un membre d'une équipe
export const removeTeamMember = (teamId, userId) => async (dispatch) => {
	try {
		dispatch({ type: MEMBER_LOADING });

		await api.delete(API_ENDPOINTS.TEAMS.MEMBER(teamId, userId));

		dispatch({
			type: MEMBER_REMOVE_SUCCESS,
			payload: { teamId, userId },
		});

		return { success: true };
	} catch (error) {
		dispatch({
			type: MEMBER_ERROR,
			payload:
				error.response?.data?.message || "Erreur lors du retrait du membre",
		});
		return {
			success: false,
			error:
				error.response?.data?.message || "Erreur lors du retrait du membre",
		};
	}
};

// Obtenir les membres d'une équipe
export const getTeamMembers = (teamId) => async (dispatch) => {
	try {
		dispatch({ type: MEMBER_LOADING });

		const response = await api.get(API_ENDPOINTS.TEAMS.MEMBERS(teamId));

		dispatch({
			type: MEMBER_SUCCESS,
			payload: response.data,
		});

		return { success: true, members: response.data };
	} catch (error) {
		dispatch({
			type: MEMBER_ERROR,
			payload:
				error.response?.data?.message ||
				"Erreur lors du chargement des membres",
		});
		return {
			success: false,
			error:
				error.response?.data?.message ||
				"Erreur lors du chargement des membres",
		};
	}
};
