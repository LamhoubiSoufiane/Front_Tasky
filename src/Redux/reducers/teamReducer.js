import {
	TEAMS_LOADING,
	TEAMS_ERROR,
	TEAMS_LOADED,
	TEAM_MEMBERS_LOADED,
	TEAM_MEMBERS_ERROR,
} from "../types";

const initialState = {
	teams: [],
	teamMembers: {},
	loading: false,
	error: null,
};

export default function (state = initialState, action) {
	switch (action.type) {
		case TEAMS_LOADING:
			return {
				...state,
				loading: true,
				error: null,
			};

		case TEAMS_ERROR:
			return {
				...state,
				loading: false,
				error: action.payload,
			};

		case TEAMS_LOADED:
			return {
				...state,
				teams: action.payload,
				loading: false,
				error: null,
			};

		case TEAM_MEMBERS_LOADED:
			return {
				...state,
				teamMembers: {
					...state.teamMembers,
					[action.payload.teamId]: action.payload.members,
				},
				error: null,
			};

		case TEAM_MEMBERS_ERROR:
			return {
				...state,
				error: action.payload,
			};

		default:
			return state;
	}
}
