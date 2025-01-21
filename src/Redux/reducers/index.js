import { combineReducers } from 'redux';
import authReducer from './authReducer';
import projectReducer from './projectReducer';
import teamReducer from './teamReducer';
import taskReducer from './taskReducer';

const rootReducer = combineReducers({
    auth: authReducer,
    project: projectReducer,
    team: teamReducer,
    task: taskReducer,
});

export default rootReducer; 