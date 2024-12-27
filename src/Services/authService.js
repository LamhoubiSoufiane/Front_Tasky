import * as SecureStore from 'expo-secure-store';

export const saveTokens = async (accessToken, refreshToken) => {
    await SecureStore.setItemAsync('accessToken', accessToken);
    await SecureStore.setItemAsync('refreshToken', refreshToken);
};

export const saveUserInfo = async (userInfo) => {
    await SecureStore.setItemAsync('userInfo', JSON.stringify(userInfo));
};

export const getUserInfo = async () => {
    const userInfoStr = await SecureStore.getItemAsync('userInfo');
    return userInfoStr ? JSON.parse(userInfoStr) : null;
};

export const getAccessToken = async () => {
    return await SecureStore.getItemAsync('accessToken');
};

export const getRefreshToken = async () => {
    return await SecureStore.getItemAsync('refreshToken');
};

export const removeTokens = async () => {
    await SecureStore.deleteItemAsync('accessToken');
    await SecureStore.deleteItemAsync('refreshToken');
    await SecureStore.deleteItemAsync('userInfo');
};
