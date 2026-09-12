import React from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { useModules } from '@core/permissions/useModule';
import { useAuth } from '@core/auth/useAuth';
import { getItsmRouteAccess } from '@shared/itsmAccess';

interface ModuleGuardProps {
  module: string;
  permissions?: readonly string[];
  children: React.ReactNode;
}

export function ModuleGuard({ module, permissions = [], children }: ModuleGuardProps) {
  const { hasModule } = useModules();
  const { loading, user, hasAnyPermission } = useAuth();
  const location = useLocation();
  const routePermissions = permissions.length > 0
    ? permissions
    : getItsmRouteAccess(location.pathname)?.permissions || [];

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
  if (routePermissions.length > 0 && !hasAnyPermission([...routePermissions])) {
    return (
      <div className="mx-auto mt-16 max-w-lg rounded-xl border border-amber-200 bg-amber-50 p-6 text-center">
        <h1 className="text-lg font-semibold text-amber-900">Access denied</h1>
        <p className="mt-2 text-sm text-amber-800">You do not have the granular permission required to open this page.</p>
      </div>
    );
  }
  return <>{children}</>;
}
