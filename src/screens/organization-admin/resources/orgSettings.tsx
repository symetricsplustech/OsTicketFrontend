import type { ResourceListConfig, ConfigPanelConfig, ResourceQueryResult } from "@/screens/saas-admin/components/resource/types";
import { asQueryHook, asMutationHook } from "@/screens/saas-admin/components/resource/types";
import {
  useGetOrganizationQuery,
  useUpdateOrganizationMutation,
  useGetOrganizationBrandingQuery,
  useUpdateOrganizationBrandingMutation,
  useGetOrganizationLocalizationQuery,
  useUpdateOrganizationLocalizationMutation,
  useGetOrganizationBusinessHoursQuery,
  useUpdateOrganizationBusinessHoursMutation,
  useGetOrganizationStructureQuery,
  useUpdateOrganizationStructureMutation,
} from "@services/tenantadmin";
import {
  useListSettingsQuery,
  useGetSettingQuery,
  usePutSettingMutation,
  useListCustomFieldQuery,
  useGetCustomFieldQuery,
  useCreateCustomFieldMutation,
  useUpdateCustomFieldMutation,
  useDeleteCustomFieldMutation,
  useGetPortalConfigQuery,
  useUpdatePortalConfigMutation,
  useListPortalFormsQuery,
  usePutPortalFormMutation,
  useDeletePortalFormMutation,
} from "@services/tenantadmin";
import { statusColumn } from "./columns";
import type { Column } from "@/screens/saas-admin/components/ui/DataTable";

const PROFILE_PATH = "/organization/organization-settings/organization-profile";
const BRANDING_PATH = "/organization/organization-settings/branding-and-logo";
const CONTACT_PATH = "/organization/organization-settings/organization-contact-details";
const LOCALE_PATH = "/organization/organization-settings/locale-and-language";
const TIMEZONE_PATH = "/organization/organization-settings/timezone-and-date-format";
const WORKING_HOURS_PATH = "/organization/organization-settings/working-days-and-hours";
const HOLIDAYS_PATH = "/organization/organization-settings/holiday-calendars";
const DEFAULT_GROUP_PATH = "/organization/organization-settings/default-assignment-group";
const DEFAULT_PRIORITY_PATH = "/organization/organization-settings/default-ticket-priorities";
const DEFAULT_CATEGORY_PATH = "/organization/organization-settings/default-ticket-categories";
const NUMBERING_PATH = "/organization/organization-settings/default-ticket-numbering-preferences";
const INVITATION_PATH = "/organization/organization-settings/user-invitation-settings";
const EMPLOYEE_CENTER_PATH = "/organization/organization-settings/employee-center-settings";
const PORTAL_CONFIG_PATH = "/organization/organization-settings/organization-portal-configuration";
const CUSTOM_FIELDS_PATH = "/organization/organization-settings/custom-fields";
const FORM_CONFIG_PATH = "/organization/organization-settings/form-configuration";
const UPLOAD_PATH = "/organization/organization-settings/allowed-file-types-and-upload-limits";
const RETENTION_PATH = "/organization/organization-settings/data-retention-settings";
const FEATURES_PATH = "/organization/organization-settings/feature-availability";

const profileColumns: Column<any>[] = [
  { key: "field", header: "Field", render: (row: any) => row.field },
  { key: "value", header: "Value", render: (row: any) => row.value },
];

const brandingColumns: Column<any>[] = [
  { key: "field", header: "Setting", render: (row: any) => row.field },
  { key: "value", header: "Value", render: (row: any) => row.value },
];

const settingsColumns: Column<any>[] = [
  { key: "key", header: "Setting", render: (row: any) => row.key },
  { key: "value", header: "Value", render: (row: any) => String(row.value).slice(0, 100) },
  { key: "category", header: "Category", render: (row: any) => row.category },
];

const fieldsColumns: Column<any>[] = [
  { key: "label", header: "Field Label", render: (row: any) => row.label },
  { key: "key", header: "Key", render: (row: any) => row.key },
  { key: "type", header: "Type", render: (row: any) => row.fieldType },
  { key: "entity", header: "Entity", render: (row: any) => row.entityType },
  statusColumn<any>("status"),
];

const portalColumns: Column<any>[] = [
  { key: "name", header: "Form", render: (row: any) => row.name },
  { key: "entity", header: "Entity", render: (row: any) => row.entityType },
  { key: "isDefault", header: "Default", render: (row: any) => row.isDefault ? "Yes" : "No" },
  statusColumn<any>("status"),
];

export const orgSettingsConfigs: ResourceListConfig[] = [
  {
    path: PROFILE_PATH,
    title: "Organization Profile",
    description: "Basic organization information",
    sectionLabel: "Organization Settings",
    rowId: "field",
    columns: profileColumns,
    source: {
      kind: "api",
      useList: asQueryHook(useGetOrganizationQuery),
      serverPagination: false,
      extractRows: (payload: any) => {
        const data = payload?.data;
        if (!data) return [];
        return [
          { field: "Name", value: data.name },
          { field: "Industry", value: data.industry || "-" },
          { field: "Website", value: data.website || "-" },
          { field: "Description", value: data.description || "-" },
          { field: "Primary Contact", value: data.primaryContactName || "-" },
          { field: "Contact Email", value: data.primaryContactEmail || "-" },
          { field: "Phone", value: data.phone || "-" },
        ];
      },
    },
    pageSize: 20,
    create: {
      title: "Update Profile",
      description: "Update organization profile",
      fields: [
        { key: "name", label: "Organization Name", type: "text", required: true },
        { key: "industry", label: "Industry", type: "text" },
        { key: "website", label: "Website", type: "text" },
        { key: "description", label: "Description", type: "textarea" },
        { key: "primaryContactName", label: "Primary Contact Name", type: "text" },
        { key: "primaryContactEmail", label: "Contact Email", type: "text" },
        { key: "phone", label: "Phone", type: "text" },
      ],
      useCreate: asMutationHook(useUpdateOrganizationMutation),
      buildBody: (values: Record<string, unknown>) => values,
      successMessage: "Profile updated",
    },
  },
  {
    path: BRANDING_PATH,
    title: "Branding and Logo",
    description: "Organization branding and logo",
    sectionLabel: "Organization Settings",
    rowId: "field",
    columns: brandingColumns,
    source: {
      kind: "api",
      useList: asQueryHook(useGetOrganizationBrandingQuery),
      serverPagination: false,
      extractRows: (payload: any) => {
        const data = payload?.data;
        if (!data) return [];
        return [
          { field: "Logo", value: data.logoUrl ? "Uploaded" : "Not set" },
          { field: "Favicon", value: data.faviconUrl ? "Uploaded" : "Not set" },
          { field: "Primary Color", value: data.primaryColor || "#0066CC" },
          { field: "Secondary Color", value: data.secondaryColor || "#00AA55" },
        ];
      },
    },
    pageSize: 20,
    create: {
      title: "Update Branding",
      description: "Update branding and logo",
      fields: [
        { key: "logo", label: "Logo", type: "text", placeholder: "URL or base64" },
        { key: "favicon", label: "Favicon", type: "text", placeholder: "URL or base64" },
        { key: "primaryColor", label: "Primary Color", type: "text" },
        { key: "secondaryColor", label: "Secondary Color", type: "text" },
      ],
      useCreate: asMutationHook(useUpdateOrganizationBrandingMutation),
      buildBody: (values: Record<string, unknown>) => values,
      successMessage: "Branding updated",
    },
  },
  {
    path: CONTACT_PATH,
    title: "Organization Contact Details",
    description: "Contact information for the organization",
    sectionLabel: "Organization Settings",
    rowId: "field",
    columns: profileColumns,
    source: {
      kind: "api",
      useList: asQueryHook(useGetOrganizationQuery),
      serverPagination: false,
      extractRows: (payload: any) => {
        const data = payload?.data;
        if (!data) return [];
        return [
          { field: "Address", value: data.address || "-" },
          { field: "City", value: data.city || "-" },
          { field: "State/Province", value: data.state || "-" },
          { field: "Postal Code", value: data.postalCode || "-" },
          { field: "Country", value: data.country || "-" },
          { field: "Phone", value: data.phone || "-" },
          { field: "Fax", value: data.fax || "-" },
        ];
      },
    },
    pageSize: 20,
    create: {
      title: "Update Contact Details",
      description: "Update contact information",
      fields: [
        { key: "address", label: "Address", type: "text" },
        { key: "city", label: "City", type: "text" },
        { key: "state", label: "State/Province", type: "text" },
        { key: "postalCode", label: "Postal Code", type: "text" },
        { key: "country", label: "Country", type: "text" },
        { key: "phone", label: "Phone", type: "text" },
        { key: "fax", label: "Fax", type: "text" },
      ],
      useCreate: asMutationHook(useUpdateOrganizationMutation),
      buildBody: (values: Record<string, unknown>) => values,
      successMessage: "Contact details updated",
    },
  },
  {
    path: LOCALE_PATH,
    title: "Locale and Language",
    description: "Default locale and language settings",
    sectionLabel: "Organization Settings",
    rowId: "field",
    columns: profileColumns,
    source: {
      kind: "api",
      useList: asQueryHook(useGetOrganizationLocalizationQuery),
      serverPagination: false,
      extractRows: (payload: any) => {
        const data = payload?.data;
        if (!data) return [];
        return [
          { field: "Default Language", value: data.defaultLanguage || "en" },
          { field: "Supported Languages", value: data.supportedLanguages?.join(", ") || "en" },
          { field: "Date Format", value: data.dateFormat || "MM/DD/YYYY" },
          { field: "Time Format", value: data.timeFormat || "12h" },
          { field: "Number Format", value: data.numberFormat || "1,234.56" },
        ];
      },
    },
    pageSize: 20,
    create: {
      title: "Update Localization",
      description: "Update locale and language settings",
      fields: [
        { key: "defaultLanguage", label: "Default Language", type: "select", options: [
          { label: "English", value: "en" },
          { label: "Spanish", value: "es" },
          { label: "French", value: "fr" },
          { label: "German", value: "de" },
        ]},
        { key: "supportedLanguages", label: "Supported Languages", type: "text", placeholder: "Comma-separated" },
        { key: "dateFormat", label: "Date Format", type: "text" },
        { key: "timeFormat", label: "Time Format", type: "select", options: [
          { label: "12-hour", value: "12h" },
          { label: "24-hour", value: "24h" },
        ]},
        { key: "numberFormat", label: "Number Format", type: "text" },
      ],
      useCreate: asMutationHook(useUpdateOrganizationLocalizationMutation),
      buildBody: (values: Record<string, unknown>) => ({
        ...values,
        supportedLanguages: String(values.supportedLanguages).split(",").map(s => s.trim()),
      }),
      successMessage: "Localization updated",
    },
  },
  {
    path: TIMEZONE_PATH,
    title: "Timezone and Date Format",
    description: "Timezone and date/time format settings",
    sectionLabel: "Organization Settings",
    rowId: "field",
    columns: profileColumns,
    source: {
      kind: "api",
      useList: asQueryHook(useGetOrganizationLocalizationQuery),
      serverPagination: false,
      extractRows: (payload: any) => {
        const data = payload?.data;
        if (!data) return [];
        return [
          { field: "Timezone", value: data.timezone || "UTC" },
          { field: "Date Format", value: data.dateFormat || "MM/DD/YYYY" },
          { field: "Time Format", value: data.timeFormat || "12h" },
        ];
      },
    },
    pageSize: 20,
    create: {
      title: "Update Timezone Settings",
      description: "Update timezone and date format",
      fields: [
        { key: "timezone", label: "Timezone", type: "select", options: [
          { label: "UTC", value: "UTC" },
          { label: "America/New_York", value: "America/New_York" },
          { label: "America/Chicago", value: "America/Chicago" },
          { label: "America/Denver", value: "America/Denver" },
          { label: "America/Los_Angeles", value: "America/Los_Angeles" },
          { label: "Europe/London", value: "Europe/London" },
          { label: "Europe/Paris", value: "Europe/Paris" },
          { label: "Asia/Tokyo", value: "Asia/Tokyo" },
          { label: "Asia/Shanghai", value: "Asia/Shanghai" },
        ]},
        { key: "dateFormat", label: "Date Format", type: "text" },
        { key: "timeFormat", label: "Time Format", type: "select", options: [
          { label: "12-hour", value: "12h" },
          { label: "24-hour", value: "24h" },
        ]},
      ],
      useCreate: asMutationHook(useUpdateOrganizationLocalizationMutation),
      buildBody: (values: Record<string, unknown>) => values,
      successMessage: "Timezone settings updated",
    },
  },
  {
    path: WORKING_HOURS_PATH,
    title: "Working Days and Hours",
    description: "Business hours and working days",
    sectionLabel: "Organization Settings",
    rowId: "day",
    columns: [
      { key: "day", header: "Day", render: (row: any) => row.day },
      { key: "start", header: "Start", render: (row: any) => row.start || "Closed" },
      { key: "end", header: "End", render: (row: any) => row.end || "Closed" },
      { key: "isWorking", header: "Working Day", render: (row: any) => row.isWorking ? "Yes" : "No" },
    ],
    source: {
      kind: "api",
      useList: asQueryHook(useGetOrganizationBusinessHoursQuery),
      serverPagination: false,
      extractRows: (payload: any) => payload?.data?.workingHours ?? [],
    },
    pageSize: 20,
    create: {
      title: "Update Business Hours",
      description: "Update working days and hours",
      fields: [
        { key: "workingHours", label: "Working Hours (JSON)", type: "textarea", required: true },
      ],
      useCreate: asMutationHook(useUpdateOrganizationBusinessHoursMutation),
      buildBody: (values: Record<string, unknown>) => JSON.parse(values.workingHours as string),
      successMessage: "Business hours updated",
    },
  },
  {
    path: HOLIDAYS_PATH,
    title: "Holiday Calendars",
    description: "Organization holiday calendars",
    sectionLabel: "Organization Settings",
    rowId: "id",
    columns: [
      { key: "name", header: "Holiday", render: (row: any) => row.name },
      { key: "date", header: "Date", render: (row: any) => row.date ? new Date(row.date).toLocaleDateString() : "-" },
      { key: "recurring", header: "Recurring", render: (row: any) => row.recurring ? "Yes" : "No" },
      statusColumn<any>("status"),
    ],
    source: {
      kind: "api",
      useList: asQueryHook(useGetOrganizationBusinessHoursQuery),
      serverPagination: true,
      extractRows: (payload: any) => payload?.data?.holidays ?? [],
      extractTotal: (payload: any) => payload?.meta?.total,
    },
    pageSize: 20,
  },
  {
    path: DEFAULT_GROUP_PATH,
    title: "Default Assignment Group",
    description: "Default ticket assignment group",
    sectionLabel: "Organization Settings",
    rowId: "field",
    columns: profileColumns,
    source: {
      kind: "api",
      useList: asQueryHook(useGetOrganizationStructureQuery),
      serverPagination: false,
      extractRows: (payload: any) => {
        const data = payload?.data;
        if (!data) return [];
        return [{ field: "Default Group", value: data.defaultAssignmentGroup?.name || "Not set" }];
      },
    },
    pageSize: 20,
  },
  {
    path: DEFAULT_PRIORITY_PATH,
    title: "Default Ticket Priorities",
    description: "Default priority for new tickets",
    sectionLabel: "Organization Settings",
    rowId: "field",
    columns: profileColumns,
    source: {
      kind: "api",
      useList: asQueryHook(useGetOrganizationStructureQuery),
      serverPagination: false,
      extractRows: (payload: any) => {
        const data = payload?.data;
        if (!data) return [];
        return [{ field: "Default Priority", value: data.defaultTicketPriority || "Medium" }];
      },
    },
    pageSize: 20,
  },
  {
    path: DEFAULT_CATEGORY_PATH,
    title: "Default Ticket Categories",
    description: "Default category for new tickets",
    sectionLabel: "Organization Settings",
    rowId: "field",
    columns: profileColumns,
    source: {
      kind: "api",
      useList: asQueryHook(useGetOrganizationStructureQuery),
      serverPagination: false,
      extractRows: (payload: any) => {
        const data = payload?.data;
        if (!data) return [];
        return [{ field: "Default Category", value: data.defaultTicketCategory?.name || "Not set" }];
      },
    },
    pageSize: 20,
  },
  {
    path: NUMBERING_PATH,
    title: "Default Ticket Numbering Preferences",
    description: "Ticket numbering format and sequence",
    sectionLabel: "Organization Settings",
    rowId: "field",
    columns: profileColumns,
    source: {
      kind: "api",
      useList: asQueryHook(useGetOrganizationStructureQuery),
      serverPagination: false,
      extractRows: (payload: any) => {
        const data = payload?.data;
        if (!data) return [];
        return [
          { field: "Prefix", value: data.ticketNumberPrefix || "INC" },
          { field: "Sequence", value: data.ticketNumberSequence || "00001" },
          { field: "Format", value: data.ticketNumberFormat || "{PREFIX}-{SEQUENCE}" },
        ];
      },
    },
    pageSize: 20,
  },
  {
    path: INVITATION_PATH,
    title: "User Invitation Settings",
    description: "User invitation email and expiration settings",
    sectionLabel: "Organization Settings",
    rowId: "field",
    columns: profileColumns,
    source: {
      kind: "api",
      useList: asQueryHook(useGetOrganizationStructureQuery),
      serverPagination: false,
      extractRows: (payload: any) => {
        const data = payload?.data;
        if (!data) return [];
        return [
          { field: "Invitation Expiry (days)", value: data.invitationExpiryDays || 7 },
          { field: "Require Approval", value: data.requireInvitationApproval ? "Yes" : "No" },
          { field: "Default Role", value: data.defaultInvitationRole || "Viewer" },
        ];
      },
    },
    pageSize: 20,
  },
  {
    path: EMPLOYEE_CENTER_PATH,
    title: "Employee Center Settings",
    description: "Employee self-service portal settings",
    sectionLabel: "Organization Settings",
    rowId: "field",
    columns: profileColumns,
    source: {
      kind: "api",
      useList: asQueryHook(useGetOrganizationStructureQuery),
      serverPagination: false,
      extractRows: (payload: any) => {
        const data = payload?.data;
        if (!data) return [];
        return [
          { field: "Enabled", value: data.employeeCenterEnabled ? "Yes" : "No" },
          { field: "Custom Domain", value: data.employeeCenterDomain || "-" },
          { field: "SSO Enabled", value: data.employeeCenterSsoEnabled ? "Yes" : "No" },
        ];
      },
    },
    pageSize: 20,
  },
  {
    path: PORTAL_CONFIG_PATH,
    title: "Organization Portal Configuration",
    description: "Portal appearance and behavior",
    sectionLabel: "Organization Settings",
    rowId: "key",
    columns: settingsColumns,
    source: {
      kind: "api",
      useList: asQueryHook(useGetPortalConfigQuery),
      serverPagination: true,
      extractRows: (p: any) => p?.data ?? [],
      extractTotal: (p: any) => p?.meta?.total,
    },
    searchable: (row: any) => `${row.key}`,
    pageSize: 20,
    create: {
      title: "Update Portal Config",
      description: "Update portal configuration",
      fields: [
        { key: "key", label: "Config Key", type: "text", required: true },
        { key: "value", label: "Value", type: "text", required: true },
      ],
      useCreate: asMutationHook(useUpdatePortalConfigMutation),
      buildBody: (values: Record<string, unknown>) => values,
      successMessage: "Portal config updated",
    },
  },
];

function settingsValuePanel(key: string) {
  return {
    useGet: (): ResourceQueryResult => {
      const result = useListSettingsQuery();
      const rows = (
        result.data as
          | { data?: Array<{ key: string; value: unknown }> }
          | undefined
      )?.data;
      const row = rows?.find((entry) => entry.key === key);
      return {
        data: row ? { data: row.value } : undefined,
        isLoading: result.isLoading,
        error: result.error,
        refetch: result.refetch,
      };
    },
    getValues: (payload: unknown): Record<string, unknown> =>
      payload && typeof payload === "object"
        ? (payload as Record<string, unknown>)
        : {},
    buildBody: (values: Record<string, unknown>) => ({ key, value: values }),
  };
}

export const orgSettingsPanelConfigs: ConfigPanelConfig[] = [
  {
    path: CUSTOM_FIELDS_PATH,
    title: "Custom Fields",
    description: "Custom fields for tickets, assets, CIs and more",
    sectionLabel: "Organization Settings",
    fields: [
      { key: "label", label: "Field Label", type: "text", required: true },
      { key: "key", label: "Field Key", type: "text", required: true },
      { key: "fieldType", label: "Field Type", type: "select", required: true, options: [
        { label: "Text", value: "text" },
        { label: "Number", value: "number" },
        { label: "Date", value: "date" },
        { label: "Select", value: "select" },
        { label: "Boolean", value: "boolean" },
      ]},
      { key: "entityType", label: "Entity Type", type: "select", required: true, options: [
        { label: "Ticket", value: "ticket" },
        { label: "Asset", value: "asset" },
        { label: "CI", value: "ci" },
        { label: "Change", value: "change" },
        { label: "Problem", value: "problem" },
      ]},
      { key: "options", label: "Options (for select)", type: "textarea" },
      { key: "required", label: "Required", type: "boolean" },
    ],
    useGet: asQueryHook(useListCustomFieldQuery),
    useUpdate: asMutationHook(useUpdateCustomFieldMutation),
    getValues: (payload: any) => payload?.data?.[0] ?? {},
    buildBody: (values: Record<string, unknown>) => values,
    saveLabel: "Save Field",
    savedMessage: "Custom field saved",
  },
  {
    path: FORM_CONFIG_PATH,
    title: "Form Configuration",
    description: "Form layouts and field configurations",
    sectionLabel: "Organization Settings",
    fields: [
      { key: "name", label: "Form Name", type: "text", required: true },
      { key: "entityType", label: "Entity Type", type: "select", required: true, options: [
        { label: "Ticket", value: "ticket" },
        { label: "Asset", value: "asset" },
        { label: "CI", value: "ci" },
      ]},
      { key: "isDefault", label: "Default Form", type: "boolean" },
      { key: "layout", label: "Layout (JSON)", type: "textarea" },
    ],
    useGet: asQueryHook(useListPortalFormsQuery),
    useUpdate: asMutationHook(usePutPortalFormMutation),
    getValues: (payload: any) => payload?.data?.[0] ?? {},
    buildBody: (values: Record<string, unknown>) => values,
    saveLabel: "Save Form",
    savedMessage: "Form saved",
  },
  {
    path: UPLOAD_PATH,
    title: "Allowed File Types and Upload Limits",
    description: "Configure file upload restrictions",
    sectionLabel: "Organization Settings",
    fields: [
      { key: "allowedTypes", label: "Allowed Types", type: "text", placeholder: "Comma-separated MIME types" },
      { key: "maxFileSize", label: "Max File Size (MB)", type: "number" },
      { key: "maxFiles", label: "Max Files per Upload", type: "number" },
    ],
    ...settingsValuePanel("fileUpload"),
    useUpdate: asMutationHook(usePutSettingMutation),
    saveLabel: "Save Upload Settings",
    savedMessage: "Upload settings saved",
  },
  {
    path: RETENTION_PATH,
    title: "Data Retention Settings",
    description: "Configure data retention policies",
    sectionLabel: "Organization Settings",
    fields: [
      { key: "ticketRetentionDays", label: "Ticket Retention (days)", type: "number" },
      { key: "auditRetentionDays", label: "Audit Log Retention (days)", type: "number" },
      { key: "attachmentRetentionDays", label: "Attachment Retention (days)", type: "number" },
      { key: "autoDelete", label: "Auto-delete Expired", type: "boolean" },
    ],
    ...settingsValuePanel("dataRetention"),
    useUpdate: asMutationHook(usePutSettingMutation),
    saveLabel: "Save Retention",
    savedMessage: "Retention settings saved",
  },
  {
    path: FEATURES_PATH,
    title: "Feature Availability",
    description: "Enable/disable features for your organization",
    sectionLabel: "Organization Settings",
    fields: [
      { key: "incidentManagement", label: "Incident Management", type: "boolean" },
      { key: "problemManagement", label: "Problem Management", type: "boolean" },
      { key: "changeManagement", label: "Change Management", type: "boolean" },
      { key: "requestManagement", label: "Request Management", type: "boolean" },
      { key: "knowledgeManagement", label: "Knowledge Management", type: "boolean" },
      { key: "assetManagement", label: "Asset Management", type: "boolean" },
      { key: "serviceCatalog", label: "Service Catalog", type: "boolean" },
      { key: "workflowAutomation", label: "Workflow Automation", type: "boolean" },
      { key: "slaManagement", label: "SLA Management", type: "boolean" },
      { key: "reporting", label: "Reporting & Analytics", type: "boolean" },
    ],
    ...settingsValuePanel("featureAvailability"),
    useUpdate: asMutationHook(usePutSettingMutation),
    saveLabel: "Save Features",
    savedMessage: "Feature settings saved",
  },
];

