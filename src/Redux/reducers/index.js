import { combineReducers } from 'redux';
import authReducer from './authReducer';
import projectReducer from './projectReducer';
import teamReducer from './teamReducer';
import taskReducer from './taskReducer';
import helpRequestReducer from './helpRequestReducer';

const rootReducer = combineReducers({
    auth: authReducer,
    project: projectReducer,
    team: teamReducer,
    task: taskReducer,
    helpRequest: helpRequestReducer,
});

export default rootReducer; 