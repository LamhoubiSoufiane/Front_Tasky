// import { API_BASE_URL, API_ENDPOINTS } from "../../config";
// import axios from "axios";
// import AsyncStorage from "@react-native-async-storage/async-storage";
// import { ERROR_MESSAGES } from "../../config";

// // Action Types
// export const TASK_TYPES = {
//     SET_LOADING: "SET_TASK_LOADING",
//     SET_ERROR: "SET_TASK_ERROR",
//     SET_TASKS: "SET_TASKS",
//     ADD_TASK: "ADD_TASK",
//     UPDATE_TASK: "UPDATE_TASK",
//     DELETE_TASK: "DELETE_TASK",
// };

// // Action Creators
// const setLoading = (loading) => ({
//     type: TASK_TYPES.SET_LOADING,
//     payload: loading,
// });

// const setError = (error) => ({
//     type: TASK_TYPES.SET_ERROR,
//     payload: error,
// });

// const setTasks = (projectId, tasks) => ({
//     type: TASK_TYPES.SET_TASKS,
//     payload: { projectId, tasks },
// });

// const addTask = (task) => ({
//     type: TASK_TYPES.ADD_TASK,
//     payload: task,
// });

// const updateTask = (task) => ({
//     type: TASK_TYPES.UPDATE_TASK,
//     payload: task,
// });

// const deleteTask = (taskId) => ({
//     type: TASK_TYPES.DELETE_TASK,
//     payload: taskId,
// });

// // Thunk Actions
// export const loadProjectTasks = (projectId) => async (dispatch) => {
//     dispatch(setLoading(true));
//     try {
//         const token = await AsyncStorage.getItem("access_token");
//         const response = await axios.get(
//             `${API_BASE_URL}${API_ENDPOINTS.TASKS.PROJECT(projectId)}`,
//             { token }
//         );

//         if (response.data) {
//             dispatch(setTasks(projectId, response.data));
//             return { success: true, data: response.data };
//         }
//         return { success: false, error: ERROR_MESSAGES.TASK.LOAD_ERROR };
//     } catch (error) {
//         console.error("Erreur lors du chargement des tâches:", error);
//         dispatch(setError(error.message));
//         return { success: false, error: ERROR_MESSAGES.TASK.LOAD_ERROR };
//     } finally {
//         dispatch(setLoading(false));
//     }
// };

// export const createTask = (taskData) => async (dispatch) => {
//     dispatch(setLoading(true));
//     try {
//         const token = await AsyncStorage.getItem("access_token");
//         const response = await axios.post(
//             `${API_BASE_URL}${API_ENDPOINTS.TASKS.CREATE}`,
//             taskData,
//             { token }
//         );

//         if (response.data) {
//             dispatch(addTask(response.data));
//             return { success: true, data: response.data };
//         }
//         return { success: false, error: ERROR_MESSAGES.TASK.CREATE_ERROR };
//     } catch (error) {
//         console.error("Erreur lors de la création de la tâche:", error);
//         dispatch(setError(error.message));
//         return { success: false, error: ERROR_MESSAGES.TASK.CREATE_ERROR };
//     } finally {
//         dispatch(setLoading(false));
//     }
// };

// export const updateTaskDetails = (taskId, taskData) => async (dispatch) => {
//     dispatch(setLoading(true));
//     try {
//         const token = await AsyncStorage.getItem("access_token");
//         const response = await axios.put(
//             `${API_BASE_URL}${API_ENDPOINTS.TASKS.UPDATE(taskId)}`,
//             taskData,
//             { token }
//         );

//         if (response.data) {
//             dispatch(updateTask(response.data));
//             return { success: true, data: response.data };
//         }
//         return { success: false, error: ERROR_MESSAGES.TASK.UPDATE_ERROR };
//     } catch (error) {
//         console.error("Erreur lors de la mise à jour de la tâche:", error);
//         dispatch(setError(error.message));
//         return { success: false, error: ERROR_MESSAGES.TASK.UPDATE_ERROR };
//     } finally {
//         dispatch(setLoading(false));
//     }
// };

// export const deleteTaskById = (taskId) => async (dispatch) => {
//     dispatch(setLoading(true));
//     try {
//         const token = await AsyncStorage.getItem("access_token");
//         await axios.delete(
//             `${API_BASE_URL}${API_ENDPOINTS.TASKS.DELETE(taskId)}`,
//             { token }
//         );

//         dispatch(deleteTask(taskId));
//         return { success: true };
//     } catch (error) {
//         console.error("Erreur lors de la suppression de la tâche:", error);
//         dispatch(setError(error.message));
//         return { success: false, error: ERROR_MESSAGES.TASK.DELETE_ERROR };
//     } finally {
//         dispatch(setLoading(false));
//     }
// };

// export const assignTask = (taskId, userId) => async (dispatch) => {
//     dispatch(setLoading(true));
//     try {
//         const token = await AsyncStorage.getItem("access_token");
//         const response = await axios.post(
//             `${API_BASE_URL}${API_ENDPOINTS.TASKS.ASSIGN(taskId)}`,
//             { userId },
//             { token }
//         );

//         if (response.data) {
//             dispatch(updateTask(response.data));
//             return { success: true, data: response.data };
//         }
//         return { success: false, error: ERROR_MESSAGES.TASK.ASSIGN_ERROR };
//     } catch (error) {
//         console.error("Erreur lors de l'assignation de la tâche:", error);
//         dispatch(setError(error.message));
//         return { success: false, error: ERROR_MESSAGES.TASK.ASSIGN_ERROR };
//     } finally {
//         dispatch(setLoading(false));
//     }
// };

// export const updateTaskStatus = (taskId, status) => async (dispatch) => {
//     dispatch(setLoading(true));
//     try {
//         const token = await AsyncStorage.getItem("access_token");
//         const response = await axios.put(
//             `${API_BASE_URL}${API_ENDPOINTS.TASKS.STATUS(taskId)}`,
//             { status },
//             { token }
//         );

//         if (response.data) {
//             dispatch(updateTask(response.data));
//             return { success: true, data: response.data };
//         }
//         return { success: false, error: ERROR_MESSAGES.TASK.UPDATE_ERROR };
//     } catch (error) {
//         console.error("Erreur lors de la mise à jour du statut:", error);
//         dispatch(setError(error.message));
//         return { success: false, error: ERROR_MESSAGES.TASK.UPDATE_ERROR };
//     } finally {
//         dispatch(setLoading(false));
//     }
// }; 

import { mockTasks } from '../../data/mockTasks';

// Action Types
export const SET_TASKS = 'SET_TASKS';
export const SET_USER_LOCATION = 'SET_USER_LOCATION';
export const SET_LOADING = 'SET_LOADING';
export const SET_ERROR = 'SET_ERROR';

// Action Creators
export const setTasks = (tasks) => ({
  type: SET_TASKS,
  payload: tasks,
});

export const setUserLocation = (location) => ({
  type: SET_USER_LOCATION,
  payload: location,
});

export const setLoading = (loading) => ({
  type: SET_LOADING,
  payload: loading,
});

export const setError = (error) => ({
  type: SET_ERROR,
  payload: error,
});

// Thunk Actions
export const loadInitialTasks = () => {
  return (dispatch) => {
    dispatch(setLoading(true));
    try {
      dispatch(setTasks(mockTasks));
    } catch (error) {
      console.error("Error loading tasks:", error);
      dispatch(setError(error.message));
    } finally {
      dispatch(setLoading(false));
    }
  };
};

export const fetchTasks = () => {
  return async (dispatch) => {
    dispatch(setLoading(true));
    try {
      // Commented for now, using mock data
      /*
      const response = await fetch('YOUR_API_ENDPOINT/tasks');
      const data = await response.json();
      dispatch(setTasks(data));
      */
      dispatch(setTasks(mockTasks));
    } catch (error) {
      dispatch(setError(error.message));
    } finally {
      dispatch(setLoading(false));
    }
  };
};
