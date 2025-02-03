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
};

const taskReducer = (state = initialState, action) => {
	switch (action.type) {
		case TASK_TYPES.SET_LOADING:
			return {
				...state,
				loading: action.payload,
				error: null,
			};

		case TASK_TYPES.SET_ERROR:
			return {
				...state,
				error: action.payload,
				loading: false,
			};

		case TASK_TYPES.SET_TASKS:
			return {
				...state,
				tasks: action.payload,
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

		case TASK_TYPES.CREATE_TASK:
			const newTask = action.payload;
			return {
				...state,
				tasks: [...state.tasks, newTask],
				projectTasks: [...state.projectTasks, newTask],
				loading: false,
				error: null,
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
