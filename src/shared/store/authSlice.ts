import { createSlice, createAsyncThunk, PayloadAction } from '@reduxjs/toolkit';
import api from '@shared/lib/api';
import type { User, Tenant } from '@shared/types';
import { platformApi } from './platformApi';
import type { RootState } from './store';

interface AuthState {
  user: User | null;
  tenant: Tenant | null;
  modules: string[];
  loading: boolean;
}

const initialState: AuthState = {
  user: null,
  tenant: null,
  modules: [],
  loading: true,
};

export const loginThunk = createAsyncThunk<
  { user: User; tenant: Tenant | null; modules: string[] },
  { email: string; password: string },
  { rejectValue: string }
>('auth/login', async ({ email, password }, { dispatch, rejectWithValue }) => {
  try {
    const res = await api.post('/auth/portal-login', { email, password });
    const { token, user: u, tenant: t, role, permissions, moduleKeys } = res.data;

    const resolvedUser: User = {
      ...u,
      role: role || u.role,
      permissions: permissions || u.permissions || [],
      modules: normalizeModuleKeys(moduleKeys || u.moduleKeys || u.modules || []),
    };

    localStorage.setItem('token', token);
    localStorage.setItem('user', JSON.stringify({ user: resolvedUser, tenant: t }));

    // Fetch modules (backend may return string keys or { moduleKey } docs)
    let modules: string[] = [];
    try {
      const modRes = await api.get('/auth/modules');
      modules = normalizeModuleKeys(modRes.data.modules);
    } catch {}

    return { user: resolvedUser, tenant: t, modules };
  } catch (err: any) {
    return rejectWithValue(err.response?.data?.message || 'Login failed');
  }
});

export const logoutThunk = createAsyncThunk('auth/logout', async (_, { dispatch }) => {
  localStorage.removeItem('token');
  localStorage.removeItem('user');
  dispatch(platformApi.util.resetApiState());
  window.location.href = '/login';
});

export const hydrateThunk = createAsyncThunk('auth/hydrate', async (_, { dispatch }) => {
  const token = localStorage.getItem('token');
  const storedUser = localStorage.getItem('user');
  if (token && storedUser) {
    try {
      const parsed = JSON.parse(storedUser);
      dispatch(setCredentials({ user: parsed.user, tenant: parsed.tenant }));

      // Fetch modules (backend may return string keys or { moduleKey } docs)
      try {
        const modRes = await api.get('/auth/modules');
        dispatch(setModules(normalizeModuleKeys(modRes.data.modules)));
      } catch {}
    } catch {
      localStorage.removeItem('token');
      localStorage.removeItem('user');
    }
  }
  dispatch(setLoading(false));
});

export const refreshModulesThunk = createAsyncThunk('auth/refreshModules', async (_, { dispatch }) => {
  try {
    const modRes = await api.get('/auth/modules');
    dispatch(setModules(normalizeModuleKeys(modRes.data.modules)));
  } catch {}
});

// Backend returns either string keys (superadmin branch) or
// tenant_modules docs ({ moduleKey, ... }). Normalize to string keys.
export function normalizeModuleKeys(raw: any): string[] {
  if (!Array.isArray(raw)) return [];
  const out: string[] = [];
  for (const m of raw) {
    const key = typeof m === 'string' ? m : m?.moduleKey || m?.key;
    if (key && !out.includes(key)) out.push(key);
  }
  return out;
}

const authSlice = createSlice({
  name: 'auth',
  initialState,
  reducers: {
    setCredentials(state, action: PayloadAction<{ user: User; tenant: Tenant | null }>) {
      state.user = action.payload.user;
      state.tenant = action.payload.tenant;
    },
    setModules(state, action: PayloadAction<string[]>) {
      state.modules = action.payload;
    },
    setLoading(state, action: PayloadAction<boolean>) {
      state.loading = action.payload;
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(loginThunk.fulfilled, (state, action) => {
        state.user = action.payload.user;
        state.tenant = action.payload.tenant;
        state.modules = action.payload.modules;
        state.loading = false;
      })
      .addCase(hydrateThunk.fulfilled, (state) => {
        state.loading = false;
      });
  },
});

export const { setCredentials, setModules, setLoading } = authSlice.actions;

// Selectors
export const selectCurrentUser = (state: RootState) => state.auth.user;
export const selectCurrentTenant = (state: RootState) => state.auth.tenant;
export const selectModules = (state: RootState) => state.auth.modules;
export const selectAuthLoading = (state: RootState) => state.auth.loading;
export const selectIsSuperAdmin = (state: RootState) => state.auth.user?.role === 'superadmin';

// Permission helpers (pure functions)
export function hasPermission(user: User | null, permission: string): boolean {
  if (!user) return false;
  if (user.role === 'superadmin') return true;
  if (user.permissions?.includes(permission)) return true;
  if (user.permissions?.some(p => {
    const parts = permission.split('.');
    for (let i = parts.length - 1; i > 0; i--) {
      const parent = parts.slice(0, i).join('.manage');
      if (p === parent) return true;
    }
    return false;
  })) return true;
  return false;
}

export function hasModule(user: User | null, modules: string[], moduleKey: string): boolean {
  if (user?.role === 'superadmin') return false;
  if (user?.modules?.includes(moduleKey)) return true;
  return modules.includes(moduleKey);
}

export default authSlice.reducer;
