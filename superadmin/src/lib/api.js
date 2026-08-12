import axios from 'axios';

const BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api/v1';

const api = axios.create({
  baseURL: BASE_URL,
});

api.interceptors.request.use((config) => {
  const token = localStorage.getItem('ost_superadmin_token');
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
      localStorage.removeItem('ost_superadmin_token');
      localStorage.removeItem('ost_superadmin_user');
      if (!path.includes('/login')) {
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
