import AsyncStorage from '@react-native-async-storage/async-storage';

export const getAuthHeaders = async () => {
    try {
        const token = await AsyncStorage.getItem('accessToken');
        if (!token) {
            throw new Error('No token found');
        }
        return {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json',
        };
    } catch (error) {
        console.error('Error getting auth headers:', error);
        throw error;
    }
};

export const getMultipartHeaders = async () => {
    try {
        const token = await AsyncStorage.getItem('accessToken');
        if (!token) {
            throw new Error('No token found');
        }
        return {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'multipart/form-data',
        };
    } catch (error) {
        console.error('Error getting multipart headers:', error);
        throw error;
    }
}; 