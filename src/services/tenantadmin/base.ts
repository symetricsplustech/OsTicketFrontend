import { createApi } from "@reduxjs/toolkit/query/react";
import { baseQueryWithAuth } from "@services/http";

export type TenantAdminTag =
  | "Organization"
  | "OrganizationBranding"
  | "OrganizationLocalization"
  | "OrganizationBusinessHours"
  | "OrganizationStructure"
  | "TenantUser"
  | "Invitation"
  | "TenantRole"
  | "TenantPermission"
  | "Department"
  | "Location"
  | "CostCenter"
  | "Team"
  | "MyAccount"
  | "Incident"
  | "IncidentComment"
  | "IncidentCategory"
  | "IncidentPriority"
  | "ResolutionCode"
  | "MajorIncident"
  | "Problem"
  | "ProblemComment"
  | "ProblemCategory"
  | "RootCauseCategory"
  | "KnownError"
  | "Change"
  | "ChangeComment"
  | "ChangeType"
  | "ChangeTemplate"
  | "ChangeWindow"
  | "ServiceRequest"
  | "ServiceRequestComment"
  | "CatalogCategory"
  | "CatalogItem"
  | "CatalogItemVersion"
  | "KnowledgeCategory"
  | "KnowledgeArticle"
  | "KnowledgeComment"
  | "KnowledgeSettings"
  | "SlaPolicy"
  | "EscalationRule"
  | "BusinessCalendar"
  | "Workflow"
  | "WorkflowVersion"
  | "WorkflowRun"
  | "AutomationRule"
  | "AutomationRun"
  | "ApprovalPolicy"
  | "ApprovalRequest"
  | "CiItem"
  | "CiRelationship"
  | "Asset"
  | "AssetMaintenance"
  | "AssetModel"
  | "AssetLicense"
  | "DiscoveryRun"
  | "DiscoveryResult"
  | "OnCallSchedule"
  | "OnCallShift"
  | "Release"
  | "Vendor"
  | "Announcement"
  | "NotificationTemplate"
  | "NotificationRule"
  | "NotificationLog"
  | "AccessPolicy"
  | "Delegation"
  | "AccessReview"
  | "AuditEvent"
  | "SecurityEvent"
  | "SecuritySession"
  | "SupportTicket"
  | "ReportCatalog"
  | "ReportRun"
  | "ExportJob"
  | "ImportJob"
  | "Setting"
  | "CustomField"
  | "PortalConfig"
  | "ServiceDeskQueue"
  | "OperatingHours"
  | "RoutingRule"
  | "Integration"
  | "ApiKey"
  | "Webhook"
  | "WebhookDelivery"
  | "Attachment"
  | "Customer"
  | "CustomerContact"
  | "CustomerSite"
  | "SlaInstance"
  | "SlaClockEvent";

/**
 * RTK Query API for the tenant (Organization Admin) surface.
 *
 * Everything under `/tenant-admin/*` and the tenant-scoped `/itsm/*` surface
 * is injected here module-by-module.
 */
export const tenantadminApi = createApi({
  reducerPath: "tenantadminApi",
  baseQuery: baseQueryWithAuth,
  keepUnusedDataFor: 300,
  refetchOnMountOrArgChange: false,
  refetchOnFocus: false,
  refetchOnReconnect: false,
  tagTypes: [
    "Organization",
    "OrganizationBranding",
    "OrganizationLocalization",
    "OrganizationBusinessHours",
    "OrganizationStructure",
    "TenantUser",
    "Invitation",
    "TenantRole",
    "TenantPermission",
    "Department",
    "Location",
    "CostCenter",
    "Team",
    "MyAccount",
    "Incident",
    "IncidentComment",
    "IncidentCategory",
    "IncidentPriority",
    "ResolutionCode",
    "MajorIncident",
    "Problem",
    "ProblemComment",
    "ProblemCategory",
    "RootCauseCategory",
    "KnownError",
    "Change",
    "ChangeComment",
    "ChangeType",
    "ChangeTemplate",
    "ChangeWindow",
    "ServiceRequest",
    "ServiceRequestComment",
    "CatalogCategory",
    "CatalogItem",
    "CatalogItemVersion",
    "KnowledgeCategory",
    "KnowledgeArticle",
    "KnowledgeComment",
    "KnowledgeSettings",
    "SlaPolicy",
    "EscalationRule",
    "BusinessCalendar",
    "Workflow",
    "WorkflowVersion",
    "WorkflowRun",
    "AutomationRule",
    "AutomationRun",
    "ApprovalPolicy",
    "ApprovalRequest",
    "CiItem",
    "CiRelationship",
    "Asset",
    "AssetMaintenance",
    "AssetModel",
    "AssetLicense",
    "DiscoveryRun",
    "DiscoveryResult",
    "OnCallSchedule",
    "OnCallShift",
    "Release",
    "Vendor",
    "Announcement",
    "NotificationTemplate",
    "NotificationRule",
    "NotificationLog",
    "AccessPolicy",
    "Delegation",
    "AccessReview",
    "AuditEvent",
    "SecurityEvent",
    "SecuritySession",
    "SupportTicket",
    "ReportCatalog",
    "ReportRun",
    "ExportJob",
    "ImportJob",
    "Setting",
    "CustomField",
    "PortalConfig",
    "ServiceDeskQueue",
    "OperatingHours",
    "RoutingRule",
    "Integration",
    "ApiKey",
    "Webhook",
    "WebhookDelivery",
    "Attachment",
    "Customer",
    "CustomerContact",
    "CustomerSite",
    "SlaInstance",
    "SlaClockEvent",
  ],
  endpoints: () => ({}),
});

export type TenantAdminApi = typeof tenantadminApi;
