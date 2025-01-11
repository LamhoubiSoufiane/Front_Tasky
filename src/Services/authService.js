import AsyncStorage from "@react-native-async-storage/async-storage";

export const setTokens = async (accessToken, refreshToken) => {
	try {
		await AsyncStorage.setItem("@access_token", accessToken);
		await AsyncStorage.setItem("@refresh_token", refreshToken);
	} catch (error) {
		console.error("Erreur lors de la sauvegarde des tokens:", error);
		throw error;
	}
};

export const getTokens = async () => {
	try {
		const accessToken = await AsyncStorage.getItem("@access_token");
		const refreshToken = await AsyncStorage.getItem("@refresh_token");
		return { accessToken, refreshToken };
	} catch (error) {
		console.error("Erreur lors de la récupération des tokens:", error);
		throw error;
	}
};

export const removeTokens = async () => {
	try {
		await AsyncStorage.multiRemove([
			"@access_token",
			"@refresh_token",
			"@user_data",
		]);
	} catch (error) {
		console.error("Erreur lors de la suppression des tokens:", error);
		throw error;
	}
};

export const setUser = async (userData) => {
	try {
		await AsyncStorage.setItem("@user_data", JSON.stringify(userData));
	} catch (error) {
		console.error(
			"Erreur lors de la sauvegarde des données utilisateur:",
			error
		);
		throw error;
	}
};

export const getUser = async () => {
	try {
		const userData = await AsyncStorage.getItem("@user_data");
		return userData ? JSON.parse(userData) : null;
	} catch (error) {
		console.error(
			"Erreur lors de la récupération des données utilisateur:",
			error
		);
		throw error;
	}
};
