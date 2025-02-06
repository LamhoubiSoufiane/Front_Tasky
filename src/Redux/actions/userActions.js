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
/*
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
*/
export const getUserProfile = () => async (dispatch) => {
	try {
		dispatch({ type: USER_LOADING });
		const token = await AsyncStorage.getItem('access_token');
		
		if (!token) {
			throw new Error("Token manquant ou expiré");
		}

		const response = await axios.get(
			`${API_BASE_URL}${API_ENDPOINTS.USERS.PROFILE}`,
			{
				headers: { 
					Authorization: `Bearer ${token}` 
				}
			}
		);

		console.log('Données du profil reçues:', response.data);
		
		// S'assurer que l'URL de l'image est complète
		if (response.data && response.data.imageUrl && !response.data.imageUrl.startsWith('http')) {
			response.data.imageUrl = `${API_BASE_URL}${response.data.imageUrl}`;
		}

		dispatch({
			type: USER_SUCCESS,
			payload: response.data
		});
	} catch (error) {
		console.error("Erreur lors de la récupération du profil:", error);
		dispatch({
			type: USER_ERROR,
			payload: error.message || "Erreur lors de la récupération du profil"
		});
	}
};

//-------------------------------------------
export const updateUserProfile = (userData, image) => async (dispatch) => {
	try {
		dispatch({ type: USER_LOADING });
		const token = await AsyncStorage.getItem('access_token');
		
		// Si une nouvelle image est fournie, l'uploader d'abord
		if (image && image.uri) {
			console.log('Préparation de l\'upload de l\'image:', image);
			const imageFormData = new FormData();
			imageFormData.append('file', {
				uri: image.uri,
				type: 'image/jpeg',
				name: image.name
			});

			try {
				const uploadResponse = await axios.post(
					`${API_BASE_URL}/upload`,
					imageFormData,
					{
						headers: {
							'Authorization': `Bearer ${token}`,
							'Content-Type': 'multipart/form-data',
						}
					}
				);
				
				console.log('Réponse de l\'upload:', uploadResponse.data);
				
				if (uploadResponse.data && uploadResponse.data.imageUrl) {
					// Mettre à jour l'URL de l'image dans les données utilisateur
					userData.imageUrl = uploadResponse.data.imageUrl;
					console.log('URL de l\'image mise à jour:', userData.imageUrl);
				}
			} catch (uploadError) {
				console.error('Erreur lors de l\'upload de l\'image:', uploadError);
				throw new Error('Erreur lors de l\'upload de l\'image');
			}
		}

		// Mettre à jour le profil utilisateur
		console.log('Mise à jour du profil avec les données:', userData);
		const response = await axios.put(
			`${API_BASE_URL}${API_ENDPOINTS.USERS.PROFILE}`,
			userData,
			{
				headers: {
					'Authorization': `Bearer ${token}`,
					'Content-Type': 'application/json'
				}
			}
		);

		console.log('Réponse de la mise à jour du profil:', response.data);

		if (response.status === 200) {
			dispatch({ 
				type: USER_UPDATE, 
				payload: response.data 
			});
			
			// Recharger immédiatement le profil
			await dispatch(getUserProfile());
			
			return { success: true, user: response.data };
		} else {
			throw new Error('Erreur lors de la mise à jour du profil');
		}
	} catch (error) {
		console.error('Erreur de mise à jour:', error);
		dispatch({
			type: USER_ERROR,
			payload: error.message || 'Erreur lors de la mise à jour du profil'
		});
		return { success: false, error: error.message };
	}
};