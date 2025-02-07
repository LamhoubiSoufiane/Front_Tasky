import { API_BASE_URL } from "../../config";

export const HELP_REQUEST_TYPES = {
    FETCH_PENDING_START: 'HELP_REQUEST/FETCH_PENDING_START',
    FETCH_PENDING_SUCCESS: 'HELP_REQUEST/FETCH_PENDING_SUCCESS',
    FETCH_PENDING_FAILURE: 'HELP_REQUEST/FETCH_PENDING_FAILURE',
    CREATE_REQUEST: 'HELP_REQUEST/CREATE_REQUEST',
    UPDATE_REQUEST: 'HELP_REQUEST/UPDATE_REQUEST',
};

export const createHelpRequest = (taskId, description = "J'ai besoin d'aide pour cette tâche") => async (dispatch, getState) => {
    try {
        const token = getState().auth.tokens?.access_token;
        if (!token) {
            throw new Error('No authentication token found');
        }

        const response = await fetch(`${API_BASE_URL}/aides`, {
            method: 'POST',
            headers: {
                'Authorization': `Bearer ${token}`,
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                description,
                taskId
            }),
        });

        const data = await response.json();
        
        if (!response.ok) {
            throw new Error(data.message || 'Failed to create help request');
        }

        dispatch({ type: HELP_REQUEST_TYPES.CREATE_REQUEST, payload: data });
        return { success: true, data };
    } catch (error) {
        console.error('Error creating help request:', error);
        return { success: false, error: error.message };
    }
};

export const fetchAllPendingHelpRequests = () => async (dispatch, getState) => {
    try {
        dispatch({ type: HELP_REQUEST_TYPES.FETCH_PENDING_START });
        const token = getState().auth.tokens?.access_token;

        if (!token) {
            throw new Error('No authentication token found');
        }

        // 1. Récupérer tous les projets
        console.log('Fetching all projects...');
        const projectsResponse = await fetch(`${API_BASE_URL}/projets`, {
            headers: {
                'Authorization': `Bearer ${token}`,
                'Content-Type': 'application/json',
            },
        });

        if (!projectsResponse.ok) {
            throw new Error('Failed to fetch projects');
        }

        const projects = await projectsResponse.json();
        console.log('Received projects:', projects);

        // 2. Récupérer les demandes d'aide pour chaque projet
        let allHelpRequests = [];
        for (const project of projects) {
            try {
                console.log(`Fetching help requests for project ${project.id} from ${API_BASE_URL}/aides/project/${project.id}/en-attente`);
                const helpResponse = await fetch(`${API_BASE_URL}/aides/project/${project.id}/en-attente`, {
                    headers: {
                        'Authorization': `Bearer ${token}`,
                        'Content-Type': 'application/json',
                    },
                });

                if (helpResponse.ok) {
                    const helpRequests = await helpResponse.json();
                    console.log(`Received help requests for project ${project.id}:`, helpRequests);
                    if (Array.isArray(helpRequests)) {
                        allHelpRequests = [...allHelpRequests, ...helpRequests];
                    } else {
                        console.error(`Invalid help requests format for project ${project.id}:`, helpRequests);
                    }
                } else {
                    const errorText = await helpResponse.text();
                    console.error(`Error response for project ${project.id}:`, helpResponse.status, errorText);
                }
            } catch (error) {
                console.error(`Error fetching help requests for project ${project.id}:`, error);
            }
        }

        console.log('Total help requests collected:', allHelpRequests.length);
        console.log('Help requests details:', allHelpRequests);
        
        dispatch({ type: HELP_REQUEST_TYPES.FETCH_PENDING_SUCCESS, payload: allHelpRequests });
        return { success: true, data: allHelpRequests };
    } catch (error) {
        console.error('Error fetching all pending help requests:', error);
        dispatch({ type: HELP_REQUEST_TYPES.FETCH_PENDING_FAILURE, payload: error.message });
        return { success: false, error: error.message };
    }
};

export const acceptHelpRequest = (requestId) => async (dispatch, getState) => {
    try {
        const token = getState().auth.tokens?.access_token;
        if (!token) {
            throw new Error('No authentication token found');
        }

        const response = await fetch(`${API_BASE_URL}/aides/${requestId}/accepter`, {
            method: 'PUT',
            headers: {
                'Authorization': `Bearer ${token}`,
                'Content-Type': 'application/json',
            },
        });

        if (!response.ok) {
            const error = await response.text();
            throw new Error(error || 'Failed to accept help request');
        }

        const data = await response.json();
        dispatch({ type: HELP_REQUEST_TYPES.UPDATE_REQUEST, payload: data });
        return { success: true, data };
    } catch (error) {
        console.error('Error accepting help request:', error);
        return { success: false, error: error.message };
    }
};

export const completeHelpRequest = (requestId) => async (dispatch, getState) => {
    try {
        const token = getState().auth.tokens?.access_token;
        if (!token) {
            throw new Error('No authentication token found');
        }

        const response = await fetch(`${API_BASE_URL}/aides/${requestId}/terminer`, {
            method: 'PUT',
            headers: {
                'Authorization': `Bearer ${token}`,
                'Content-Type': 'application/json',
            },
        });

        if (!response.ok) {
            const error = await response.text();
            throw new Error(error || 'Failed to complete help request');
        }

        const data = await response.json();
        dispatch({ type: HELP_REQUEST_TYPES.UPDATE_REQUEST, payload: data });
        return { success: true, data };
    } catch (error) {
        console.error('Error completing help request:', error);
        return { success: false, error: error.message };
    }
}; 