import React from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { useModules } from '@core/permissions/useModule';
import { useAuth } from '@core/auth/useAuth';

interface ModuleGuardProps {
  module: string;
  children: React.ReactNode;
}

export function ModuleGuard({ module, children }: ModuleGuardProps) {
  const { hasModule } = useModules();
  const { loading, user } = useAuth();
  const location = useLocation();

  // While auth/modules are still resolving, don't bounce to "/"
  // (that redirect is what made every sidebar click land on Dashboard).
  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-brand-600" />
      </div>
    );
  }

  if (!user) {
    return <Navigate to="/login" replace state={{ from: location.pathname }} />;
  }

  if (!hasModule(module)) {
    return <Navigate to="/" replace />;
  }
  return <>{children}</>;
}
