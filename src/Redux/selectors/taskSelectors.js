import { createSelector } from 'reselect';

// Sélecteurs de base
const selectTaskState = state => {
  console.log('Full state:', state);
  return state.task || {};
};

const selectAuthState = state => {
  console.log('Auth state:', state.auth); // Debug
  return state.auth || {};
};

// Sélecteurs mémorisés pour les tâches
export const selectTasks = createSelector(
  [selectTaskState],
  taskState => {
    console.log('Task State in selector:', taskState);
    return taskState.tasks || [];
  }
);

export const selectTasksLoading = createSelector(
  [selectTaskState],
  state => state.loading || false
);

export const selectTaskError = createSelector(
  [selectTaskState],
  state => state.error || null
);

// Sélecteurs mémorisés pour l'authentification
export const selectIsAuthenticated = createSelector(
  [selectAuthState],
  auth => auth.isAuthenticated || false
);

export const selectUser = createSelector(
  [selectAuthState],
  auth => {
    console.log('User from auth:', auth.user); // Debug
    return auth.user || null;
  }
);

export const selectAuthToken = createSelector(
  [selectAuthState],
  auth => {
    const token = auth.tokens?.access_token || null;
    console.log('Token from auth:', token ? 'Token exists' : 'No token'); // Debug
    return token;
  }
);

// Sélecteur mémorisé pour les tâches valides avec coordonnées
export const selectValidTasks = createSelector(
  [selectTasks],
  tasks => {
    console.log('Tasks in validTasks selector:', tasks);
    const validTasks = tasks.filter(task => 
      task && 
      task.location && 
      typeof parseFloat(task.location.latitude) === 'number' && 
      !isNaN(parseFloat(task.location.latitude)) &&
      typeof parseFloat(task.location.longitude) === 'number' && 
      !isNaN(parseFloat(task.location.longitude))
    );
    console.log('Valid tasks after filter:', validTasks);
    return validTasks;
  }
);
