import {
	AUTH_LOADING,
	AUTH_ERROR,
	AUTH_LOGIN_SUCCESS,
	AUTH_LOGIN_FAIL,
	AUTH_REGISTER_SUCCESS,
	AUTH_REGISTER_FAIL,
	AUTH_LOGOUT,
	AUTH_RESET,
	SET_LOGIN_FORM,
	SET_REGISTER_FORM,
	RESET_FORMS,
} from "../types";

const initialState = {
	isAuthenticated: false,
	user: null,
	tokens: {
		access_token: null,
		refresh_token: null,
	},
	loading: false,
	error: null,
	loginForm: {
		email: "",
		password: "",
	},
	registerForm: {
		email: "",
		password: "",
		confirmPassword: "",
		username: "",
		nom: "",
		prenom: "",
		showPassword: false,
	},
};

export default function (state = initialState, action) {
	switch (action.type) {
		case AUTH_LOADING:
			return {
				...state,
				loading: true,
				error: null,
			};

		case AUTH_ERROR:
			return {
				...state,
				loading: false,
				error: action.payload,
			};

		case AUTH_LOGIN_SUCCESS:
			return {
				...state,
				isAuthenticated: true,
				user: action.payload.user,
				tokens: {
					access_token: action.payload.access_token,
					refresh_token: action.payload.refresh_token,
				},
				loading: false,
				error: null,
				loginForm: initialState.loginForm,
			};

		case AUTH_LOGIN_FAIL:
			return {
				...state,
				isAuthenticated: false,
				user: null,
				tokens: initialState.tokens,
				loading: false,
				error: action.payload,
			};

		case AUTH_REGISTER_SUCCESS:
			return {
				...state,
				loading: false,
				error: null,
				registerForm: initialState.registerForm,
			};

		case AUTH_REGISTER_FAIL:
			return {
				...state,
				loading: false,
				error: action.payload,
			};

		case SET_LOGIN_FORM:
			return {
				...state,
				loginForm: {
					...state.loginForm,
					[action.payload.field]: action.payload.value,
				},
				error: null,
			};

		case SET_REGISTER_FORM:
			return {
				...state,
				registerForm: {
					...state.registerForm,
					[action.payload.field]: action.payload.value,
				},
				error: null,
			};

		case RESET_FORMS:
			return {
				...state,
				loginForm: initialState.loginForm,
				registerForm: initialState.registerForm,
				error: null,
			};

		case AUTH_LOGOUT:
		case AUTH_RESET:
			return initialState;

		default:
			return state;
	}
}
