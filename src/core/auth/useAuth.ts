import { useCallback } from 'react';
import { useAppDispatch, useAppSelector } from '@shared/store/hooks';
import {
  selectCurrentUser,
  selectCurrentTenant,
  selectModules,
  selectAuthLoading,
  hasPermission as hasPermissionFn,
  hasModule as hasModuleFn,
  loginThunk,
  logoutThunk,
  refreshModulesThunk,
} from '@shared/store/authSlice';

export function useAuth() {
  const dispatch = useAppDispatch();
  const user = useAppSelector(selectCurrentUser);
  const tenant = useAppSelector(selectCurrentTenant);
  const modules = useAppSelector(selectModules);
  const loading = useAppSelector(selectAuthLoading);

  const login = useCallback(
    async (email: string, password: string, totpCode?: string) => {
      const result = await dispatch(loginThunk({ email, password, totpCode }));
      if (loginThunk.rejected.match(result)) {
        const err: any = new Error(result.payload?.message || 'Login failed');
        err.twoFactorRequired = result.payload?.twoFactorRequired;
        throw err;
      }
    },
    [dispatch],
  );

  const logout = useCallback(() => {
    dispatch(logoutThunk());
  }, [dispatch]);

  const hasPermission = useCallback(
    (permission: string) => hasPermissionFn(user, permission),
    [user],
  );

  const hasModule = useCallback(
    (moduleKey: string) => hasModuleFn(user, modules, moduleKey),
    [user, modules],
  );

  const hasAnyPermission = useCallback(
    (perms: string[]) => perms.some((p) => hasPermissionFn(user, p)),
    [user],
  );

  const refreshModules = useCallback(async () => {
    await dispatch(refreshModulesThunk());
  }, [dispatch]);

  return { user, tenant, modules, loading, login, logout, hasModule, hasPermission, hasAnyPermission, refreshModules };
}
