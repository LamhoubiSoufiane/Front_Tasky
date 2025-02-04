import { mockTasks } from "../../data/mockTasks";
import axios from "axios";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { API_BASE_URL, API_ENDPOINTS, ERROR_MESSAGES } from "../../config";
import Toast from "react-native-toast-message";

// Configuration axios avec intercepteur pour le token
const api = axios.create({
  baseURL: API_BASE_URL,
  timeout: 10000,
  headers: {
    "Content-Type": "application/json",
  },
});

// Intercepteur pour ajouter le token
api.interceptors.request.use(
  async (config) => {
    try {
      const token = await AsyncStorage.getItem("access_token");
      if (token) {
        config.headers.Authorization = `Bearer ${token}`;
      }
      return config;
    } catch (error) {
      console.error("Erreur lors de la récupération du token:", error);
      return Promise.reject(error);
    }
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Action Types
export const SET_TASKS = "SET_TASKS";
export const SET_USER_LOCATION = "SET_USER_LOCATION";
export const SET_LOADING = "SET_LOADING";
export const SET_ERROR = "SET_ERROR";
export const TASK_TYPES = {
  SET_LOADING: "SET_TASK_LOADING",
  SET_ERROR: "SET_TASK_ERROR",
  CREATE_TASK: "CREATE_TASK",
  UPDATE_TASK: "UPDATE_TASK",
  DELETE_TASK: "DELETE_TASK",
  SET_TASKS: "SET_TASKS",
  SET_PROJECT_TASKS: "SET_PROJECT_TASKS",
};

// Action Creators
export const setTasks = (tasks) => ({
  type: SET_TASKS,
  payload: tasks,
});

export const setUserLocation = (location) => ({
  type: SET_USER_LOCATION,
  payload: location,
});

export const setProjectTasks = (tasks) => ({
  type: TASK_TYPES.SET_PROJECT_TASKS,
  payload: tasks,
});

const setLoading = (loading) => ({
  type: TASK_TYPES.SET_LOADING,
  payload: loading,
});

const setError = (error) => ({
  type: TASK_TYPES.SET_ERROR,
  payload: error,
});

const addTask = (task) => ({
  type: TASK_TYPES.CREATE_TASK,
  payload: task,
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

export const createTask = (taskData) => async (dispatch) => {
  dispatch(setLoading(true));
  try {
    console.log("Création de tâche avec les données:", taskData);
    const formattedData = {
      nom: taskData.titre,
      description: taskData.description,
      startDate: new Date(taskData.dueDate).toISOString().split("T")[0],
      endDate: new Date(taskData.dueDate).toISOString().split("T")[0],
      priority: "normale",
      statut: "a faire",
      projetId: parseInt(taskData.projectId),
      location: {
        latitude: 33.5731104,
        longitude: -7.5898434,
        address: "Casablanca, Morocco",
      },
    };

    console.log("Données formatées pour la création:", formattedData);
    const response = await api.post(API_ENDPOINTS.TASKS.CREATE, formattedData);
    console.log("Réponse de la création:", response.data);

    if (response.data) {
      dispatch(addTask(response.data));

      // Si un membre est sélectionné, assigner la tâche
      if (taskData.assignedToId) {
        console.log(
          "Tentative d'assignation au membre:",
          taskData.assignedToId
        );
        try {
          const assignResult = await dispatch(
            assignTaskToMember(response.data.id, taskData.assignedToId)
          );
          console.log("Résultat de l'assignation:", assignResult);

          if (!assignResult.success) {
            console.error("Erreur d'assignation:", assignResult.error);
            Toast.show({
              type: "error",
              text1: "Attention",
              text2: "La tâche a été créée mais n'a pas pu être assignée",
              position: "top",
              visibilityTime: 3000,
            });
          }
        } catch (assignError) {
          console.error("Erreur lors de l'assignation:", assignError);
        }
      }

      return { success: true, data: response.data };
    }
    return { success: false, error: ERROR_MESSAGES.TASK.CREATE_ERROR };
  } catch (error) {
    console.error("Erreur détaillée:", error.response?.data);
    const errorMessage =
      error.response?.data?.message ||
      error.message ||
      ERROR_MESSAGES.TASK.CREATE_ERROR;
    dispatch(setError(errorMessage));
    return { success: false, error: errorMessage };
  } finally {
    dispatch(setLoading(false));
  }
};

export const loadProjectTasks = (projectId) => async (dispatch) => {
  dispatch(setLoading(true));
  try {
    console.log("Chargement des tâches du projet:", projectId);
    const response = await api.get(`/tasks/project/${projectId}`);
    console.log("Réponse des tâches du projet:", response.data);

    if (response.data) {
      dispatch({
        type: TASK_TYPES.SET_PROJECT_TASKS,
        payload: response.data,
      });
      return { success: true, data: response.data };
    }
    return { success: false, error: ERROR_MESSAGES.TASK.LOAD_ERROR };
  } catch (error) {
    console.error("Erreur détaillée:", error.response?.data);
    const errorMessage =
      error.response?.data?.message ||
      error.message ||
      ERROR_MESSAGES.TASK.LOAD_ERROR;
    dispatch(setError(errorMessage));
    return { success: false, error: errorMessage };
  } finally {
    dispatch(setLoading(false));
  }
};

export const assignTaskToMember = (taskId, memberId) => async (dispatch) => {
  dispatch(setLoading(true));
  try {
    console.log(
      `Tentative d'assignation de la tâche ${taskId} au membre ${memberId}`
    );
    const response = await api.put(`/tasks/${taskId}/assign/${memberId}`);

    if (response.data) {
      dispatch({
        type: TASK_TYPES.UPDATE_TASK,
        payload: response.data,
      });
      return { success: true, data: response.data };
    }
    return { success: false, error: ERROR_MESSAGES.TASK.ASSIGN_ERROR };
  } catch (error) {
    console.error("Erreur lors de l'assignation de la tâche:", error);
    const errorMessage =
      error.response?.data?.message ||
      error.message ||
      ERROR_MESSAGES.TASK.ASSIGN_ERROR;
    dispatch(setError(errorMessage));
    return { success: false, error: errorMessage };
  } finally {
    dispatch(setLoading(false));
  }
};

// Update task action
export const updateTask = (taskId, taskData) => async (dispatch) => {
  dispatch(setLoading(true));
  try {
    const response = await api.put(API_ENDPOINTS.TASKS.UPDATE(taskId), taskData);
    dispatch({
      type: TASK_TYPES.UPDATE_TASK,
      payload: response.data,
    });
    return { success: true, data: response.data };
  } catch (error) {
    console.error("Error updating task:", error.response?.data);
    const errorMessage =
      error.response?.data?.message || ERROR_MESSAGES.TASK.UPDATE_ERROR;
    dispatch(setError(errorMessage));
    return { success: false, error: errorMessage };
  } finally {
    dispatch(setLoading(false));
  }
};

// Delete task action
export const deleteTask = (taskId) => async (dispatch) => {
  dispatch(setLoading(true));
  try {
    await api.delete(API_ENDPOINTS.TASKS.DELETE(taskId));
    dispatch({
      type: TASK_TYPES.DELETE_TASK,
      payload: taskId,
    });
    return { success: true };
  } catch (error) {
    console.error("Error deleting task:", error.response?.data);
    const errorMessage =
      error.response?.data?.message || ERROR_MESSAGES.TASK.DELETE_ERROR;
    dispatch(setError(errorMessage));
    return { success: false, error: errorMessage };
  } finally {
    dispatch(setLoading(false));
  }
};

// Update task status action
export const updateTaskStatus = (taskId, status) => async (dispatch) => {
  dispatch(setLoading(true));
  try {
    const response = await api.put(API_ENDPOINTS.TASKS.STATUS(taskId), {
      statut: status,
    });
    dispatch({
      type: TASK_TYPES.UPDATE_TASK,
      payload: response.data,
    });
    return { success: true, data: response.data };
  } catch (error) {
    console.error("Error updating task status:", error.response?.data);
    const errorMessage =
      error.response?.data?.message || ERROR_MESSAGES.TASK.UPDATE_ERROR;
    dispatch(setError(errorMessage));
    return { success: false, error: errorMessage };
  } finally {
    dispatch(setLoading(false));
  }
};
