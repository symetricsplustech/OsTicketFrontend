import { baseApi } from "@shared/api/base";
import {
  sessionSet,
  instancesReceived,
  instanceSelected,
} from "@shared/auth/authSlice";
import type { AppDispatch } from "@shared/store";
import type {
  MeResponse,
  MyInstancesResponse,
  PortalLoginArgs,
  PortalLoginResponse,
  SelectInstanceResponse,
} from "@shared/types";

function toErrorMessage(data: unknown): string {
  if (data && typeof data === "object" && "message" in data) {
    const message = (data as { message: unknown }).message;
    if (typeof message === "string") return message;
  }
  if (data && typeof data === "object" && "error" in data) {
    const error = (data as { error: unknown }).error;
    if (typeof error === "string") return error;
  }
  return "Request failed";
}

export interface RegisterArgs {
  name: string;
  email: string;
  password: string;
}

export interface RegisterResponse {
  success: boolean;
  message?: string;
  confirmationUrl?: string;
}

export const authApi = baseApi.injectEndpoints({
  endpoints: (build) => ({
    portalRegister: build.mutation<RegisterResponse, RegisterArgs>({
      query: (body) => ({ url: "/auth/register", method: "POST", body }),
    }),
    confirmEmail: build.query<{ success: boolean; message: string }, string>({
      query: (token) => ({ url: `/auth/confirm?token=${encodeURIComponent(token)}` }),
    }),
    forgotPassword: build.mutation<{ success: boolean; message: string }, string>({
      query: (email) => ({ url: "/auth/forgot-password", method: "POST", body: { email } }),
    }),
    resetPassword: build.mutation<{ success: boolean; message: string }, { token: string; password: string }>({
      query: (body) => ({ url: "/auth/reset-password", method: "POST", body }),
    }),
    portalLogin: build.mutation<PortalLoginResponse, PortalLoginArgs>({
      query: (body) => ({ url: "/auth/portal-login", method: "POST", body }),
    }),
    me: build.query<MeResponse, void>({
      query: () => ({ url: "/auth/me" }),
      providesTags: ["AuthUser"],
    }),
    myInstances: build.query<MyInstancesResponse, void>({
      query: () => ({ url: "/instances/my-instances" }),
      providesTags: ["Instances"],
    }),
    createInstance: build.mutation<{ success: boolean; instance: { _id: string; name: string }; message: string }, { name: string; domain: string; companyName: string; companyEmail: string }>({
      query: (body) => ({ url: "/instances", method: "POST", body }),
      invalidatesTags: ["Instances"],
    }),
    acceptInvitation: build.mutation<{ success: boolean; message: string }, { instanceId: string; token: string }>({
      query: ({ instanceId, token }) => ({ url: `/instances/${encodeURIComponent(instanceId)}/accept-invitation`, method: "POST", body: { token } }),
      invalidatesTags: ["Instances"],
    }),
    selectInstance: build.mutation<SelectInstanceResponse, string>({
      query: (instanceId) => ({
        url: `/instances/${instanceId}/select`,
        method: "POST",
      }),
    }),
  }),
});

export const {
  usePortalRegisterMutation,
  useConfirmEmailQuery,
  useForgotPasswordMutation,
  useResetPasswordMutation,
  usePortalLoginMutation,
  useMeQuery,
  useMyInstancesQuery,
  useCreateInstanceMutation,
  useAcceptInvitationMutation,
  useSelectInstanceMutation,
} = authApi;

/**
 * Convenience: perform portal login and persist the session in one call.
 */
export async function runPortalLogin(
  dispatch: AppDispatch,
  args: PortalLoginArgs,
): Promise<PortalLoginResponse> {
  const response = await dispatch(authApi.endpoints.portalLogin.initiate(args)).unwrap();
  dispatch(
    sessionSet({
      token: response.token,
      user: response.user,
      role: response.role ?? null,
      permissions: response.permissions,
      moduleKeys: response.moduleKeys,
    }),
  );
  return response;
}

/**
 * Load the current user's instances into the auth slice and return them.
 */
export async function loadMyInstances(
  dispatch: AppDispatch,
): Promise<MyInstancesResponse["instances"]> {
  const response = await dispatch(authApi.endpoints.myInstances.initiate(undefined, { forceRefetch: true })).unwrap();
  dispatch(instancesReceived(response.instances));
  return response.instances;
}

/**
 * Select an instance and persist the instance-scoped token + permissions.
 */
export async function selectInstanceFor(
  dispatch: AppDispatch,
  instanceId: string,
): Promise<SelectInstanceResponse> {
  const response = await dispatch(authApi.endpoints.selectInstance.initiate(instanceId)).unwrap();
  dispatch(
    instanceSelected({
      token: response.token,
      instance: response.instance,
      role: response.role ?? null,
      permissions: response.permissions,
      moduleKeys: response.moduleKeys,
    }),
  );
  return response;
}

export const loginErrorMessage = toErrorMessage;
