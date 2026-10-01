import axios from 'axios';

const rawBaseUrl = import.meta.env.VITE_API_BASE_URL;
const baseURL = rawBaseUrl
  ? (rawBaseUrl.endsWith('/api/v1') ? rawBaseUrl : `${rawBaseUrl.replace(/\/+$/, '')}/api/v1`)
  : '/api/v1';

const api = axios.create({
  baseURL,
  timeout: 90000, // 90s timeout (generous window for Render free tier cold start)
  headers: {
    'Content-Type': 'application/json',
  },
  withCredentials: true, // Send HttpOnly cookies
});

// Request interceptor to attach bearer token fallback if present in localStorage
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('accessToken');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// Response interceptor for error handling
api.interceptors.response.use(
  (response) => response.data,
  (error) => {
    if (error.response && error.response.status === 401) {
      localStorage.removeItem('accessToken');
      localStorage.removeItem('user');
      if (window.location.pathname !== '/login') {
        window.location.href = '/login';
      }
    }

    // Friendly explanation for Render free tier cold-start timeouts
    if (error.code === 'ECONNABORTED' || error.message?.includes('timeout')) {
      return Promise.reject({
        success: false,
        message: 'The cloud server took longer than expected to wake up from idle sleep. Please wait a few seconds and try again.'
      });
    }

    if (!error.response && error.message === 'Network Error') {
      return Promise.reject({
        success: false,
        message: 'Cannot reach the cloud server. It is likely waking up from idle sleep. Please wait a moment and try again.'
      });
    }

    return Promise.reject(error.response?.data || error.message || 'An unexpected error occurred');
  }
);

// Helper function to pre-warm the backend immediately on app load
export const prewarmBackend = () => {
  try {
    const healthUrl = baseURL.endsWith('/api/v1') ? `${baseURL}/health` : `${baseURL}/api/v1/health`;
    fetch(healthUrl, { method: 'GET', keepalive: true }).catch(() => {});
  } catch (e) {}
};

// Immediately fire background pre-warm ping on script evaluation
prewarmBackend();

export default api;
