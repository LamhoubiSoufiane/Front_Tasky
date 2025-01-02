import { USER_LOADING, USER_ERROR, USER_SUCCESS, USER_UPDATE } from "../types";

const initialState = {
	searchResults: [],
	currentUser: null,
	loading: false,
	error: null,
};

export default function (state = initialState, action) {
	switch (action.type) {
		case USER_LOADING:
			return {
				...state,
				loading: true,
				error: null,
			};

		case USER_ERROR:
			return {
				...state,
				loading: false,
				error: action.payload,
			};

		case USER_SUCCESS:
			return {
				...state,
				searchResults: action.payload,
				loading: false,
				error: null,
			};

		case USER_UPDATE:
			return {
				...state,
				currentUser: action.payload,
				loading: false,
				error: null,
			};

		default:
			return state;
	}
}
