import axios from 'axios';
import { useAuthStore } from '../store/useAuthStore';

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || '/api/v1';

const api = axios.create({
  baseURL: API_BASE_URL,
  withCredentials: true, // Support httpOnly cookies
  headers: {
    'Content-Type': 'application/json',
  },
});

// Request Interceptor: Inject JWT Token
api.interceptors.request.use(
  (config) => {
    const token = useAuthStore.getState().accessToken;
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// Response Interceptor: Global Error Handling
api.interceptors.response.use(
  (response) => response.data,
  (error) => {
    const status = error.response ? error.response.status : null;

    if (status === 401) {
      // Token expired or invalid
      // In a real-world scenario, you'd try to refresh here.
      // For now, we clear the store and redirect if the error is not from the login page.
      if (!window.location.pathname.includes('/login')) {
        useAuthStore.getState().logout();
        window.location.href = '/login';
      }
    }

    return Promise.reject(
      error.response?.data || { message: 'An unexpected error occurred' }
    );
  }
);

export default api;
