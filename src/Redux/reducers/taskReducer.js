import {
    TASK_TYPES,
    SET_USER_LOCATION,
    SET_LOADING,
    SET_ERROR,
    SET_TASKS,
    SET_PROJECT_TASKS,
} from "../actions/taskActions";
import { mockTasks } from "../../data/mockTasks";

const initialState = {
    tasks: [],
    projectTasks: [],
    loading: false,
    error: null,
    userLocation: null,
    cache: {
        timestamp: null,
        data: null
    }
};

export default function taskReducer(state = initialState, action) {
    switch (action.type) {
        case TASK_TYPES.TASKS_FETCH_START:
            console.log('Reducer: Starting fetch...');
            return {
                ...state,
                loading: true,
                error: null
            };

        case TASK_TYPES.TASKS_FETCH_SUCCESS:
            console.log('Tâches reçues dans le reducer:', action.payload);
            const formattedTasks = Array.isArray(action.payload) ? action.payload.map(task => ({
                ...task,
                location: task.location ? {
                    ...task.location,
                    latitude: String(task.location.latitude),
                    longitude: String(task.location.longitude)
                } : null
            })) : [];
            console.log('Tâches formatées:', formattedTasks);
            return {
                ...state,
                loading: false,
                tasks: formattedTasks,
                error: null,
                cache: {
                    timestamp: Date.now(),
                    data: action.payload
                }
            };

        case TASK_TYPES.TASKS_FETCH_FAILURE:
            console.log('Reducer: Fetch failed with error:', action.payload);
            return {
                ...state,
                loading: false,
            };

        case TASK_TYPES.SET_PROJECT_TASKS:
            console.log('Reducer: Setting project tasks:', action.payload);
            return {
                ...state,
                projectTasks: Array.isArray(action.payload) ? action.payload : [],
                loading: false,
                error: null,
                error: action.payload
            };

        case TASK_TYPES.CLEAR_PROJECT_TASKS:
            console.log('Reducer: Clearing project tasks');
            return {
                ...state,
                projectTasks: [],
                loading: false,
                error: null,
            };

        case TASK_TYPES.CREATE_TASK:
            console.log('Reducer: Creating new task:', action.payload);
            console.log('Nouvelle tâche créée:', action.payload);
            const newTask = {
                ...action.payload,
                location: action.payload.location ? {
                    ...action.payload.location,
                    latitude: String(action.payload.location.latitude),
                    longitude: String(action.payload.location.longitude)
                } : null
            };
            return {
                ...state,
                tasks: [...state.tasks, newTask],
                projectTasks: [...state.projectTasks, newTask],
                loading: false,
                error: null,
            };

        case TASK_TYPES.UPDATE_TASK:
            console.log('Tâche mise à jour:', action.payload);
            const updatedTask = {
                ...action.payload,
                location: action.payload.location ? {
                    ...action.payload.location,
                    latitude: String(action.payload.location.latitude),
                    longitude: String(action.payload.location.longitude)
                } : null
            };
            return {
                ...state,
                tasks: state.tasks.map(task =>
                    task.id === action.payload.id ? updatedTask : task
                ),
                projectTasks: state.projectTasks.map(task =>
                    task.id === action.payload.id ? updatedTask : task
                ),
                loading: false,
                error: null,
            };

        case TASK_TYPES.DELETE_TASK:
            console.log('Tâche supprimée:', action.payload);
            return {
                ...state,
                tasks: state.tasks.filter(task => task.id !== action.payload),
                projectTasks: state.projectTasks.filter(task => task.id !== action.payload),
                loading: false,
                error: null,
            };

        case TASK_TYPES.SET_PROJECT_TASKS:
            console.log("Mise à jour des tâches du projet:", action.payload);
            return {
                ...state,
                projectTasks: Array.isArray(action.payload) ? action.payload : [],
                loading: false,
                error: null,
            };

        case SET_USER_LOCATION:
            return {
                ...state,
                userLocation: action.payload,
            };

        default:
            return state;
    }
};
