import axios from 'axios';

const BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api/v1';

const ROLE_KEYS = {
  superadmin: ['superadmin_token', 'ost_superadmin_token'],
  admin: ['admin_token', 'ost_agent_token'],
  agent: ['agent_token', 'ost_agent_token'],
  customer: ['customer_token', 'ost_ticket_token', 'ost_customer_token'],
};

const roleFromPath = (path) => {
  if (path.startsWith('/superadmin')) return 'superadmin';
  if (path.startsWith('/admin')) return 'admin';
  if (path.startsWith('/agent')) return 'agent';
  return 'customer';
};

const getTokenFor = (role) => {
  for (const key of ROLE_KEYS[role]) {
    const token = sessionStorage.getItem(key) || localStorage.getItem(key);
    if (token) return token;
  }
  return null;
};

const api = axios.create({
  baseURL: BASE_URL,
});

api.interceptors.request.use((config) => {
  const token = getTokenFor(roleFromPath(window.location.pathname));
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

const clearAuthFor = (role) => {
  Object.keys(ROLE_KEYS).forEach((r) => {
    ROLE_KEYS[r].forEach((key) => {
      const base = key.replace('_token', '');
      ['_token', '_user'].forEach((suffix) => {
        sessionStorage.removeItem(base + suffix);
        localStorage.removeItem(base + suffix);
      });
    });
  });
};

api.interceptors.response.use(
  (res) => res,
  (err) => {
    const status = err.response?.status;
    if (status === 401) {
      const path = window.location.pathname;
      if (!path.includes('/login')) {
        clearAuthFor(roleFromPath(path));
        window.location.href = '/login';
      }
    }
    const message = err.response?.data?.message || err.message || 'Something went wrong';
    const error = new Error(message);
    error.details = err.response?.data?.details;
    error.status = status;
    return Promise.reject(error);
  }
);

export default api;