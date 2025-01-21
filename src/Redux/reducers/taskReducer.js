import { TASK_TYPES } from '../actions/taskActions';

const initialState = {
    loading: false,
    error: null,
    tasks: {},  // Organisé par projectId
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
                tasks: {
                    ...state.tasks,
                    [action.payload.projectId]: action.payload.tasks,
                },
                loading: false,
                error: null,
            };

        case TASK_TYPES.ADD_TASK: {
            const projectId = action.payload.projectId;
            return {
                ...state,
                tasks: {
                    ...state.tasks,
                    [projectId]: [
                        ...(state.tasks[projectId] || []),
                        action.payload,
                    ],
                },
                loading: false,
                error: null,
            };
        }

        case TASK_TYPES.UPDATE_TASK: {
            const projectId = action.payload.projectId;
            return {
                ...state,
                tasks: {
                    ...state.tasks,
                    [projectId]: state.tasks[projectId].map(task =>
                        task.id === action.payload.id ? action.payload : task
                    ),
                },
                loading: false,
                error: null,
            };
        }

        case TASK_TYPES.DELETE_TASK: {
            const newTasks = { ...state.tasks };
            Object.keys(newTasks).forEach(projectId => {
                newTasks[projectId] = newTasks[projectId].filter(
                    task => task.id !== action.payload
                );
            });
            return {
                ...state,
                tasks: newTasks,
                loading: false,
                error: null,
            };
        }

        default:
            return state;
    }
};

export default taskReducer; 