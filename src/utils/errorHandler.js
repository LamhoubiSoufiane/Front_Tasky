import Toast from "react-native-toast-message";
import { clearAuth } from "../Services/authService";
import { CommonActions } from "@react-navigation/native";

const DEFAULT_MESSAGES = {
	400: "Données invalides",
	401: "Session expirée, veuillez vous reconnecter",
	403: "Vous n'avez pas les permissions nécessaires",
	404: "Ressource non trouvée",
	409: "Cette ressource existe déjà",
	500: "Erreur serveur",
};

export const handleApiError = (
	error,
	customMessages = {},
	navigation = null
) => {
	console.log("Détails de l'erreur:", {
		message: error.message,
		status: error.response?.status,
		data: error.response?.data,
	});

	let errorMessage;

	if (error.response) {
		const status = error.response.status;

		if (status === 401 && navigation) {
			clearAuth().then(() => {
				navigation.dispatch(
					CommonActions.reset({
						index: 0,
						routes: [{ name: "Home" }],
					})
				);
			});
		}

		if (error.response.data?.message) {
			errorMessage = error.response.data.message;
		} else {
			errorMessage =
				customMessages[status] ||
				DEFAULT_MESSAGES[status] ||
				DEFAULT_MESSAGES[500];
		}
	} else if (error.request) {
		errorMessage = "Impossible de contacter le serveur";
	} else if (error.message) {
		errorMessage = error.message;
	} else {
		errorMessage = "Une erreur inattendue est survenue";
	}

	Toast.show({
		type: "error",
		text1: "Erreur",
		text2: errorMessage,
		position: "bottom",
		visibilityTime: 3000,
	});

	return errorMessage;
};

export const showSuccessToast = (message) => {
	Toast.show({
		type: "success",
		text1: "Succès",
		text2: message,
		position: "bottom",
		visibilityTime: 2000,
	});
};

export const showInfoToast = (message) => {
	Toast.show({
		type: "info",
		text1: "Info",
		text2: message,
		position: "bottom",
		visibilityTime: 2000,
	});
};
