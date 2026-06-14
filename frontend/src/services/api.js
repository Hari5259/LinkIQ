import axios from 'axios';

/**
 * Axios instance configured for LinkIQ API.
 *
 * - Base URL defaults to /api for Vite proxy (dev) or environment variable (prod)
 * - Automatically attaches JWT token from localStorage
 * - Intercepts 401 responses to clear auth state
 */
const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL || '/api',
  headers: {
    'Content-Type': 'application/json',
  },
  timeout: 15000,
});

// ── Request Interceptor: Attach JWT ────────────
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('linkiq_token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// ── Response Interceptor: Handle 401 ───────────
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      // Token expired or invalid — clear auth state
      localStorage.removeItem('linkiq_token');
      localStorage.removeItem('linkiq_user');

      // Redirect to login if not already there
      if (window.location.pathname !== '/login') {
        window.location.href = '/login';
      }
    }
    return Promise.reject(error);
  }
);

export default api;
