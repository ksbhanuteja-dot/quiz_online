import axios from 'axios';

const api = axios.create({
  baseURL: 'http://localhost:8000/api',
});

// Request interceptor: Add Authorization header and fix pathing mismatches
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }

    // Mapping frontend-specific paths to standardized backend paths
    if (config.url === '/login') config.url = '/auth/login';
    if (config.url === '/signup') config.url = '/auth/signup';

    return config;
  },
  (error) => Promise.reject(error)
);

// Response interceptor: Unwrap {success, data, error} and map access_token -> token
api.interceptors.response.use(
  (response) => {
    // If the backend returns our standardized format
    if (response.data && Object.prototype.hasOwnProperty.call(response.data, 'success')) {
      if (response.data.success) {
        let result = response.data.data;
        
        // Map access_token to token for frontend compatibility if it exists
        if (result && result.access_token) {
          result.token = result.access_token;
        }
        
        return { ...response, data: result };
      } else {
        // Handle explicit backend error (success: false)
        const errorMsg = response.data.error || 'API Error';
        return Promise.reject({ response: { data: { message: errorMsg } } });
      }
    }
    return response;
  },
  (error) => {
    // Standardizing backend error format for frontend catch blocks
    if (error.response && error.response.data && error.response.data.error) {
      error.response.data.message = error.response.data.error;
    }
    return Promise.reject(error);
  }
);

export default api;
