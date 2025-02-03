import { API_BASE_URL, API_ENDPOINTS } from "../../config";
import axios from "axios";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { ERROR_MESSAGES } from "../../config";

// Action Types
export const PROJECT_TYPES = {
	SET_LOADING: "SET_PROJECT_LOADING",
	SET_ERROR: "SET_PROJECT_ERROR",
	SET_PROJECTS: "SET_PROJECTS",
	SET_PROJECT_MEMBERS: "SET_PROJECT_MEMBERS",
	ADD_PROJECT: "ADD_PROJECT",
	UPDATE_PROJECT: "UPDATE_PROJECT",
	DELETE_PROJECT: "DELETE_PROJECT",
};

// Action Creators
const setLoading = (loading) => ({
	type: PROJECT_TYPES.SET_LOADING,
	payload: loading,
});

const setError = (error) => ({
	type: PROJECT_TYPES.SET_ERROR,
	payload: error,
});

const setProjects = (teamId, projects) => ({
	type: PROJECT_TYPES.SET_PROJECTS,
	payload: { teamId, projects },
});

const setProjectMembers = (projectId, members) => ({
	type: PROJECT_TYPES.SET_PROJECT_MEMBERS,
	payload: { projectId, members },
});

const addProject = (project) => ({
	type: PROJECT_TYPES.ADD_PROJECT,
	payload: project,
});

const updateProject = (project) => ({
	type: PROJECT_TYPES.UPDATE_PROJECT,
	payload: project,
});

const deleteProject = (projectId) => ({
	type: PROJECT_TYPES.DELETE_PROJECT,
	payload: projectId,
});

// Thunk Actions
export const loadTeamProjects = (teamId) => async (dispatch) => {
	dispatch(setLoading(true));
	try {
		const token = await AsyncStorage.getItem("access_token");
		const response = await axios.get(
			`${API_BASE_URL}${API_ENDPOINTS.PROJECTS.TEAM(teamId)}`,
			{
				headers: {
					Authorization: `Bearer ${token}`,
					"Content-Type": "application/json",
				},
			}
		);

		if (response.data) {
			dispatch(setProjects(teamId, response.data));
			return { success: true, data: response.data };
		}
		return { success: false, error: ERROR_MESSAGES.PROJECT.LOAD_ERROR };
	} catch (error) {
		console.error("Erreur lors du chargement des projets:", error);
		dispatch(setError(error.message));
		return { success: false, error: ERROR_MESSAGES.PROJECT.LOAD_ERROR };
	} finally {
		dispatch(setLoading(false));
	}
};

export const createProject = (projectData) => async (dispatch) => {
	dispatch(setLoading(true));
	try {
		const token = await AsyncStorage.getItem("access_token");
		if (!token) {
			throw new Error("Token d'authentification non trouvé");
		}

		const formattedData = {
			nom: projectData.nom,
			description: projectData.description,
			startDate: projectData.dateDebut.toISOString().split("T")[0],
			endDate: projectData.dateFin.toISOString().split("T")[0],
			status: "planifié",
			idTeam: projectData.teamId,
		};

		console.log("Sending project data:", formattedData);

		const response = await axios.post(
			`${API_BASE_URL}${API_ENDPOINTS.PROJECTS.CREATE}`,
			formattedData,
			{
				headers: {
					Authorization: `Bearer ${token}`,
					"Content-Type": "application/json",
				},
			}
		);

		if (response.data) {
			dispatch(addProject(response.data));
			return { success: true, data: response.data };
		}
		return { success: false, error: "La création du projet a échoué" };
	} catch (error) {
		console.error("Erreur lors de la création du projet:", error);
		const errorMessage =
			error.response?.data?.message ||
			error.message ||
			"Erreur lors de la création du projet";
		dispatch(setError(errorMessage));
		return { success: false, error: errorMessage };
	} finally {
		dispatch(setLoading(false));
	}
};

export const updateProjectDetails =
	(projectId, projectData) => async (dispatch) => {
		dispatch(setLoading(true));
		try {
			const token = await AsyncStorage.getItem("access_token");
			const response = await axios.post(
				`${API_BASE_URL}${API_ENDPOINTS.PROJECTS.UPDATE}`,
				{ id: projectId, ...projectData },
				{
					headers: {
						Authorization: `Bearer ${token}`,
					},
				}
			);

			if (response.data) {
				dispatch(updateProject(response.data));
				return { success: true, data: response.data };
			}
			return { success: false, error: ERROR_MESSAGES.PROJECT.UPDATE_ERROR };
		} catch (error) {
			console.error("Erreur lors de la mise à jour du projet:", error);
			dispatch(setError(error.message));
			return { success: false, error: ERROR_MESSAGES.PROJECT.UPDATE_ERROR };
		} finally {
			dispatch(setLoading(false));
		}
	};

export const deleteProjectById = (projectId) => async (dispatch) => {
	dispatch(setLoading(true));
	try {
		const token = await AsyncStorage.getItem("access_token");
		await axios.delete(
			`${API_BASE_URL}${API_ENDPOINTS.PROJECTS.DELETE(projectId)}`,
			{
				headers: {
					Authorization: `Bearer ${token}`,
				},
			}
		);

		dispatch(deleteProject(projectId));
		return { success: true };
	} catch (error) {
		console.error("Erreur lors de la suppression du projet:", error);
		dispatch(setError(error.message));
		return { success: false, error: ERROR_MESSAGES.PROJECT.DELETE_ERROR };
	} finally {
		dispatch(setLoading(false));
	}
};

export const loadProjectMembers = (projectId) => async (dispatch) => {
	dispatch(setLoading(true));
	try {
		const token = await AsyncStorage.getItem("access_token");
		// D'abord, obtenir le projet pour avoir l'ID de l'équipe
		const projectResponse = await axios.get(
			`${API_BASE_URL}${API_ENDPOINTS.PROJECTS.BASE}/${projectId}`,
			{
				headers: {
					Authorization: `Bearer ${token}`,
				},
			}
		);

		if (!projectResponse.data) {
			throw new Error("Projet non trouvé");
		}

		// Vérifier que l'ID de l'équipe est valide
		const teamId = projectResponse.data.teamId || projectResponse.data.idTeam;
		if (!teamId || isNaN(teamId)) {
			throw new Error("ID d'équipe invalide");
		}

		// Ensuite, obtenir les membres de l'équipe
		const teamResponse = await axios.get(
			`${API_BASE_URL}${API_ENDPOINTS.TEAMS.MEMBERS(teamId)}`,
			{
				headers: {
					Authorization: `Bearer ${token}`,
				},
			}
		);

		if (teamResponse.data) {
			dispatch(setProjectMembers(projectId, teamResponse.data));
			return { success: true, data: teamResponse.data };
		}
		return { success: false, error: ERROR_MESSAGES.PROJECT.LOAD_ERROR };
	} catch (error) {
		console.error("Erreur lors du chargement des membres:", error);
		const errorMessage = error.message || ERROR_MESSAGES.PROJECT.LOAD_ERROR;
		dispatch(setError(errorMessage));
		return { success: false, error: errorMessage };
	} finally {
		dispatch(setLoading(false));
	}
};

export const addProjectMember = (projectId, userId) => async (dispatch) => {
	dispatch(setLoading(true));
	try {
		const token = await AsyncStorage.getItem("access_token");
		const response = await axios.post(
			`${API_BASE_URL}${API_ENDPOINTS.PROJECTS.MEMBERS(projectId)}`,
			{ userId },
			{
				headers: {
					Authorization: `Bearer ${token}`,
				},
			}
		);

		if (response.data) {
			await dispatch(loadProjectMembers(projectId));
			return { success: true, data: response.data };
		}
		return { success: false, error: ERROR_MESSAGES.PROJECT.MEMBER_ADD_ERROR };
	} catch (error) {
		console.error("Erreur lors de l'ajout du membre:", error);
		dispatch(setError(error.message));
		return { success: false, error: ERROR_MESSAGES.PROJECT.MEMBER_ADD_ERROR };
	} finally {
		dispatch(setLoading(false));
	}
};

export const removeProjectMember = (projectId, userId) => async (dispatch) => {
	dispatch(setLoading(true));
	try {
		const token = await AsyncStorage.getItem("access_token");
		await axios.delete(
			`${API_BASE_URL}${API_ENDPOINTS.PROJECTS.MEMBER(projectId, userId)}`,
			{
				headers: {
					Authorization: `Bearer ${token}`,
				},
			}
		);

		await dispatch(loadProjectMembers(projectId));
		return { success: true };
	} catch (error) {
		console.error("Erreur lors du retrait du membre:", error);
		dispatch(setError(error.message));
		return {
			success: false,
			error: ERROR_MESSAGES.PROJECT.MEMBER_REMOVE_ERROR,
		};
	} finally {
		dispatch(setLoading(false));
	}
};
