import axios from 'axios';
import { getAccessToken, getRefreshToken, saveTokens, removeTokens } from './authService';

// Créer une instance axios avec la configuration de base
const apiClient = axios.create({
  baseURL: 'http://192.168.11.219:3000',
  headers: {
    'Content-Type': 'application/json',
    'Accept': 'application/json'
  },
  timeout: 10000, // Réduire le timeout à 10 secondes
  timeoutErrorMessage: 'La connexion au serveur a échoué. Vérifiez votre connexion réseau.',
  // Ajouter la validation du statut HTTP
  validateStatus: function (status) {
    return status >= 200 && status < 300; // Par défaut, seulement les statuts 2xx sont valides
  }
});

// Intercepteur pour les requêtes
apiClient.interceptors.request.use(async (config) => {
  console.log('=== Début de la requête ===');
  console.log('URL complète:', `${config.baseURL}${config.url}`);
  console.log('Méthode:', config.method?.toUpperCase());
  console.log('Données envoyées:', config.data);
  console.log('Headers:', config.headers);
  
  const token = await getAccessToken();
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
    console.log('Token ajouté aux headers');
  }
  return config;
}, error => {
  console.error('Erreur lors de la préparation de la requête:', error.message);
  return Promise.reject(error);
});

// Intercepteur pour les réponses
apiClient.interceptors.response.use(
  (response) => {
    console.log('=== Réponse reçue ===');
    console.log('Status:', response.status);
    console.log('Données reçues:', response.data);
    return response;
  },
  async (error) => {
    console.error('=== Erreur de réponse ===');
    if (error.code === 'ECONNABORTED') {
      console.error('Timeout - Détails:', {
        url: error.config?.url,
        method: error.config?.method,
        timeout: error.config?.timeout,
        baseURL: error.config?.baseURL
      });
    } else {
      console.error('Erreur détaillée:', {
        message: error.message,
        status: error.response?.status,
        data: error.response?.data,
        config: {
          url: error.config?.url,
          method: error.config?.method,
          timeout: error.config?.timeout
        }
      });
    }

    // Gestion du refresh token
    const originalRequest = error.config;
    if (error.response?.status === 401 && !originalRequest._retry) {
      originalRequest._retry = true;
      try {
        const refreshToken = await getRefreshToken();
        const response = await apiClient.post('/auth/refresh-token', { refreshToken });
        const { access_token, refresh_token } = response.data;
        await saveTokens(access_token, refresh_token);
        originalRequest.headers.Authorization = `Bearer ${access_token}`;
        return axios(originalRequest);
      } catch (refreshError) {
        console.error('Erreur lors du refresh du token:', refreshError);
        await removeTokens();
        return Promise.reject(refreshError);
      }
    }
    return Promise.reject(error);
  }
);

export default apiClient;
