import React from 'react';
import { Navigate, Outlet } from 'react-router-dom';
import { useAuth, ROLE_HIERARCHY, roleHome } from '../context/AuthContext.jsx';

export default function Protected({ minRole = 'customer', superAdminOnly = false }) {
  const { user, role, loading } = useAuth();
  if (superAdminOnly) minRole = 'superadmin';
  if (loading) return <div className="box muted">Loading…</div>;
  if (!user || !role) return <Navigate to="/login" replace />;
  if ((ROLE_HIERARCHY[role] || 0) < ROLE_HIERARCHY[minRole]) {
    return <Navigate to={roleHome(role)} replace />;
  }
  return <Outlet />;
}