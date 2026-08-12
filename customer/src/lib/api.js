import axios from 'axios';

const BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api/v1';

const api = axios.create({
  baseURL: BASE_URL,
});

api.interceptors.request.use((config) => {
  const token = localStorage.getItem('ost_ticket_token') || localStorage.getItem('ost_agent_token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

api.interceptors.response.use(
  (res) => res,
  (err) => {
    const status = err.response?.status;
    if (status === 401) {
      const path = window.location.pathname;
      const isAgentPanel = path.startsWith('/agent');
      const isAdminPanel = path.startsWith('/admin');
      if (isAgentPanel || isAdminPanel) {
        localStorage.removeItem('ost_agent_token');
        localStorage.removeItem('ost_agent_user');
        if (!path.includes('/login')) {
          window.location.href = `${isAdminPanel ? '/admin' : '/agent'}/login`;
        }
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
