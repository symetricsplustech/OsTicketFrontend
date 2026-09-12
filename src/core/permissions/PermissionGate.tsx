import React from 'react';
import { useAuth } from '@core/auth/useAuth';

interface PermissionGateProps {
  permission?: string;
  anyOf?: readonly string[];
  allOf?: readonly string[];
  fallback?: React.ReactNode;
  children: React.ReactNode;
}

/** Hides or replaces action-level UI unless the exact granular grant passes. */
export function PermissionGate({ permission, anyOf = [], allOf = [], fallback = null, children }: PermissionGateProps) {
  const { hasPermission, hasAnyPermission } = useAuth();
  const any = permission ? [permission, ...anyOf] : [...anyOf];
  const allowed = (any.length === 0 || hasAnyPermission(any)) && allOf.every(hasPermission);
  return allowed ? <>{children}</> : <>{fallback}</>;
}

export function usePermission(permission: string) {
  const { hasPermission } = useAuth();
  return hasPermission(permission);
}
