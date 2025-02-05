// API Configuration
export const API_BASE_URL = "http://192.168.11.105:3000";
export const API_ENDPOINTS = {
	AUTH: {
		LOGIN: "/auth/login",
		REGISTER: "/auth/register",
		LOGOUT: "/auth/logout",
		REFRESH: "/auth/refresh",
	},
	TEAMS: {
		BASE: "/teams",
		USER: (userId) => `/teams/user/${userId}`,
		MEMBERS: (teamId) => `/teams/${teamId}/members`,
		MEMBER: (teamId, userId) => `/teams/${teamId}/members/${userId}`,
	},
	USERS: {
		BASE: "/users",
		SEARCH: "/users/search",
		PROFILE: "/users/profile",
	},
	TASKS: {
		BASE: "/tasks",
		CREATE: "/tasks",
		USER: (userId) => `/tasks/user/${userId}`,
		TEAM: (teamId) => `/tasks/team/${teamId}`,
		PROJECT: (projectId) => `/tasks/project/${projectId}`,
		UPDATE: (taskId) => `/tasks/${taskId}`,
		DELETE: (taskId) => `/tasks/${taskId}`,
		ASSIGN: (taskId) => `/tasks/${taskId}/assign`,
		STATUS: (taskId) => `/tasks/${taskId}/status`,
	},
	PROJECTS: {
		BASE: "/projets",
		CREATE: "/projets",
		FIND: "/projets/find",
		UPDATE: "/projets/update",
		DELETE: (id) => `/projets/${id}`,
		TEAM: (teamId) => `/projets/team/${teamId}`,
		MEMBERS: (projectId) => `/projets/${projectId}/members`,
		MEMBER: (projectId, userId) => `/projets/${projectId}/members/${userId}`,
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
	PROJECT: {
		LOAD_ERROR: "Erreur lors du chargement des projets",
		CREATE_ERROR: "Erreur lors de la création du projet",
		UPDATE_ERROR: "Erreur lors de la mise à jour du projet",
		DELETE_ERROR: "Erreur lors de la suppression du projet",
		MEMBER_ADD_ERROR: "Erreur lors de l'ajout du membre au projet",
		MEMBER_REMOVE_ERROR: "Erreur lors du retrait du membre du projet",
	},
	TASK: {
		LOAD_ERROR: "Erreur lors du chargement des tâches",
		CREATE_ERROR: "Erreur lors de la création de la tâche",
		UPDATE_ERROR: "Erreur lors de la mise à jour de la tâche",
		DELETE_ERROR: "Erreur lors de la suppression de la tâche",
		ASSIGN_ERROR: "Erreur lors de l'assignation de la tâche",
	},
};
