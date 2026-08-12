import React, { createContext, useContext, useEffect, useState, useCallback } from 'react';
import { api, getAgentAuth, setAgentAuth, clearAgentAuth } from '../lib/index.js';

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [unread, setUnread] = useState(0);

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const access = params.get('access');
    if (access) {
      window.history.replaceState({}, '', window.location.pathname);
      api
        .get('/auth/agent/me', { headers: { Authorization: `Bearer ${access}` } })
        .then(({ data }) => {
          const u = data.user;
          const isAdmin = u.isAdmin || (u.role && u.role.isAdmin);
          if (!isAdmin) {
            clearAgentAuth();
            return;
          }
          setAgentAuth(access, u);
          setUser(u);
        })
        .catch(() => clearAgentAuth())
        .finally(() => setLoading(false));
      return;
    }
    const { user: stored } = getAgentAuth();
    if (stored) setUser(stored);
    setLoading(false);
  }, []);

  const login = async (email, password) => {
    const { data } = await api.post('/auth/admin/login', { email, password });
    setAgentAuth(data.token, data.user);
    setUser(data.user);
    return data.user;
  };

  const logout = () => {
    clearAgentAuth();
    setUser(null);
  };

  const loadUnread = useCallback(() => {
    api.get('/admin/notifications')
      .then(({ data }) => setUnread(data.unread))
      .catch(() => {});
  }, []);

  useEffect(() => {
    if (user) {
      loadUnread();
      const timer = setInterval(loadUnread, 20000);
      return () => clearInterval(timer);
    }
  }, [user, loadUnread]);

  return (
    <AuthContext.Provider value={{ user, loading, login, logout, unread, loadUnread }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);
