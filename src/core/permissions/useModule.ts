import { useAuth } from '@core/auth/useAuth';

export function useModules() {
  const { modules, hasModule, refreshModules } = useAuth();
  return { modules, hasModule, refreshModules };
}
