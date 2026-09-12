import React from "react";
import { Navigate } from "react-router-dom";
import { useAuth } from "@core/auth/useAuth";
import { LoadingSpinner } from "@shared/components/ui";

type GuardProps = { children: React.ReactNode };

export function ProtectedRoute({ children }: GuardProps) {
  const { user, loading } = useAuth();
  if (loading) return <LoadingSpinner />;
  return user ? <>{children}</> : <Navigate to="/login" replace />;
}

export function AdminRoute({ children }: GuardProps) {
  const { user, loading, hasPermission } = useAuth();
  if (loading) return <LoadingSpinner />;
  if (!user) return <Navigate to="/login" replace />;
  return hasPermission("admin.manage") || hasPermission("access.manage") ? (
    <>{children}</>
  ) : (
    <Navigate to="/" replace />
  );
}

export function PermissionRoute({
  permission,
  module,
  children,
}: GuardProps & { permission?: string; module?: string }) {
  const { user, loading, hasPermission, hasModule } = useAuth();
  if (loading) return <LoadingSpinner />;
  if (!user) return <Navigate to="/login" replace />;
  if (
    (permission && hasPermission(permission)) ||
    (module && hasModule(module))
  )
    return <>{children}</>;
  return <Navigate to="/" replace />;
}
