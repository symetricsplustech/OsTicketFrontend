import React, { createContext, useContext, useEffect, useState, useCallback } from 'react';
import { api } from '../lib/index.js';

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [role, setRole] = useState(null); // 'admin' | 'agent' | 'customer' | 'superadmin'
  const [loading, setLoading] = useState(true);
  const [unread, setUnread] = useState(0);
  const [isSuperAdmin, setIsSuperAdmin] = useState(false);

  // Detect role from stored auth or initial login
  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const access = params.get('access');
    
    if (access) {
      window.history.replaceState({}, '', window.location.pathname);
      // Try each auth endpoint to detect user type
      const authEndpoints = [
        '/auth/superadmin/login',      // super admin login
        '/auth/admin/login',           // admin login  
        '/auth/agent/login',           // agent login
        '/auth/login',                 // customer login
        '/auth/portal-login'           // multi-portal login
      ];
      
      const tryAuth = async (endpoint) => {
        try {
          const { data } = await api.post(endpoint, { 
            email: sessionStorage.getItem('attempted_email') || '',
            password: '' 
          });
          handleAuthResponse(data);
        } catch (e) {
          // Try next endpoint
          if (endpoint === '/auth/portal-login') {
            clearAuth();
          }
        }
      };
      
      // Try endpoints in order (super admin first)
      authEndpoints.reduce(async (promise, endpoint) => {
        await promise;
        return tryAuth(endpoint);
      }, Promise.resolve());
      
      return;
    }

    // Check stored auth for each role type
    const storedRoles = ['superadmin', 'admin', 'agent', 'customer'];
    
    const checkStoredAuth = async (role) => {
      try {
        let endpoint;
        
        switch (role) {
          case 'superadmin':
            endpoint = '/auth/superadmin/me';
            break;
          case 'admin':
            endpoint = '/auth/admin/me';
            break;
          case 'agent':
            endpoint = '/auth/agent/me';
            break;
          case 'customer':
            endpoint = '/auth/me';
            break;
        }
        
        if (!endpoint) return;
        
        const token = sessionStorage.getItem(`${role}_token`);
        const { data } = await api.get(endpoint, {
          headers: { Authorization: `Bearer ${token}` }
        });
        
        const u = data.user;
        const isSuper = u && u.isSuperAdmin;
        
        setUser(u);
        setRole(role);
        setIsSuperAdmin(isSuper);
        setLoading(false);
        
        if (isSuper) {
          sessionStorage.setItem('superadmin_token', data.token || '');
          sessionStorage.setItem('superadmin_user', JSON.stringify(u));
        } else if (role === 'admin') {
          sessionStorage.setItem('admin_token', data.token || '');
          sessionStorage.setItem('admin_user', JSON.stringify(u));
        } else if (role === 'agent') {
          sessionStorage.setItem('agent_token', data.token || '');
          sessionStorage.setItem('agent_user', JSON.stringify(u));
        } else if (role === 'customer') {
          sessionStorage.setItem('customer_token', data.token || '');
          sessionStorage.setItem('customer_user', JSON.stringify(u));
        }
        
      } catch (e) {
        const idx = storedRoles.indexOf(role);
        if (idx < storedRoles.length - 1) {
          checkStoredAuth(storedRoles[idx + 1]);
        } else {
          setLoading(false);
        }
      }
    };
    
    // Check in order: superadmin > admin > agent > customer
    checkStoredAuth('superadmin');
  }, []);

  // Handle auth response from any endpoint
  const handleAuthResponse = useCallback((data) => {
    const u = data.user;
    if (!u) return;
    
    const isSuper = u.isSuperAdmin || u.role === 'superadmin' || u.isAdmin === true;
    
    setUser(u);
    setRole('superadmin');
    setIsSuperAdmin(isSuper);
    setLoading(false);
    
    // Store super admin auth
    sessionStorage.setItem('superadmin_token', data.token || '');
    sessionStorage.setItem('superadmin_user', JSON.stringify(u));
  }, []);

  // Clear all auth
  const clearAuth = useCallback(() => {
    setUser(null);
    setRole(null);
    setIsSuperAdmin(false);
    setLoading(false);
    sessionStorage.removeItem('superadmin_token');
    sessionStorage.removeItem('superadmin_user');
    sessionStorage.removeItem('admin_token');
    sessionStorage.removeItem('admin_user');
    sessionStorage.removeItem('agent_token');
    sessionStorage.removeItem('agent_user');
    sessionStorage.removeItem('customer_token');
    sessionStorage.removeItem('customer_user');
  }, []);

  // Login function - centralized
  const login = useCallback(async (email, password) => {
    setBusy(true);
    setError('');
    
    // Try super admin first
    try {
      const { data } = await api.post('/auth/superadmin/login', { email, password });
      if (data.isSuperAdmin || data.user?.isSuperAdmin) {
        await handleAuthResponse(data);
        setBusy(false);
        return { success: true, role: 'superadmin', user: data.user };
      }
    } catch (e) {
      // Continue to next role
    }
    
    // Try admin
    try {
      const { data } = await api.post('/auth/admin/login', { email, password });
      const isAdmin = data.user && (data.user.isAdmin || data.user.role?.isAdmin);
      if (isAdmin || data.isAdmin) {
        await handleAuthResponse(data);
        setBusy(false);
        const role = isAdmin && !data.user?.isSuperAdmin ? 'admin' : 'superadmin';
        return { success: true, role, user: data.user };
      }
    } catch (e) {
      // Continue to next role
    }
    
    // Try agent
    try {
      const { data } = await api.post('/auth/agent/login', { email, password });
      const isAgent = data.user && data.user.isActive;
      if (isAgent) {
        setUser(data.user);
        setRole('agent');
        setIsSuperAdmin(false);
        setLoading(false);
        setBusy(false);
        return { success: true, role: 'agent', user: data.user };
      }
    } catch (e) {
      // Continue to next role
    }
    
    // Try customer
    try {
      const { data } = await api.post('/auth/login', { email, password });
      if (data.user) {
        setUser(data.user);
        setRole('customer');
        setIsSuperAdmin(false);
        setLoading(false);
        setBusy(false);
        return { success: true, role: 'customer', user: data.user };
      }
    } catch (e) {
      // Continue to next role
    }
    
    setError('Invalid email or password');
    setBusy(false);
    return { success: false, role: null, user: null };
  }, []);

  // Logout - centralized
  const logout = useCallback(() => {
    clearAuth();
    window.location.href = '/auth/logout';
  }, []);

  // Get current user with role detection
  const getCurrentUser = useCallback(async () => {
    // Try super admin first
    try {
      const token = sessionStorage.getItem('superadmin_token');
      if (token) {
        const { data } = await api.get('/auth/superadmin/me', {
          headers: { Authorization: `Bearer ${token}` }
        });
        if (data.user) {
          setUser(data.user);
          setRole('superadmin');
          setIsSuperAdmin(true);
          return data.user;
        }
      }
    } catch (e) {
      // Continue
    }
    
    // Try admin
    try {
      const token = sessionStorage.getItem('admin_token');
      if (token) {
        const { data } = await api.get('/auth/admin/me', {
          headers: { Authorization: `Bearer ${token}` }
        });
        if (data.user) {
          setUser(data.user);
          setRole('admin');
          setIsSuperAdmin(data.user.isAdmin || data.user.role?.isAdmin || false);
          return data.user;
        }
      }
    } catch (e) {
      // Continue
    }
    
    // Try agent
    try {
      const token = sessionStorage.getItem('agent_token');
      if (token) {
        const { data } = await api.get('/auth/agent/me', {
          headers: { Authorization: `Bearer ${token}` }
        });
        if (data.user) {
          setUser(data.user);
          setRole('agent');
          setIsSuperAdmin(false);
          return data.user;
        }
      }
    } catch (e) {
      // Continue
    }
    
    // Try customer
    try {
      const token = sessionStorage.getItem('customer_token');
      if (token) {
        const { data } = await api.get('/auth/me', {
          headers: { Authorization: `Bearer ${token}` }
        });
        if (data.user) {
          setUser(data.user);
          setRole('customer');
          setIsSuperAdmin(false);
          return data.user;
        }
      }
    } catch (e) {
      // Continue
    }
    
    setUser(null);
    setRole(null);
    setIsSuperAdmin(false);
    setLoading(false);
    return null;
  }, []);

  // Check permissions based on role
  const hasPermission = useCallback((perm) => {
    if (!role) return false;
    if (role === 'superadmin') return true; // Super admin has all permissions
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
    if (role === 'superadmin') return ['*']; // All permissions
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

  // Busy state
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState('');

  return (
    <AuthContext.Provider value={{ 
      user, 
      role, 
      isSuperAdmin, 
      loading, 
      unread, 
      login, 
      logout, 
      getCurrentUser, 
      hasPermission, 
      getPermissions, 
      busy, 
      error 
    }}>
      {children}
    </AuthProvider>
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