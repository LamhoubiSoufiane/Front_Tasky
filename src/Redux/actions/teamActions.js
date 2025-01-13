import axios from "axios";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { API_BASE_URL, API_ENDPOINTS } from "../../config";
import {
	TEAMS_LOADING,
	TEAMS_ERROR,
	TEAMS_LOADED,
	TEAM_MEMBERS_LOADED,
	TEAM_MEMBERS_ERROR,
	TEAM_LOADING,
	TEAM_UPDATE,
	TEAM_DELETE,
	TEAM_ERROR,
} from "../types";

// Configuration axios avec intercepteur pour le token
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
		try {
			const token = await AsyncStorage.getItem("access_token");
			if (token) {
				config.headers.Authorization = `Bearer ${token}`;
			}
			return config;
		} catch (error) {
			console.error("Erreur lors de la récupération du token:", error);
			return Promise.reject(error);
		}
	},
	(error) => {
		return Promise.reject(error);
	}
);

// Charger les équipes d'un utilisateur
export const loadUserTeams = (userId) => async (dispatch) => {
	try {
		dispatch({ type: TEAMS_LOADING });

		const token = await AsyncStorage.getItem("access_token");
		if (!token) {
			throw new Error("Token d'authentification non trouvé");
		}

		const response = await api.get(API_ENDPOINTS.TEAMS.USER(userId));
		console.log("Réponse des équipes:", response.data);

		if (response.data) {
			dispatch({
				type: TEAMS_LOADED,
				payload: response.data,
			});

			return {
				success: true,
				teams: response.data,
			};
		} else {
			throw new Error("Aucune donnée reçue du serveur");
		}
	} catch (error) {
		console.error("Erreur détaillée:", error);
		console.error("Réponse d'erreur:", error.response?.data);

		let errorMessage = "Erreur lors du chargement des équipes";

		if (error.response?.data?.message) {
			errorMessage = error.response.data.message;
		} else if (error.message) {
			errorMessage = error.message;
		}

		dispatch({
			type: TEAMS_ERROR,
			payload: errorMessage,
		});

		return {
			success: false,
			error: errorMessage,
		};
	}
};

// Charger les membres d'une équipe
export const loadTeamMembers = (teamId) => async (dispatch) => {
	try {
		const token = await AsyncStorage.getItem("access_token");
		if (!token) {
			throw new Error("Token d'authentification non trouvé");
		}

		const response = await api.get(API_ENDPOINTS.TEAMS.MEMBERS(teamId));
		console.log("Réponse des membres:", response.data);

		dispatch({
			type: TEAM_MEMBERS_LOADED,
			payload: {
				teamId,
				members: response.data,
			},
		});

		return {
			success: true,
			members: response.data,
		};
	} catch (error) {
		console.error("Erreur détaillée:", error);
		console.error("Réponse d'erreur:", error.response?.data);

		let errorMessage = "Erreur lors du chargement des membres";

		if (error.response?.data?.message) {
			errorMessage = error.response.data.message;
		} else if (error.message) {
			errorMessage = error.message;
		}

		dispatch({
			type: TEAM_MEMBERS_ERROR,
			payload: errorMessage,
		});

		return {
			success: false,
			error: errorMessage,
		};
	}
};

// Créer une nouvelle équipe
export const createTeam = (teamData) => async (dispatch) => {
	try {
		dispatch({ type: TEAMS_LOADING });

		const token = await AsyncStorage.getItem("access_token");
		if (!token) {
			throw new Error("Token d'authentification non trouvé");
		}

		const response = await api.post(API_ENDPOINTS.TEAMS.BASE, {
			nom: teamData.nom,
			memberIds: teamData.memberIds,
		});

		console.log("Réponse création équipe:", response.data);

		if (response.data && response.data.id) {
			// Recharger la liste des équipes après la création
			dispatch(loadUserTeams(teamData.ownerId));

			return {
				success: true,
				team: response.data,
				message: "Équipe créée avec succès",
			};
		} else {
			throw new Error("Erreur lors de la création de l'équipe");
		}
	} catch (error) {
		console.error("Erreur détaillée:", error);
		console.error("Réponse d'erreur:", error.response?.data);

		let errorMessage = "Erreur lors de la création de l'équipe";

		if (error.response?.data?.message) {
			errorMessage = error.response.data.message;
		} else if (error.message) {
			errorMessage = error.message;
		}

		dispatch({
			type: TEAMS_ERROR,
			payload: errorMessage,
		});

		return {
			success: false,
			error: errorMessage,
		};
	}
};

// Mettre à jour une équipe
export const updateTeam = (teamId, teamData) => async (dispatch) => {
	try {
		dispatch({ type: TEAM_LOADING });

		const response = await api.put(
			`${API_ENDPOINTS.TEAMS.BASE}/${teamId}`,
			teamData
		);

		dispatch({
			type: TEAM_UPDATE,
			payload: response.data,
		});

		return { success: true, team: response.data };
	} catch (error) {
		dispatch({
			type: TEAM_ERROR,
			payload:
				error.response?.data?.message ||
				"Erreur lors de la mise à jour de l'équipe",
		});
		return {
			success: false,
			error:
				error.response?.data?.message ||
				"Erreur lors de la mise à jour de l'équipe",
		};
	}
};

// Supprimer une équipe
export const deleteTeam = (teamId) => async (dispatch) => {
	try {
		dispatch({ type: TEAM_LOADING });

		await api.delete(`${API_ENDPOINTS.TEAMS.BASE}/${teamId}`);

		dispatch({
			type: TEAM_DELETE,
			payload: teamId,
		});

		return { success: true };
	} catch (error) {
		dispatch({
			type: TEAM_ERROR,
			payload:
				error.response?.data?.message ||
				"Erreur lors de la suppression de l'équipe",
		});
		return {
			success: false,
			error:
				error.response?.data?.message ||
				"Erreur lors de la suppression de l'équipe",
		};
	}
};

// Ajouter un membre à une équipe
export const addTeamMember = (teamId, userId) => async (dispatch) => {
	try {
		const token = await AsyncStorage.getItem("access_token");
		if (!token) {
			throw new Error("Token d'authentification non trouvé");
		}

		const response = await api.post(API_ENDPOINTS.TEAMS.MEMBER(teamId, userId));
		console.log("Réponse ajout membre:", response.data);

		// Recharger les membres après l'ajout
		dispatch(loadTeamMembers(teamId));

		return {
			success: true,
			message: "Membre ajouté avec succès",
		};
	} catch (error) {
		console.error("Erreur détaillée:", error);
		console.error("Réponse d'erreur:", error.response?.data);

		let errorMessage = "Erreur lors de l'ajout du membre";

		if (error.response?.data?.message) {
			errorMessage = error.response.data.message;
		} else if (error.message) {
			errorMessage = error.message;
		}

		dispatch({
			type: TEAM_MEMBERS_ERROR,
			payload: errorMessage,
		});

		return {
			success: false,
			error: errorMessage,
		};
	}
};

// Retirer un membre d'une équipe
export const removeTeamMember = (teamId, userId) => async (dispatch) => {
	try {
		const token = await AsyncStorage.getItem("access_token");
		if (!token) {
			throw new Error("Token d'authentification non trouvé");
		}

		const response = await api.delete(API_ENDPOINTS.TEAMS.MEMBER(teamId, userId));
		console.log("Réponse retrait membre:", response.data);

		// Recharger les membres après le retrait
		dispatch(loadTeamMembers(teamId));

		return {
			success: true,
			message: "Membre retiré avec succès",
		};
	} catch (error) {
		console.error("Erreur détaillée:", error);
		console.error("Réponse d'erreur:", error.response?.data);

		let errorMessage = "Erreur lors du retrait du membre";

		if (error.response?.data?.message) {
			errorMessage = error.response.data.message;
		} else if (error.message) {
			errorMessage = error.message;
		}

		dispatch({
			type: TEAM_MEMBERS_ERROR,
			payload: errorMessage,
		});

		return {
			success: false,
			error: errorMessage,
		};
	}
};
