import axios from 'axios';
import { getAccessToken, getRefreshToken, saveTokens, removeTokens } from './authService';

const apiClient = axios.create({
  baseURL: 'http://192.168.1.21:3000',
  headers: {
    'Content-Type': 'application/json',
    'Accept': 'application/json'
  },
  timeout: 5000, // Reduced timeout to 5 seconds
  retry: 3,
  retryDelay: 1000
});

apiClient.interceptors.request.use(async (config) => {
  console.log(`Making ${config.method.toUpperCase()} request to: ${config.baseURL}${config.url}`);
  console.log('Request data:', config.data);
  
  const token = await getAccessToken();
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
}, error => {
  console.error('Request interceptor error:', error);
  return Promise.reject(error);
});

apiClient.interceptors.response.use(
  (response) => {
    console.log('Response received:', {
      status: response.status,
      url: response.config.url,
      data: response.data
    });
    return response;
  },
  async (error) => {
    console.error('Response error:', {
      message: error.message,
      status: error.response?.status,
      data: error.response?.data
    });

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
      } catch (error) {
        console.error('Token refresh error:', error);
        await removeTokens();
        return Promise.reject(error);
      }
    }
    return Promise.reject(error);
  }
);

export default apiClient;
