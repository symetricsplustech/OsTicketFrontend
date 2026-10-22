import { tenantadminApi } from "./base";
import type { ApiSuccess } from "@services/http";

export interface MyProfile {
  id: string;
  email: string;
  firstName: string;
  lastName: string;
  displayName: string | null;
  phone: string | null;
  jobTitle: string | null;
  avatarUrl: string | null;
  timezone: string | null;
  locale: string | null;
}

export interface MyPreferences {
  timezone?: string;
  locale?: string;
  theme?: "light" | "dark" | "system";
  emailNotifications?: boolean;
  density?: "comfortable" | "compact";
  landingPage?: string;
}

export interface MyMembership {
  membershipId: string;
  tenantId: string;
  tenantSlug: string;
  tenantName: string;
  tenantStatus: string;
  roleKeys: string[];
}

export interface MyAccount {
  profile: MyProfile;
  tenantRoles: string[];
  permissions: string[];
  preferences: MyPreferences;
  memberships: MyMembership[];
}

export interface MySecurity {
  mfa: Record<string, unknown>;
  activeSessions: number;
  recentLogins: {
    outcome: string;
    failureReason?: string | null;
    ipAddress: string | null;
    createdAt: string;
  }[];
  recentSecurityEvents: {
    eventType: string;
    severity: string;
    details?: unknown;
    createdAt: string;
  }[];
}

export interface MyRecentActivity {
  auditEvents: {
    id: string;
    action: string;
    resourceType: string;
    resourceId: string | null;
    outcome: string;
    createdAt: string;
  }[];
  logins: {
    outcome: string;
    ipAddress: string | null;
    userAgent: string | null;
    createdAt: string;
  }[];
}

export const myAccountApi = tenantadminApi.injectEndpoints({
  endpoints: (build) => ({
    getMyAccount: build.query<ApiSuccess<MyAccount>, void>({
      query: () => ({ url: "/tenant-admin/my-account" }),
      providesTags: ["MyAccount"],
    }),
    updateMyProfile: build.mutation<
      ApiSuccess<MyProfile>,
      Record<string, unknown>
    >({
      query: (body) => ({
        url: "/tenant-admin/my-account/profile",
        method: "PATCH",
        body,
      }),
      invalidatesTags: ["MyAccount"],
    }),
    getMyPreferences: build.query<ApiSuccess<MyPreferences>, void>({
      query: () => ({ url: "/tenant-admin/my-account/preferences" }),
      providesTags: ["MyAccount"],
    }),
    updateMyPreferences: build.mutation<
      ApiSuccess<MyPreferences>,
      Record<string, unknown>
    >({
      query: (body) => ({
        url: "/tenant-admin/my-account/preferences",
        method: "PUT",
        body,
      }),
      invalidatesTags: ["MyAccount"],
    }),
    getMySecurity: build.query<ApiSuccess<MySecurity>, void>({
      query: () => ({ url: "/tenant-admin/my-account/security" }),
      providesTags: ["MyAccount"],
    }),
    getMyRecentActivity: build.query<ApiSuccess<MyRecentActivity>, void>({
      query: () => ({ url: "/tenant-admin/my-account/activity" }),
      providesTags: ["MyAccount"],
    }),
    changeMyPassword: build.mutation<
      ApiSuccess<unknown>,
      { currentPassword: string; newPassword: string }
    >({
      query: (body) => ({
        url: "/auth/change-password",
        method: "POST",
        body,
      }),
    }),
  }),
});

export const {
  useGetMyAccountQuery,
  useUpdateMyProfileMutation,
  useGetMyPreferencesQuery,
  useUpdateMyPreferencesMutation,
  useGetMySecurityQuery,
  useGetMyRecentActivityQuery,
  useChangeMyPasswordMutation,
} = myAccountApi;
