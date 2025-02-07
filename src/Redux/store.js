import { createStore, combineReducers, applyMiddleware } from "redux";
import { thunk } from "redux-thunk";
import authReducer from "./reducers/authReducer";
import teamReducer from "./reducers/teamReducer";
import memberReducer from "./reducers/memberReducer";
import projectReducer from "./reducers/projectReducer";
import taskReducer from "./reducers/taskReducer";
import userReducer from "./reducers/userReducer";
import helpRequestReducer from "./reducers/helpRequestReducer";

const rootReducer = combineReducers({
	auth: authReducer,
	team: teamReducer,
	member: memberReducer,
	project: projectReducer,
	task: taskReducer,
	user: userReducer,
	helpRequest: helpRequestReducer,
});

const middleware = [thunk];

const store = createStore(rootReducer, applyMiddleware(...middleware));

export default store;
