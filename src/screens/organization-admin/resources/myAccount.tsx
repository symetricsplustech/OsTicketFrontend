import type { ResourceListConfig, ConfigPanelConfig } from "@/screens/saas-admin/components/resource/types";
import { asQueryHook, asMutationHook } from "@/screens/saas-admin/components/resource/types";
import {
  useGetMyAccountQuery,
  useUpdateMyProfileMutation,
  useGetMyPreferencesQuery,
  useUpdateMyPreferencesMutation,
  useGetMySecurityQuery,
  useGetMyRecentActivityQuery,
  useChangeMyPasswordMutation,
} from "@services/tenantadmin";
import { statusColumn } from "./columns";
import type { Column } from "@/screens/saas-admin/components/ui/DataTable";

const PROFILE_PATH = "/organization/my-account/my-profile";
const EDIT_PROFILE_PATH = "/organization/my-account/edit-profile";
const CHANGE_PASSWORD_PATH = "/organization/my-account/change-password";
const MFA_PATH = "/organization/my-account/mfa-settings";
const RECOVERY_PATH = "/organization/my-account/recovery-codes";
const SESSIONS_PATH = "/organization/my-account/active-sessions";
const SIGN_OUT_PATH = "/organization/my-account/sign-out-other-sessions";
const NOTIF_PREFS_PATH = "/organization/my-account/notification-preferences";
const TIMEZONE_PATH = "/organization/my-account/personal-timezone";
const DISPLAY_PATH = "/organization/my-account/display-preferences";
const ACTIVITY_PATH = "/organization/my-account/my-recent-activity";

const profileColumns: Column<any>[] = [
  { key: "field", header: "Field", render: (row: any) => row.field },
  { key: "value", header: "Value", render: (row: any) => row.value },
];

const activityColumns: Column<any>[] = [
  { key: "timestamp", header: "Time", render: (row: any) => row.timestamp ? new Date(row.timestamp).toLocaleString() : "-" },
  { key: "action", header: "Action", render: (row: any) => row.action },
  { key: "details", header: "Details", render: (row: any) => row.details },
  { key: "ip", header: "IP", render: (row: any) => row.ip },
];

const sessionColumns: Column<any>[] = [
  { key: "id", header: "Session ID", render: (row: any) => row.id },
  { key: "device", header: "Device", render: (row: any) => row.userAgent },
  { key: "ip", header: "IP", render: (row: any) => row.ipAddress },
  { key: "startedAt", header: "Started", render: (row: any) => row.startedAt ? new Date(row.startedAt).toLocaleString() : "-" },
  { key: "expiresAt", header: "Expires", render: (row: any) => row.expiresAt ? new Date(row.expiresAt).toLocaleString() : "-" },
  statusColumn<any>("status"),
];

const prefColumns: Column<any>[] = [
  { key: "key", header: "Preference", render: (row: any) => row.key },
  { key: "value", header: "Value", render: (row: any) => row.value },
];

export const myAccountConfigs: ResourceListConfig[] = [
  {
    path: PROFILE_PATH,
    title: "My Profile",
    description: "Your profile information and account details",
    sectionLabel: "My Account",
    rowId: "field",
    columns: profileColumns,
    source: {
      kind: "api",
      useList: asQueryHook(useGetMyAccountQuery),
      serverPagination: false,
      extractRows: (payload: any) => {
        const data = payload?.data;
        if (!data) return [];
        return [
          { field: "Name", value: data.name },
          { field: "Email", value: data.email },
          { field: "Job Title", value: data.jobTitle || "-" },
          { field: "Role", value: data.role },
          { field: "User Type", value: data.userType },
          { field: "Status", value: data.status },
          { field: "Timezone", value: data.timezone || "-" },
          { field: "Locale", value: data.locale || "-" },
        ];
      },
    },
    pageSize: 20,
    create: {
      title: "Edit Profile",
      description: "Update your profile information",
      fields: [
        { key: "name", label: "Full Name", type: "text", required: true },
        { key: "jobTitle", label: "Job Title", type: "text" },
        { key: "timezone", label: "Timezone", type: "text" },
        { key: "locale", label: "Locale", type: "text" },
      ],
      useCreate: asMutationHook(useUpdateMyProfileMutation),
      buildBody: (values: Record<string, unknown>) => values,
      successMessage: "Profile updated",
    },
  },
  {
    path: EDIT_PROFILE_PATH,
    title: "Edit Profile",
    description: "Edit your profile information",
    sectionLabel: "My Account",
    rowId: "field",
    columns: profileColumns,
    source: {
      kind: "api",
      useList: asQueryHook(useGetMyAccountQuery),
      serverPagination: false,
      extractRows: (payload: any) => {
        const data = payload?.data;
        if (!data) return [];
        return [
          { field: "Name", value: data.name },
          { field: "Email", value: data.email },
          { field: "Job Title", value: data.jobTitle || "-" },
          { field: "Role", value: data.role },
        ];
      },
    },
    pageSize: 20,
  },
  {
    path: MFA_PATH,
    title: "MFA Settings",
    description: "Manage multi-factor authentication",
    sectionLabel: "My Account",
    rowId: "field",
    columns: profileColumns,
    source: {
      kind: "api",
      useList: asQueryHook(useGetMySecurityQuery),
      serverPagination: false,
      extractRows: (payload: any) => {
        const data = payload?.data;
        if (!data) return [];
        return [
          { field: "MFA Enabled", value: data.mfaEnabled ? "Yes" : "No" },
          { field: "Method", value: data.mfaMethod || "Authenticator App" },
          { field: "Last Used", value: data.mfaLastUsed ? new Date(data.mfaLastUsed).toLocaleString() : "Never" },
        ];
      },
    },
    pageSize: 20,
  },
  {
    path: RECOVERY_PATH,
    title: "Recovery Codes",
    description: "Backup codes for account recovery",
    sectionLabel: "My Account",
    rowId: "code",
    columns: [
      { key: "code", header: "Code", render: (row: any) => row.code },
      { key: "used", header: "Used", render: (row: any) => row.used ? "Yes" : "No" },
      { key: "createdAt", header: "Created", render: (row: any) => row.createdAt ? new Date(row.createdAt).toLocaleString() : "-" },
    ],
    source: {
      kind: "api",
      useList: asQueryHook(useGetMySecurityQuery),
      serverPagination: false,
      extractRows: (payload: any) => payload?.data?.recoveryCodes ?? [],
    },
    pageSize: 20,
  },
  {
    path: SESSIONS_PATH,
    title: "Active Sessions",
    description: "Your active login sessions",
    sectionLabel: "My Account",
    rowId: "id",
    columns: sessionColumns,
    source: {
      kind: "api",
      useList: asQueryHook(useGetMySecurityQuery),
      serverPagination: false,
      extractRows: (payload: any) => payload?.data?.sessions ?? [],
    },
    pageSize: 20,
  },
  {
    path: SIGN_OUT_PATH,
    title: "Sign Out Other Sessions",
    description: "Sign out of all other sessions",
    sectionLabel: "My Account",
    rowId: "id",
    columns: sessionColumns,
    source: {
      kind: "api",
      useList: asQueryHook(useGetMySecurityQuery),
      serverPagination: false,
      extractRows: (payload: any) => payload?.data?.sessions ?? [],
    },
    pageSize: 20,
  },
  {
    path: NOTIF_PREFS_PATH,
    title: "Notification Preferences",
    description: "Configure your notification settings",
    sectionLabel: "My Account",
    rowId: "key",
    columns: prefColumns,
    source: {
      kind: "api",
      useList: asQueryHook(useGetMyPreferencesQuery),
      serverPagination: false,
      extractRows: (payload: any) => {
        const data = payload?.data;
        if (!data) return [];
        return Object.entries(data).map(([k, v]) => ({ key: k, value: String(v) }));
      },
    },
    pageSize: 20,
    create: {
      title: "Update Preferences",
      description: "Update your notification preferences",
      fields: [
        { key: "emailNotifications", label: "Email Notifications", type: "boolean" },
        { key: "inAppNotifications", label: "In-App Notifications", type: "boolean" },
        { key: "smsNotifications", label: "SMS Notifications", type: "boolean" },
        { key: "digestFrequency", label: "Digest Frequency", type: "select", options: [
          { label: "Real-time", value: "realtime" },
          { label: "Hourly", value: "hourly" },
          { label: "Daily", value: "daily" },
          { label: "Weekly", value: "weekly" },
        ]},
      ],
      useCreate: asMutationHook(useUpdateMyPreferencesMutation),
      buildBody: (values: Record<string, unknown>) => values,
      successMessage: "Preferences updated",
    },
  },
  {
    path: TIMEZONE_PATH,
    title: "Personal Timezone",
    description: "Set your personal timezone",
    sectionLabel: "My Account",
    rowId: "field",
    columns: profileColumns,
    source: {
      kind: "api",
      useList: asQueryHook(useGetMyAccountQuery),
      serverPagination: false,
      extractRows: (payload: any) => {
        const data = payload?.data;
        if (!data) return [];
        return [{ field: "Timezone", value: data.timezone || "UTC" }];
      },
    },
    pageSize: 20,
  },
  {
    path: DISPLAY_PATH,
    title: "Display Preferences",
    description: "Customize your display settings",
    sectionLabel: "My Account",
    rowId: "key",
    columns: prefColumns,
    source: {
      kind: "api",
      useList: asQueryHook(useGetMyPreferencesQuery),
      serverPagination: false,
      extractRows: (payload: any) => {
        const data = payload?.data;
        if (!data) return [];
        return Object.entries(data).map(([k, v]) => ({ key: k, value: String(v) }));
      },
    },
    pageSize: 20,
    create: {
      title: "Update Display",
      description: "Update your display preferences",
      fields: [
        { key: "theme", label: "Theme", type: "select", options: [
          { label: "Light", value: "light" },
          { label: "Dark", value: "dark" },
          { label: "System", value: "system" },
        ]},
        { key: "density", label: "Density", type: "select", options: [
          { label: "Compact", value: "compact" },
          { label: "Comfortable", value: "comfortable" },
          { label: "Spacious", value: "spacious" },
        ]},
        { key: "language", label: "Language", type: "select", options: [
          { label: "English", value: "en" },
          { label: "Spanish", value: "es" },
          { label: "French", value: "fr" },
        ]},
      ],
      useCreate: asMutationHook(useUpdateMyPreferencesMutation),
      buildBody: (values: Record<string, unknown>) => values,
      successMessage: "Display preferences updated",
    },
  },
  {
    path: ACTIVITY_PATH,
    title: "My Recent Activity",
    description: "Your recent activity and login history",
    sectionLabel: "My Account",
    rowId: "timestamp",
    columns: activityColumns,
    source: {
      kind: "api",
      useList: asQueryHook(useGetMyRecentActivityQuery),
      serverPagination: true,
      extractRows: (p: any) => p?.data ?? [],
      extractTotal: (p: any) => p?.meta?.total,
    },
    searchable: (row: any) => `${row.action} ${row.details}`,
    pageSize: 20,
  },
];


export const myAccountPanelConfigs: ConfigPanelConfig[] = [
  {
    path: CHANGE_PASSWORD_PATH,
    title: "Change Password",
    description: "Update the password for your account",
    sectionLabel: "My Account",
    fields: [
      { key: "currentPassword", label: "Current Password", type: "password", required: true },
      { key: "newPassword", label: "New Password", type: "password", required: true },
    ],
    useGet: () => ({ data: {}, isLoading: false }),
    useUpdate: asMutationHook(useChangeMyPasswordMutation),
    getValues: () => ({}),
    buildBody: (values: Record<string, unknown>) => ({
      currentPassword: values.currentPassword,
      newPassword: values.newPassword,
    }),
    saveLabel: "Change Password",
    savedMessage: "Password changed",
  },
];
