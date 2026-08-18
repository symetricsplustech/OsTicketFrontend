import React, { createContext, useContext, useEffect, useState, useCallback } from 'react';
import { api } from '../lib/index.js';

const AuthContext = createContext(null);

const ROLE_ORDER = ['superadmin', 'admin', 'agent', 'customer'];

const ME_ENDPOINTS = {
  superadmin: '/superadmin/auth/me',
  admin: '/auth/agent/me',
  agent: '/auth/agent/me',
  customer: '/auth/me',
};

export const ROLE_HIERARCHY = { customer: 1, agent: 2, admin: 3, superadmin: 4 };

export const roleHome = (role) => {
  switch (role) {
    case 'superadmin': return '/superadmin';
    case 'admin': return '/admin';
    case 'agent': return '/agent';
    default: return '/tickets';
  }
};

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [role, setRole] = useState(null);
  const [loading, setLoading] = useState(true);
  const [unread, setUnread] = useState(0);
  const [isSuperAdmin, setIsSuperAdmin] = useState(false);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState('');

  // Restore session from stored auth (superadmin > admin > agent > customer)
  useEffect(() => {
    const checkStoredAuth = async (roles) => {
      if (!roles.length) {
        setLoading(false);
        return;
      }
      const roleName = roles[0];
      const token = sessionStorage.getItem(`${roleName}_token`);
      if (!token) {
        checkStoredAuth(roles.slice(1));
        return;
      }
      try {
        const { data } = await api.get(ME_ENDPOINTS[roleName], {
          headers: { Authorization: `Bearer ${token}` },
        });
        const u = data.user;
        if (u) {
          sessionStorage.setItem(`${roleName}_user`, JSON.stringify(u));
          setUser(u);
          setRole(roleName);
          setIsSuperAdmin(roleName === 'superadmin' || !!u.isSuperAdmin);
          setLoading(false);
          return;
        }
      } catch (e) {
        // Try next role
      }
      checkStoredAuth(roles.slice(1));
    };

    checkStoredAuth(ROLE_ORDER);
  }, []);

  // Set auth state directly (used by unified login page)
  const setAuth = useCallback((token, u, roleName) => {
    if (!u) return;
    sessionStorage.setItem(`${roleName}_token`, token || '');
    sessionStorage.setItem(`${roleName}_user`, JSON.stringify(u));
    setUser(u);
    setRole(roleName);
    setIsSuperAdmin(roleName === 'superadmin' || !!u.isSuperAdmin);
    setLoading(false);
    setError('');
  }, []);

  // Clear all auth
  const clearAuth = useCallback(() => {
    setUser(null);
    setRole(null);
    setIsSuperAdmin(false);
    setLoading(false);
    setBusy(false);
    ROLE_ORDER.forEach((r) => {
      sessionStorage.removeItem(`${r}_token`);
      sessionStorage.removeItem(`${r}_user`);
    });
  }, []);

  // Login via the unified portal-login endpoint (returns role for all 4 types)
  const login = useCallback(async (email, password) => {
    setBusy(true);
    setError('');
    try {
      const { data } = await api.post('/auth/portal-login', { email, password });
      if (!data.user) throw new Error('Invalid email or password');
      const roleName = data.role || 'customer';
      setAuth(data.token, data.user, roleName);
      setBusy(false);
      return { success: true, role: roleName, user: data.user };
    } catch (e) {
      setError(e.message || 'Invalid email or password');
      setBusy(false);
      return { success: false, role: null, user: null };
    }
  }, [setAuth]);

  // Logout - centralized
  const logout = useCallback(() => {
    clearAuth();
    window.location.href = '/login';
  }, [clearAuth]);

  // Get current user with role detection (refreshes stored session)
  const getCurrentUser = useCallback(async () => {
    for (const roleName of ROLE_ORDER) {
      const token = sessionStorage.getItem(`${roleName}_token`);
      if (!token) continue;
      try {
        const { data } = await api.get(ME_ENDPOINTS[roleName], {
          headers: { Authorization: `Bearer ${token}` },
        });
        if (data.user) {
          setUser(data.user);
          setRole(roleName);
          setIsSuperAdmin(roleName === 'superadmin' || !!data.user.isSuperAdmin);
          return data.user;
        }
      } catch (e) {
        // Continue
      }
    }
    clearAuth();
    return null;
  }, [clearAuth]);

  // Check permissions based on role
  const hasPermission = useCallback((perm) => {
    if (!role) return false;
    if (role === 'superadmin') return true;
    if (role === 'admin') {
      const adminPerms = [
        'ticket_view', 'ticket_create', 'ticket_edit', 'ticket_delete',
        'ticket_assign', 'ticket_close', 'ticket_reopen', 'ticket_transfer',
        'ticket_merge', 'ticket_link', 'ticket_refer', 'user_manage',
        'org_manage', 'dept_manage', 'team_manage', 'role_manage',
        'canned_manage', 'kb_manage', 'sla_manage', 'setting_manage'
      ];
      return adminPerms.includes(perm);
    }
    if (role === 'agent') {
      const agentPerms = [
        'ticket_view', 'ticket_create', 'ticket_reply', 'ticket_note',
        'ticket_assign', 'ticket_close', 'ticket_reopen', 'task_manage'
      ];
      return agentPerms.includes(perm);
    }
    if (role === 'customer') {
      const custPerms = ['ticket_view', 'ticket_reply', 'ticket_history'];
      return custPerms.includes(perm);
    }
    return false;
  }, [role]);

  // Get all permissions for role
  const getPermissions = useCallback(() => {
    if (!role) return [];
    if (role === 'superadmin') return ['*'];
    if (role === 'admin') return [
      'ticket_view', 'ticket_create', 'ticket_edit', 'ticket_delete',
      'ticket_assign', 'ticket_close', 'ticket_reopen', 'ticket_transfer',
      'ticket_merge', 'ticket_link', 'ticket_refer', 'user_manage',
      'org_manage', 'dept_manage', 'team_manage', 'role_manage',
      'canned_manage', 'kb_manage', 'sla_manage', 'setting_manage'
    ];
    if (role === 'agent') return [
      'ticket_view', 'ticket_create', 'ticket_reply', 'ticket_note',
      'ticket_assign', 'ticket_close', 'ticket_reopen', 'task_manage'
    ];
    if (role === 'customer') return ['ticket_view', 'ticket_reply', 'ticket_history'];
    return [];
  }, [role]);

  // Load unread notification count for the current role
  const notifEndpoint = useCallback(() => {
    if (role === 'superadmin') return '/superadmin/notifications';
    if (role === 'admin') return '/admin/notifications';
    if (role === 'agent') return '/agent/notifications';
    return '/users/notifications';
  }, [role]);

  const loadUnread = useCallback(async () => {
    try {
      const { data } = await api.get(notifEndpoint());
      setUnread(data.unread || 0);
    } catch (e) {
      // ignore
    }
  }, [notifEndpoint]);

  // Refresh the current user's profile
  const refresh = useCallback(async () => {
    return getCurrentUser();
  }, [getCurrentUser]);

  return (
    <AuthContext.Provider value={{
      user,
      role,
      isSuperAdmin,
      loading,
      unread,
      setUnread,
      login,
      logout,
      setAuth,
      clearAuth,
      getCurrentUser,
      loadUnread,
      refresh,
      hasPermission,
      getPermissions,
      busy,
      error,
    }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);

// Helper hooks
export const useHasPermission = (perm) => {
  const { hasPermission, role } = useAuth();
  return hasPermission(perm);
};

export const useGetPermissions = () => {
  const { getPermissions } = useAuth();
  return getPermissions();
};

export const useIsSuperAdmin = () => {
  const { isSuperAdmin } = useAuth();
  return isSuperAdmin;
};

export const useUserRole = () => {
  const { role } = useAuth();
  return role;
};
