import React, { createContext, useContext, useEffect, useState } from 'react';
import { api, getCustomerAuth, setCustomerAuth, clearCustomerAuth } from '../lib/index.js';

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const access = params.get('access');
    if (access) {
      window.history.replaceState({}, '', window.location.pathname);
      api.get('/auth/me', { headers: { Authorization: `Bearer ${access}` } })
        .then(({ data }) => {
          setCustomerAuth(access, data.user);
          setUser(data.user);
        })
        .catch(() => clearCustomerAuth())
        .finally(() => setLoading(false));
      return;
    }
    const { user: stored } = getCustomerAuth();
    if (stored) setUser(stored);
    setLoading(false);
  }, []);

  const setAuth = (token, user) => {
    setCustomerAuth(token, user);
    setUser(user);
  };

  const login = async (email, password) => {
    const { data } = await api.post('/auth/login', { email, password });
    setAuth(data.token, data.user);
    return data.user;
  };

  const register = async (payload) => {
    const { data } = await api.post('/auth/register', payload);
    setCustomerAuth(data.token, data.user);
    setUser(data.user);
    return data.user;
  };

  const ticketAccess = async (email, number) => {
    const { data } = await api.post('/auth/ticket-access', { email, number });
    setCustomerAuth(data.token, data.user);
    setUser(data.user);
    return data.user;
  };

  const refresh = async () => {
    try {
      const { data } = await api.get('/auth/me');
      setUser(data.user);
      localStorage.setItem('ost_customer_user', JSON.stringify(data.user));
    } catch {
      logout();
    }
  };

  const logout = () => {
    clearCustomerAuth();
    setUser(null);
  };

  return (
    <AuthContext.Provider value={{ user, loading, setAuth, login, register, ticketAccess, refresh, logout }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);
