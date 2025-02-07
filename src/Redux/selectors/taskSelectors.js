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
  taskState => taskState.tasks || []
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
    console.log('État des tâches dans le store:', tasks);
    
    if (!Array.isArray(tasks)) {
      console.log('Les tâches ne sont pas un tableau:', tasks);
      return [];
    }

    const validTasks = tasks.filter(task => {
      if (!task) return false;
      
      const hasLocation = task.location && 
        typeof task.location === 'object' &&
        task.location.latitude && 
        task.location.longitude;
      
      const isValidLocation = hasLocation &&
        !isNaN(parseFloat(task.location.latitude)) &&
        !isNaN(parseFloat(task.location.longitude));
      
      if (!hasLocation) {
        console.log('Tâche sans localisation:', task.id);
      } else if (!isValidLocation) {
        console.log('Tâche avec localisation invalide:', task.id, task.location);
      }
      
      return isValidLocation;
    });

    console.log(`Tâches valides: ${validTasks.length}/${tasks.length}`);
    return validTasks;
  }
);
