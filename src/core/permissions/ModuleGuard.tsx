import React from 'react';
import { Navigate } from 'react-router-dom';
import { useModules } from '@core/permissions/useModule';

interface ModuleGuardProps {
  module: string;
  children: React.ReactNode;
}

export function ModuleGuard({ module, children }: ModuleGuardProps) {
  const { hasModule } = useModules();
  if (!hasModule(module)) {
    return <Navigate to="/" replace />;
  }
  return <>{children}</>;
}
