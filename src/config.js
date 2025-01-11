export const API_BASE_URL = "http://192.168.1.8:3000";

export const API_ENDPOINTS = {
	// Auth endpoints
	AUTH: {
		LOGIN: "/auth/login",
		REGISTER: "/auth/register",
		LOGOUT: "/auth/logout",
		REFRESH_TOKEN: "/auth/refresh-token",
		FORGOT_PASSWORD: "/auth/forgot-password",
		RESET_PASSWORD: "/auth/reset-password",
	},
	// Teams endpoints
	TEAMS: {
		BASE: "/teams",
		GET_USER_TEAMS: "/teams/user",
		GET_TEAM_MEMBERS: "/teams/members",
		ADD_MEMBER: "/teams/members",
		REMOVE_MEMBER: "/teams/members",
	},
	// Users endpoints
	USERS: {
		BASE: "/users",
		SEARCH: "/users/search",
		UPDATE_PROFILE: "/users/profile",
		CHANGE_PASSWORD: "/users/change-password",
	},
};

export const API_TIMEOUT = 15000; // 15 seconds timeout

export const ERROR_MESSAGES = {
	NETWORK_ERROR: "Erreur de connexion au serveur",
	UNAUTHORIZED: "Session expirée. Veuillez vous reconnecter.",
	SERVER_ERROR: "Une erreur est survenue. Veuillez réessayer plus tard.",
	NOT_FOUND: "Ressource non trouvée",
	FORBIDDEN: "Accès non autorisé",
	TEAM: {
		LOAD_ERROR: "Erreur lors du chargement des équipes",
		CREATE_ERROR: "Erreur lors de la création de l'équipe",
		UPDATE_ERROR: "Erreur lors de la mise à jour de l'équipe",
		DELETE_ERROR: "Erreur lors de la suppression de l'équipe",
		MEMBER_ADD_ERROR: "Erreur lors de l'ajout du membre",
		MEMBER_REMOVE_ERROR: "Erreur lors du retrait du membre",
	},
};
