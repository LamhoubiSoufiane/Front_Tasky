import axios from 'axios';
import { getAccessToken, getRefreshToken, saveTokens, removeTokens } from './authService';

const apiClient = axios.create({
  baseURL: 'http://192.168.11.219:3000',
  headers: {
    'Content-Type': 'application/json',
    'Accept': 'application/json'
  },
  timeout: 15000
});

apiClient.interceptors.request.use(async (config) => {
  console.log('Starting request to:', config.url);
  console.log('Full URL:', `${config.baseURL}${config.url}`);
  console.log('Request method:', config.method);
  console.log('Request data:', config.data);
  
  const token = await getAccessToken();
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
    console.log('Token added to request');
  }
  return config;
}, error => {
  console.error('Request error:', error.message);
  return Promise.reject(error);
});

apiClient.interceptors.response.use(
  (response) => {
    console.log('Response received successfully');
    return response;
  },
  async (error) => {
    console.error('Response error details:', {
      message: error.message,
      code: error.code,
      config: error.config ? {
        url: error.config.url,
        method: error.config.method,
        timeout: error.config.timeout
      } : 'No config'
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
