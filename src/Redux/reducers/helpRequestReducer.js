import { HELP_REQUEST_TYPES } from '../actions/helpRequestActions';

const initialState = {
    pendingRequests: [],
    loading: false,
    error: null,
};

const helpRequestReducer = (state = initialState, action) => {
    switch (action.type) {
        case HELP_REQUEST_TYPES.FETCH_PENDING_START:
            console.log("Début du chargement des demandes d'aide");
            return {
                ...state,
                loading: true,
                error: null,
            };

        case HELP_REQUEST_TYPES.FETCH_PENDING_SUCCESS:
            console.log("Mise à jour des demandes d'aide:", action.payload);
            return {
                ...state,
                pendingRequests: action.payload,
                loading: false,
                error: null,
            };

        case HELP_REQUEST_TYPES.FETCH_PENDING_FAILURE:
            console.log("Échec du chargement des demandes d'aide:", action.payload);
            return {
                ...state,
                loading: false,
                error: action.payload,
                pendingRequests: [],
            };

        case HELP_REQUEST_TYPES.CREATE_REQUEST:
            console.log("Création d'une nouvelle demande d'aide:", action.payload);
            return {
                ...state,
                pendingRequests: [...state.pendingRequests, action.payload],
                loading: false,
                error: null,
            };

        case HELP_REQUEST_TYPES.UPDATE_REQUEST:
            console.log("Mise à jour d'une demande d'aide:", action.payload);
            return {
                ...state,
                pendingRequests: state.pendingRequests.map(request =>
                    request.id === action.payload.id ? action.payload : request
                ),
                loading: false,
                error: null,
            };

        default:
            return state;
    }
};

export default helpRequestReducer; 