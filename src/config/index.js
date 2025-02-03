export const API_BASE_URL = "http://localhost:3000/api";

export const API_ENDPOINTS = {
	AUTH: {
		LOGIN: "/auth/login",
		REGISTER: "/auth/register",
		LOGOUT: "/auth/logout",
		REFRESH: "/auth/refresh",
	},
	USERS: {
		BASE: "/users",
		SEARCH: "/users/search",
		PROFILE: "/users/profile",
	},
	TEAMS: {
		BASE: "/teams",
		USER: (userId) => `/teams/user/${userId}`,
		MEMBERS: (teamId) => `/teams/${teamId}/members`,
		MEMBER: (teamId, userId) => `/teams/${teamId}/members/${userId}`,
	},
	PROJECTS: {
		BASE: "/projets",
		CREATE: "/projets",
		TEAM: (teamId) => `/projets/team/${teamId}`,
		MEMBERS: (projectId) => `/projets/${projectId}/members`,
		MEMBER: (projectId, userId) => `/projets/${projectId}/members/${userId}`,
		UPDATE: "/projets/update",
		DELETE: (projectId) => `/projets/${projectId}`,
	},
	TASKS: {
		BASE: "/tasks",
		CREATE: "/tasks",
		PROJECT: (projectId) => `/tasks/project/${projectId}`,
		UPDATE: (taskId) => `/tasks/${taskId}`,
		DELETE: (taskId) => `/tasks/${taskId}`,
		ASSIGN: (taskId) => `/tasks/${taskId}/assign`,
		STATUS: (taskId) => `/tasks/${taskId}/status`,
	},
};
