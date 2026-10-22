import { createSlice, type PayloadAction } from "@reduxjs/toolkit";
import type { AuthUser, MyInstance } from "@types";
import { TokenStore } from "@services/auth/tokenStore";

export interface SelectedInstance {
  _id: string;
  name: string;
  status?: string;
}

export interface AuthState {
  token: string | null;
  user: AuthUser | null;
  role: string | null;
  roles: string[];
  permissions: string[];
  moduleKeys: string[];
  instances: MyInstance[];
  selectedInstance: SelectedInstance | null;
}

const initialUser = TokenStore.getUser<AuthUser>();
const initialPermission = TokenStore.getPermissions();
const initialRoles = TokenStore.getRoles();
const initialInstance = TokenStore.getInstance<SelectedInstance>();

const initialState: AuthState = {
  token: TokenStore.get(),
  user: initialUser,
  role: initialUser?.role ?? null,
  roles: initialRoles.length > 0 ? initialRoles : (initialUser?.roles ?? []),
  permissions: initialPermission,
  moduleKeys: [],
  instances: [],
  selectedInstance: initialInstance,
};

const authSlice = createSlice({
  name: "auth",
  initialState,
  reducers: {
    sessionSet(
      state,
      action: PayloadAction<{
        token: string;
        user: AuthUser;
        role?: string | null;
        roles?: string[];
        permissions?: string[];
        moduleKeys?: string[];
      }>,
    ) {
      const { token, user, role, roles, permissions, moduleKeys } =
        action.payload;
      state.token = token;
      state.user = user;
      state.role = role ?? user.role ?? null;
      state.roles = roles ?? user.roles ?? [];
      state.permissions = permissions ?? [];
      state.moduleKeys = moduleKeys ?? [];
      TokenStore.set(token);
      TokenStore.setUser(user);
      TokenStore.setRoles(state.roles);
      TokenStore.setPermissions(state.permissions);
    },
    instanceSelected(
      state,
      action: PayloadAction<{
        token: string;
        instance: SelectedInstance;
        role?: string | null;
        permissions?: string[];
        moduleKeys?: string[];
      }>,
    ) {
      const { token, instance, role, permissions, moduleKeys } = action.payload;
      state.token = token;
      state.selectedInstance = instance;
      state.role = role ?? state.role;
      state.permissions = permissions ?? state.permissions;
      state.moduleKeys = moduleKeys ?? state.moduleKeys;
      TokenStore.set(token);
      TokenStore.setInstance(instance);
      TokenStore.setPermissions(state.permissions);
    },
    instancesReceived(state, action: PayloadAction<MyInstance[]>) {
      state.instances = action.payload;
    },
    permissionsUpdated(
      state,
      action: PayloadAction<{ permissions: string[]; role?: string | null }>,
    ) {
      state.permissions = action.payload.permissions;
      if (action.payload.role !== undefined) state.role = action.payload.role;
      TokenStore.setPermissions(state.permissions);
    },
    logout(state) {
      state.token = null;
      state.user = null;
      state.role = null;
      state.roles = [];
      state.permissions = [];
      state.moduleKeys = [];
      state.instances = [];
      state.selectedInstance = null;
      TokenStore.reset();
    },
  },
});

export const {
  sessionSet,
  instanceSelected,
  instancesReceived,
  permissionsUpdated,
  logout,
} = authSlice.actions;
export const authReducer = authSlice.reducer;

export const selectAuth = (state: { auth: AuthState }) => state.auth;
export const selectIsAuthenticated = (state: { auth: AuthState }) =>
  Boolean(state.auth.token);
export const selectSelectedInstance = (state: { auth: AuthState }) =>
  state.auth.selectedInstance;
export const selectPermissions = (state: { auth: AuthState }) =>
  state.auth.permissions;
export const selectRoles = (state: { auth: AuthState }) => state.auth.roles;
export const selectCan = (permission: string) => (state: { auth: AuthState }) =>
  state.auth.permissions.includes("*") ||
  state.auth.permissions.includes(permission);
