import React, { createContext, useContext, useEffect, useState } from 'react';
import { api, getSuperAdminAuth, setSuperAdminAuth, clearSuperAdminAuth } from '../lib/index.js';

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const access = params.get('access');
    if (access) {
      window.history.replaceState({}, '', window.location.pathname);
      api.get('/superadmin/auth/me', { headers: { Authorization: `Bearer ${access}` } })
        .then(({ data }) => {
          setSuperAdminAuth(access, data.user);
          setUser(data.user);
        })
        .catch(() => clearSuperAdminAuth())
        .finally(() => setLoading(false));
      return;
    }
    const { user: stored } = getSuperAdminAuth();
    if (stored) setUser(stored);
    setLoading(false);
  }, []);

  const login = async (email, password) => {
    const { data } = await api.post('/superadmin/auth/login', { email, password });
    setSuperAdminAuth(data.token, data.user);
    setUser(data.user);
    return data.user;
  };

  const logout = () => {
    clearSuperAdminAuth();
    setUser(null);
  };

  return (
    <AuthContext.Provider value={{ user, loading, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);
