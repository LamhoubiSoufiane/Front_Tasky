import { mockTasks } from "../../data/mockTasks";
import axios from "axios";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { API_BASE_URL, API_ENDPOINTS, ERROR_MESSAGES } from "../../config";
import Toast from "react-native-toast-message";

// Action Types
export const TASK_TYPES = {
    TASKS_FETCH_START: 'TASKS_FETCH_START',
    TASKS_FETCH_SUCCESS: 'TASKS_FETCH_SUCCESS',
    TASKS_FETCH_FAILURE: 'TASKS_FETCH_FAILURE',
    SET_PROJECT_TASKS: 'SET_PROJECT_TASKS',
    CLEAR_PROJECT_TASKS: 'CLEAR_PROJECT_TASKS',
    CREATE_TASK: 'CREATE_TASK',
    UPDATE_TASK: 'UPDATE_TASK',
    DELETE_TASK: 'DELETE_TASK',
};

// Configuration axios avec intercepteur pour le token
const api = axios.create({
    baseURL: API_BASE_URL,
    timeout: 10000,
    headers: {
        'Content-Type': 'application/json',
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

// Action Creators
export const setTasks = (tasks) => ({
    type: TASK_TYPES.TASKS_FETCH_SUCCESS,
    payload: tasks,
});

export const setLoading = (loading) => ({
    type: TASK_TYPES.TASKS_FETCH_START,
    payload: loading,
});

export const setError = (error) => ({
    type: TASK_TYPES.TASKS_FETCH_FAILURE,
    payload: error,
});

export const clearProjectTasks = () => ({
    type: TASK_TYPES.CLEAR_PROJECT_TASKS
});

// Fetch all tasks assigned to the authenticated user
export const fetchMyTasks = () => async (dispatch, getState) => {
    try {
        dispatch(setLoading(true));
        const token = getState().auth.tokens?.access_token;

        if (!token) {
            throw new Error('No authentication token found');
        }

        const response = await fetch(`${API_BASE_URL}/tasks/my-tasks`, {
            headers: {
                'Authorization': `Bearer ${token}`,
                'Content-Type': 'application/json',
            },
        });

        if (!response.ok) {
            throw new Error('Failed to fetch tasks');
        }

        const tasks = await response.json();
        
        // Récupérer les projets uniques
        const uniqueProjectIds = [...new Set(tasks.map(task => task.projetId))];
        const projectsData = {};

        // Récupérer les détails de chaque projet
        for (const projectId of uniqueProjectIds) {
            if (projectId) {
                const projectResponse = await fetch(`${API_BASE_URL}/projets/${projectId}`, {
                    headers: {
                        'Authorization': `Bearer ${token}`,
                        'Content-Type': 'application/json',
                    },
                });

                if (projectResponse.ok) {
                    const projectData = await projectResponse.json();
                    projectsData[projectId] = projectData;
                }
            }
        }

        // Enrichir les tâches avec les données des projets
        const enrichedTasks = tasks.map(task => ({
            ...task,
            projet: projectsData[task.projetId] || null
        }));

        dispatch(setTasks(enrichedTasks));
        return { success: true, data: enrichedTasks };
    } catch (error) {
        console.error('Error fetching my tasks:', error);
        dispatch(setError(error.message));
        return { success: false, error: error.message };
    } finally {
        dispatch(setLoading(false));
    }
};

// Fetch tasks by status for the authenticated user
export const fetchTasksByStatus = (status) => async (dispatch, getState) => {
    try {
        dispatch(setLoading(true));
        const token = getState().auth.tokens?.access_token;

        if (!token) {
            throw new Error('No authentication token found');
        }
        
        // Map frontend status to API endpoints
        const statusEndpoints = {
            'a_faire': 'a-faire',
            'en_cours': 'en-cours',
            'termine': 'terminees',
            'a-faire': 'a-faire',  // Ajout des mappings directs
            'en-cours': 'en-cours',
            'terminees': 'terminees'
        };

        console.log("Status reçu:", status);
        const apiStatus = statusEndpoints[status];
        console.log("Status mappé:", apiStatus);

        if (!apiStatus && status !== 'all') {
            console.error("Statut invalide reçu:", status);
            console.error("Statuts valides:", Object.keys(statusEndpoints));
            throw new Error(`Statut invalide: ${status}`);
        }

        // Si le statut est 'all', récupérer toutes les tâches
        const endpoint = status === 'all' 
            ? `${API_BASE_URL}/tasks/my-tasks`
            : `${API_BASE_URL}/tasks/my-tasks/${apiStatus}`;

        console.log("Fetching tasks with endpoint:", endpoint);

        const response = await fetch(endpoint, {
            headers: {
                'Authorization': `Bearer ${token}`,
                'Content-Type': 'application/json',
            },
        });

        if (!response.ok) {
            throw new Error('Failed to fetch tasks');
        }

        const data = await response.json();
        console.log("Fetched tasks by status:", data);
        dispatch(setTasks(data));
        return { success: true, data };
    } catch (error) {
        console.error('Error fetching tasks by status:', error);
        dispatch(setError(error.message));
        return { success: false, error: error.message };
    } finally {
        dispatch(setLoading(false));
    }
};

// Fetch tasks for a specific project
export const fetchProjectTasks = (projectId) => async (dispatch, getState) => {
    try {
        dispatch(setLoading(true));
        const token = getState().auth.tokens?.access_token;

        if (!token) {
            throw new Error('No authentication token found');
        }

        if (!projectId) {
            throw new Error('Project ID is required');
        }

        const response = await fetch(`${API_BASE_URL}/tasks/project/${projectId}`, {
            headers: {
                'Authorization': `Bearer ${token}`,
                'Content-Type': 'application/json',
            },
        });

        if (!response.ok) {
            throw new Error('Failed to fetch project tasks');
        }

        const data = await response.json();
        console.log("Fetched project tasks:", data);
        
        dispatch({ 
            type: TASK_TYPES.SET_PROJECT_TASKS,
            payload: data 
        });
        return { success: true, data };
    } catch (error) {
        console.error("Error fetching project tasks:", error);
        dispatch(setError(error.message));
        return { success: false, error: error.message };
    } finally {
        dispatch(setLoading(false));
    }
};

// Fetch my tasks for a specific project
export const fetchMyProjectTasks = (projectId) => async (dispatch, getState) => {
    try {
        dispatch(setLoading(true));
        const token = getState().auth.tokens?.access_token;

        if (!token) {
            throw new Error('No authentication token found');
        }

        if (!projectId) {
            throw new Error('Project ID is required');
        }

        console.log("Fetching tasks for project:", projectId);
        const response = await fetch(`${API_BASE_URL}/tasks/my-tasks/project/${projectId}`, {
            headers: {
                'Authorization': `Bearer ${token}`,
                'Content-Type': 'application/json',
            },
        });

        if (!response.ok) {
            throw new Error('Failed to fetch project tasks');
        }

        const data = await response.json();
        console.log("Fetched project tasks:", data);
        dispatch(setTasks(data));
        return { success: true, data };
    } catch (error) {
        console.error('Error fetching my project tasks:', error);
        dispatch(setError(error.message));
        return { success: false, error: error.message };
    } finally {
        dispatch(setLoading(false));
    }
};

// Load initial tasks (using mock data)
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

// Create a new task
export const createTask = (taskData) => async (dispatch) => {
    dispatch(setLoading(true));
    try {
        console.log("Création de tâche avec les données:", taskData);
        const formattedData = {
            nom: taskData.titre,
            description: taskData.description,
            startDate: new Date(taskData.startDate).toISOString().split("T")[0],
            endDate: new Date(taskData.endDate).toISOString().split("T")[0],
            priority: "normale",
            statut: "a faire",
            projetId: parseInt(taskData.projectId),
            location: taskData.location,
        };

        console.log("Données formatées pour la création:", formattedData);
        const response = await api.post(API_ENDPOINTS.TASKS.CREATE, formattedData);
        console.log("Réponse de la création:", response.data);

        if (response.data) {
            dispatch({ type: TASK_TYPES.CREATE_TASK, payload: response.data });

            // Si un membre est sélectionné, assigner la tâche
            if (taskData.assignedToId) {
                try {
                    const assignResult = await dispatch(
                        assignTaskToMember(response.data.id, taskData.assignedToId)
                    );
                    if (!assignResult.success) {
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

// Assign task to member
export const assignTaskToMember = (taskId, memberId) => async (dispatch) => {
    dispatch(setLoading(true));
    try {
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

// Update task
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

// Delete task
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

// Update task status
export const updateTaskStatus = (taskId, status) => async (dispatch) => {
  dispatch(setLoading(true));
  try {
    console.log('Mise à jour du statut:', { taskId, status });
    const response = await api.put(API_ENDPOINTS.TASKS.STATUS(taskId), {
      status: status // Assurez-vous que le backend attend "status" comme clé
    });

    console.log('Réponse de la mise à jour du statut:', response.data);

    if (response.data) {
      // Mettre à jour le state avec la nouvelle tâche
      dispatch({
        type: TASK_TYPES.UPDATE_TASK,
        payload: response.data
      });

      // Recharger les tâches du projet pour s'assurer de la synchronisation
      if (response.data.projectId || response.data.projetId) {
        await dispatch(loadProjectTasks(response.data.projectId || response.data.projetId));
      }

      return { success: true, data: response.data };
    }

    return { success: false, error: 'Pas de données reçues du serveur' };
  } catch (error) {
    console.error("Erreur lors de la mise à jour du statut:", error.response?.data || error);
    const errorMessage = error.response?.data?.message || ERROR_MESSAGES.TASK.UPDATE_ERROR;
    dispatch(setError(errorMessage));
    return { success: false, error: errorMessage };
  } finally {
    dispatch(setLoading(false));
  }
};

export const fetchUserTasks = ({ token, userId }) => async (dispatch) => {
  try {
    console.log('Début du chargement des tâches pour l\'utilisateur:', userId);
    dispatch({ type: TASK_TYPES.TASKS_FETCH_START });
    
    const response = await api.get(`/tasks/tasksByUserId/${userId}`, {
      headers: {
        Authorization: `Bearer ${token}`,
      }
    });

    console.log('Tâches reçues:', response.data);

    if (Array.isArray(response.data)) {
      dispatch({
        type: TASK_TYPES.TASKS_FETCH_SUCCESS,
        payload: response.data
      });
      return { success: true };
    } else {
      console.error('Format de réponse invalide:', response.data);
      dispatch({
        type: TASK_TYPES.TASKS_FETCH_FAILURE,
        payload: 'Format de réponse invalide'
      });
      return { success: false, error: 'Format de réponse invalide' };
    }

  } catch (error) {
    console.error('Erreur lors du chargement des tâches:', error.response || error);
    const errorMessage = error.response?.status === 401 
      ? 'Session expirée, veuillez vous reconnecter'
      : error.response?.data?.message || error.message;
    dispatch({
      type: TASK_TYPES.TASKS_FETCH_FAILURE,
      payload: errorMessage
    });
    return { success: false, error: errorMessage };
  }
};
export const fetchMyTasks = () => async (dispatch, getState) => {
  try {
      dispatch(setLoading(true));
      const token = getState().auth.tokens?.access_token;

      if (!token) {
          throw new Error('No authentication token found');
      }

      const response = await fetch(`${API_BASE_URL}/tasks/my-tasks`, {
          headers: {
              'Authorization': `Bearer ${token}`,
              'Content-Type': 'application/json',
          },
      });

      if (!response.ok) {
          throw new Error('Failed to fetch tasks');
      }

      const tasks = await response.json();
      
      // Récupérer les projets uniques
      const uniqueProjectIds = [...new Set(tasks.map(task => task.projetId))];
      const projectsData = {};

      // Récupérer les détails de chaque projet
      for (const projectId of uniqueProjectIds) {
          if (projectId) {
              const projectResponse = await fetch(`${API_BASE_URL}/projets/${projectId}`, {
                  headers: {
                      'Authorization': `Bearer ${token}`,
                      'Content-Type': 'application/json',
                  },
              });

              if (projectResponse.ok) {
                  const projectData = await projectResponse.json();
                  projectsData[projectId] = projectData;
              }
          }
      }

      // Enrichir les tâches avec les données des projets
      const enrichedTasks = tasks.map(task => ({
          ...task,
          projet: projectsData[task.projetId] || null
      }));

      dispatch(setTasks(enrichedTasks));
      return { success: true, data: enrichedTasks };
  } catch (error) {
      console.error('Error fetching my tasks:', error);
      dispatch(setError(error.message));
      return { success: false, error: error.message };
  } finally {
      dispatch(setLoading(false));
  }
};

// Action pour invalider le cache
export const invalidateTasksCache = () => ({ type: 'TASKS_CACHE_INVALIDATE' });
