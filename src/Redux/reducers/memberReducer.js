import {
	MEMBER_LOADING,
	MEMBER_ERROR,
	MEMBER_SUCCESS,
	MEMBER_ADD_SUCCESS,
	MEMBER_REMOVE_SUCCESS,
} from "../types";

const initialState = {
	members: [],
	loading: false,
	error: null,
};

export default function (state = initialState, action) {
	switch (action.type) {
		case MEMBER_LOADING:
			return {
				...state,
				loading: true,
				error: null,
			};

		case MEMBER_ERROR:
			return {
				...state,
				loading: false,
				error: action.payload,
			};

		case MEMBER_SUCCESS:
			return {
				...state,
				members: action.payload,
				loading: false,
				error: null,
			};

		case MEMBER_ADD_SUCCESS:
			return {
				...state,
				members: [...state.members, action.payload],
				loading: false,
				error: null,
			};

		case MEMBER_REMOVE_SUCCESS:
			return {
				...state,
				members: state.members.filter(
					(member) => member.id !== action.payload.userId
				),
				loading: false,
				error: null,
			};

		default:
			return state;
	}
}
