import { PROJECT_TYPES } from "../actions/projectActions";

const initialState = {
	loading: false,
	error: null,
	projects: {},  // Indexed by teamId
	projectMembers: {}, // Indexed by projectId
};

const projectReducer = (state = initialState, action) => {
	switch (action.type) {
		case PROJECT_TYPES.SET_LOADING:
			return {
				...state,
				loading: action.payload,
				error: null,
			};

		case PROJECT_TYPES.SET_ERROR:
			return {
				...state,
				error: action.payload,
				loading: false,
			};

		case PROJECT_TYPES.SET_PROJECTS:
			return {
				...state,
				projects: {
					...state.projects,
					[action.payload.teamId]: action.payload.projects,
				},
				error: null,
			};

		case PROJECT_TYPES.SET_PROJECT_MEMBERS:
			return {
				...state,
				projectMembers: {
					...state.projectMembers,
					[action.payload.projectId]: action.payload.members,
				},
				error: null,
			};

		case PROJECT_TYPES.ADD_PROJECT:
			const teamId = action.payload.teamId;
			return {
				...state,
				projects: {
					...state.projects,
					[teamId]: [...(state.projects[teamId] || []), action.payload],
				},
				error: null,
			};

		case PROJECT_TYPES.UPDATE_PROJECT:
			const updatedTeamId = action.payload.teamId;
			return {
				...state,
				projects: {
					...state.projects,
					[updatedTeamId]: state.projects[updatedTeamId]?.map(project =>
						project.id === action.payload.id ? action.payload : project
					) || [],
				},
				error: null,
			};

		case PROJECT_TYPES.DELETE_PROJECT:
			const newProjects = { ...state.projects };
			Object.keys(newProjects).forEach(teamId => {
				newProjects[teamId] = newProjects[teamId].filter(
					project => project.id !== action.payload
				);
			});
			return {
				...state,
				projects: newProjects,
				error: null,
			};

		default:
			return state;
	}
};

export default projectReducer;
