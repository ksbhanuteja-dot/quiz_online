import axios from 'axios';

const api = axios.create({
  baseURL: 'http://localhost:8000/api/',
});

// Request interceptor: Add Authorization header and fix pathing mismatches
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }

    // Ensure relative paths work correctly with baseURL
    if (config.url && config.url.startsWith('/')) {
      config.url = config.url.substring(1);
    }

    // Explicit mappings for common paths
    if (config.url === 'login') config.url = 'auth/login';
    if (config.url === 'signup') config.url = 'auth/signup';
    if (config.url === 'me') config.url = 'auth/me';

    return config;
  },
  (error) => Promise.reject(error)
);

// Response interceptor: Unwrap {success, data, error} and normalize token names
api.interceptors.response.use(
  (response) => {
    // 1. If the backend returns our standardized wrapped format: { success, data, error }
    if (response.data && response.data.success !== undefined) {
      if (response.data.success) {
        let result = response.data.data;
        
        // Normalize: Map token <-> access_token for total frontend compatibility
        if (result && typeof result === 'object') {
          if (result.access_token && !result.token) result.token = result.access_token;
          if (result.token && !result.access_token) result.access_token = result.token;
        }
        
        return result || response.data;
      } else {
        // Handle explicit backend error (success: false)
        const errorMsg = response.data.error || 'API Error';
        return Promise.reject({ response: { data: { message: errorMsg } } });
      }
    }

    // 2. Handle unwrapped format (e.g. if the backend changed or stripped the wrapper)
    // Example: { token: "...", user: { ... } } or { access_token: "..." }
    let data = response.data;
    if (data && typeof data === 'object') {
      if (data.access_token && !data.token) data.token = data.access_token;
      if (data.token && !data.access_token) data.access_token = data.token;
    }
    return data;
  },
  (error) => {
    // Ensure error.response.data exists and standardize message field
    if (error.response && error.response.data) {
      const data = error.response.data;
      // Handle various error detail formats (FastAPI's 'detail' vs our 'error')
      error.response.data.message = data.error || data.detail || (typeof data === 'string' ? data : 'An unknown error occurred');
      
      // If detail is an array (Pydantic validation error), extract the first one
      if (Array.isArray(data.detail)) {
        error.response.data.message = data.detail[0]?.msg || 'Validation error';
      }
    }
    return Promise.reject(error);
  }
);

export default api;
