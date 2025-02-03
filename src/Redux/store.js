import { createStore, combineReducers, applyMiddleware } from "redux";
import { thunk } from "redux-thunk";
import authReducer from "./reducers/authReducer";
import teamReducer from "./reducers/teamReducer";
import memberReducer from "./reducers/memberReducer";
import projectReducer from "./reducers/projectReducer";
import taskReducer from "./reducers/taskReducer";

const rootReducer = combineReducers({
	auth: authReducer,
	team: teamReducer,
	member: memberReducer,
	project: projectReducer,
	task: taskReducer,
});

const middleware = [thunk];

const store = createStore(rootReducer, applyMiddleware(...middleware));

export default store;
