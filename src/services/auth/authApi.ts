import { createApi } from "@reduxjs/toolkit/query/react";
import { API_URL, apiErrorMessage, baseQueryWithAuth, loginErrorMessage } from "@services/http";
import { sessionSet } from "@services/auth/authSlice";
import { demoLoginSuccess, findDemoAccount } from "@services/auth/demoAccounts";
import { TokenStore } from "@services/auth/tokenStore";
import type { AppDispatch } from "@store";
import type { AuthUser } from "@types";
import type {
  AuthSessionPayload,
  LoginResponse,
  LoginSuccess,
  MeResponse,
  MessageResponse,
  PublicProfile,
  SessionRecord,
} from "./types";
import type { ApiSuccess } from "@services/http";

export interface LoginArgs {
  email: string;
  password: string;
  rememberMe?: boolean;
}

export interface RefreshArgs {
  refreshToken: string;
}

export interface InvitationAcceptArgs {
  token: string;
  password: string;
}

export interface ChangePasswordArgs {
  currentPassword: string;
  newPassword: string;
}

export interface ResetPasswordArgs {
  token: string;
  password: string;
}

export interface MfaVerifyArgs {
  mfaToken: string;
  code: string;
}

export interface MfaEnrollArgs {
  label?: string;
}

export interface MfaVerifyEnrollmentArgs {
  code: string;
}

export interface MfaDisableArgs {
  password: string;
  code: string;
}

export interface RecoveryCodesResponse {
  recoveryCodes: string[];
  message: string;
}

/** Maps the backend `PublicProfile` onto the session `AuthUser` shape. */
export function mapProfileToAuthUser(
  profile: PublicProfile,
  roles: string[] = [],
): AuthUser {
  const name =
    profile.displayName?.trim() ||
    `${profile.firstName ?? ""} ${profile.lastName ?? ""}`.trim() ||
    profile.email;
  return {
    _id: profile.id,
    id: profile.id,
    name,
    email: profile.email,
    role: roles[0] ?? null,
    roles,
    avatarUrl: profile.avatarUrl,
    jobTitle: profile.jobTitle,
    userType: profile.userType,
    status: profile.status,
  };
}

function persistSession(dispatch: AppDispatch, session: AuthSessionPayload): void {
  TokenStore.setRefresh(session.refreshToken);
  dispatch(
    sessionSet({
      token: session.accessToken,
      user: mapProfileToAuthUser(session.user, session.roles),
      role: session.roles[0] ?? null,
      roles: session.roles,
      permissions: session.permissions,
      moduleKeys: [],
    }),
  );
}

/**
 * Common authentication API.
 *
 * The full auth flow (sign-in, refresh, profile, password recovery, MFA and
 * session management) lives here so every surface shares one implementation
 * instead of a per-feature copy.
 */
export const authApi = createApi({
  reducerPath: "authApi",
  baseQuery: baseQueryWithAuth,
  tagTypes: ["AuthUser", "Session"],
  endpoints: (build) => ({
    login: build.mutation<ApiSuccess<LoginResponse>, LoginArgs>({
      query: (body) => ({ url: "/auth/login", method: "POST", body }),
    }),
    refresh: build.mutation<ApiSuccess<LoginSuccess>, RefreshArgs>({
      query: (body) => ({ url: "/auth/refresh", method: "POST", body }),
    }),
    me: build.query<ApiSuccess<MeResponse>, void>({
      query: () => ({ url: "/auth/me" }),
      providesTags: ["AuthUser"],
    }),
    logout: build.mutation<null, void>({
      query: () => ({ url: "/auth/logout", method: "POST" }),
      invalidatesTags: ["AuthUser", "Session"],
    }),
    acceptInvitation: build.mutation<ApiSuccess<MessageResponse>, InvitationAcceptArgs>({
      query: (body) => ({ url: "/auth/invitation/accept", method: "POST", body }),
    }),
    forgotPassword: build.mutation<ApiSuccess<MessageResponse>, string>({
      query: (email) => ({ url: "/auth/forgot-password", method: "POST", body: { email } }),
    }),
    resetPassword: build.mutation<ApiSuccess<MessageResponse>, ResetPasswordArgs>({
      query: (body) => ({ url: "/auth/reset-password", method: "POST", body }),
    }),
    changePassword: build.mutation<null, ChangePasswordArgs>({
      query: (body) => ({ url: "/auth/change-password", method: "POST", body }),
    }),
    mfaVerify: build.mutation<ApiSuccess<LoginSuccess>, MfaVerifyArgs>({
      query: (body) => ({ url: "/auth/mfa/verify", method: "POST", body }),
    }),
    mfaStatus: build.query<ApiSuccess<Record<string, unknown>>, void>({
      query: () => ({ url: "/auth/mfa/status" }),
      providesTags: ["AuthUser"],
    }),
    mfaEnroll: build.mutation<ApiSuccess<Record<string, unknown>>, MfaEnrollArgs>({
      query: (body) => ({ url: "/auth/mfa/enroll", method: "POST", body }),
    }),
    mfaVerifyEnrollment: build.mutation<ApiSuccess<RecoveryCodesResponse>, MfaVerifyEnrollmentArgs>({
      query: (body) => ({ url: "/auth/mfa/verify-enrollment", method: "POST", body }),
      invalidatesTags: ["AuthUser"],
    }),
    mfaDisable: build.mutation<null, MfaDisableArgs>({
      query: (body) => ({ url: "/auth/mfa", method: "DELETE", body }),
      invalidatesTags: ["AuthUser"],
    }),
    mfaRegenerateRecoveryCodes: build.mutation<ApiSuccess<RecoveryCodesResponse>, { password: string }>({
      query: (body) => ({ url: "/auth/mfa/recovery-codes/regenerate", method: "POST", body }),
    }),
    listSessions: build.query<ApiSuccess<SessionRecord[]>, void>({
      query: () => ({ url: "/auth/sessions" }),
      providesTags: ["Session"],
    }),
    revokeSession: build.mutation<null, string>({
      query: (sessionId) => ({ url: `/auth/sessions/${encodeURIComponent(sessionId)}`, method: "DELETE" }),
      invalidatesTags: ["Session"],
    }),
  }),
});

export const {
  useLoginMutation,
  useRefreshMutation,
  useMeQuery,
  useLogoutMutation,
  useAcceptInvitationMutation,
  useForgotPasswordMutation,
  useResetPasswordMutation,
  useChangePasswordMutation,
  useMfaVerifyMutation,
  useMfaStatusQuery,
  useMfaEnrollMutation,
  useMfaVerifyEnrollmentMutation,
  useMfaDisableMutation,
  useMfaRegenerateRecoveryCodesMutation,
  useListSessionsQuery,
  useRevokeSessionMutation,
} = authApi;

/**
 * Signs in and persists the session in one call. Returns the MFA challenge
 * unchanged when the account requires a second factor.
 */
export async function runLogin(
  dispatch: AppDispatch,
  args: LoginArgs,
): Promise<LoginResponse> {
  const demo = findDemoAccount(args.email, args.password);
  if (demo) {
    const success = demoLoginSuccess(demo);
    persistSession(dispatch, success);
    return success;
  }
  const response = await dispatch(authApi.endpoints.login.initiate(args)).unwrap();
  if (response.data.mfaRequired) return response.data;
  persistSession(dispatch, response.data);
  return response.data;
}

/** Completes an MFA challenge and persists the resulting session. */
export async function runMfaVerify(
  dispatch: AppDispatch,
  args: MfaVerifyArgs,
): Promise<LoginSuccess> {
  const response = await dispatch(authApi.endpoints.mfaVerify.initiate(args)).unwrap();
  persistSession(dispatch, response.data);
  return response.data;
}

/** Revokes the server session (best-effort) and clears local credentials. */
export async function runLogout(dispatch: AppDispatch): Promise<void> {
  try {
    await dispatch(authApi.endpoints.logout.initiate()).unwrap();
  } catch {
    /* the local session is cleared regardless of the server outcome */
  } finally {
    TokenStore.clearRefresh();
  }
}

export { API_URL, apiErrorMessage, loginErrorMessage };
