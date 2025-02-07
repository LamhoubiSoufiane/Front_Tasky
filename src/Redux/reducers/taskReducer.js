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

const taskReducer = (state = initialState, action) => {
    switch (action.type) {
        case TASK_TYPES.TASKS_FETCH_START:
            console.log('Reducer: Starting fetch...');
            return {
                ...state,
                loading: true,
                error: null,
            };

        case TASK_TYPES.TASKS_FETCH_SUCCESS:
            console.log('Reducer: Fetch success with data:', action.payload);
            return {
                ...state,
                tasks: Array.isArray(action.payload) ? action.payload : [],
                loading: false,
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
                error: action.payload,
                loading: false,
            };

        case TASK_TYPES.SET_PROJECT_TASKS:
            console.log('Reducer: Setting project tasks:', action.payload);
            return {
                ...state,
                projectTasks: Array.isArray(action.payload) ? action.payload : [],
                loading: false,
                error: null,
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
            return {
                ...state,
                tasks: [...state.tasks, action.payload],
                projectTasks: [...state.projectTasks, action.payload],
                loading: false,
                error: null,
            };

        case TASK_TYPES.UPDATE_TASK:
            console.log('Reducer: Updating task:', action.payload);
            const updatedProjectTasks = state.projectTasks.map(task =>
                task.id === action.payload.id ? action.payload : task
            );
            return {
                ...state,
                tasks: state.tasks.map(task =>
                    task.id === action.payload.id ? action.payload : task
                ),
                projectTasks: updatedProjectTasks,
                loading: false,
                error: null,
            };

        case TASK_TYPES.DELETE_TASK:
            console.log('Reducer: Deleting task:', action.payload);
            return {
                ...state,
                tasks: state.tasks.filter(task => task.id !== action.payload),
                projectTasks: state.projectTasks.filter(task => task.id !== action.payload),
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

export default taskReducer;
