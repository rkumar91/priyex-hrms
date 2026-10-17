import axios from 'axios';

const rawBaseUrl = import.meta.env.VITE_API_BASE_URL;
const isLocal = typeof window !== 'undefined' && (window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1');
// Direct Render URL in production avoids Vercel rewrite 10s gateway timeout during cold starts
const resolvedBase = rawBaseUrl || (!isLocal ? 'https://priyex-hrms-api.onrender.com' : '/api/v1');
const baseURL = resolvedBase.endsWith('/api/v1') ? resolvedBase : `${resolvedBase.replace(/\/+$/, '')}/api/v1`;

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

// Check if backend is awake and responding
export const checkBackendHealth = async (timeoutMs: number = 5000): Promise<boolean> => {
  try {
    const healthUrl = baseURL.endsWith('/api/v1') ? `${baseURL}/health` : `${baseURL}/api/v1/health`;
    const controller = new AbortController();
    const id = setTimeout(() => controller.abort(), timeoutMs);
    const res = await fetch(healthUrl, { signal: controller.signal, method: 'GET' });
    clearTimeout(id);
    return res.ok;
  } catch {
    return false;
  }
};

// Immediately fire background pre-warm ping on script evaluation
prewarmBackend();

export default api;
