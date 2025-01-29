import { TASK_TYPES, SET_USER_LOCATION, SET_LOADING, SET_ERROR, SET_TASKS } from '../actions/taskActions';
import { mockTasks } from '../../data/mockTasks';

const initialState = {
    loading: false,
    error: null,
    tasks: mockTasks,  // Organisé par projectId
    userLocation: null,
    
};

const taskReducer = (state = initialState, action) => {
    switch (action.type) {
        case TASK_TYPES.SET_LOADING:
            return {
                ...state,
                loading: action.payload,
            };

        case TASK_TYPES.SET_ERROR:
            return {
                ...state,
                error: action.payload,
            };

        case SET_TASKS:
            return {
                ...state,
                tasks: Array.isArray(action.payload) ? action.payload : [],
            };

        case SET_USER_LOCATION:
            return {
                ...state,
                userLocation: action.payload,
            };

        case TASK_TYPES.ADD_TASK:
            return {
                ...state,
                tasks: [...state.tasks, action.payload],
            };

        case TASK_TYPES.UPDATE_TASK:
            return {
                ...state,
                tasks: state.tasks.map((task) =>
                    task.id === action.payload.id ? action.payload : task
                ),
            };

        case TASK_TYPES.DELETE_TASK:
            return {
                ...state,
                tasks: state.tasks.filter((task) => task.id !== action.payload),
            };

        default:
            return state;
    }
};

export default taskReducer; 