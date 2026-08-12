import React from 'react';
import { Navigate, Outlet } from 'react-router-dom';
import { useAuth } from '../context/AuthContext.jsx';

export default function Protected() {
  const { user, loading } = useAuth();
  if (loading) return <div className="box muted">Loading…</div>;
  if (!user) return <Navigate to="/agent/login" replace />;
  return <Outlet />;
}
