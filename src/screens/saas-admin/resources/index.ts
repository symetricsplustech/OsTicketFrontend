import type { ResourceListConfig, ConfigPanelConfig } from "../components/resource/types";
import { SERVICE_MANAGEMENT_LISTS } from "./serviceManagement";
import { SLA_MANAGEMENT_LISTS } from "./slaManagement";
import { WORKFLOW_MANAGEMENT_LISTS } from "./workflowManagement";
import { ITSM_CONFIGURATION_LISTS, ITSM_CONFIGURATION_PANELS } from "./itsmConfiguration";
import { KNOWLEDGE_MANAGEMENT_LISTS } from "./knowledgeManagement";
import { CMDB_ASSET_MANAGEMENT_LISTS } from "./cmdbAssets";
import { EMAIL_NOTIFICATION_LISTS } from "./emailNotifications";
import { INTEGRATIONS_API_LISTS, INTEGRATIONS_API_PANELS } from "./integrationsApi";
import { SUPPORT_MANAGEMENT_LISTS } from "./supportManagement";
import { REPORTS_ANALYTICS_LISTS } from "./reportsAnalytics";
import { SECURITY_AUDIT_LISTS, SECURITY_AUDIT_EXTRA_LISTS, SECURITY_AUDIT_PANELS } from "./securityAudit";
import { SYSTEM_ADMINISTRATION_LISTS } from "./systemAdministration";
import { PLATFORM_SETTINGS_LISTS, PLATFORM_SETTINGS_PANELS } from "./platformSettings";
import { MY_ACCOUNT_LISTS, MY_ACCOUNT_PANELS } from "./myAccount";
import { APPROVAL_MANAGEMENT_LISTS } from "./approvals";

export const RESOURCE_LISTS: ResourceListConfig[] = [
  ...SERVICE_MANAGEMENT_LISTS,
  ...SLA_MANAGEMENT_LISTS,
  ...WORKFLOW_MANAGEMENT_LISTS,
  ...ITSM_CONFIGURATION_LISTS,
  ...KNOWLEDGE_MANAGEMENT_LISTS,
  ...CMDB_ASSET_MANAGEMENT_LISTS,
  ...EMAIL_NOTIFICATION_LISTS,
  ...INTEGRATIONS_API_LISTS,
  ...SUPPORT_MANAGEMENT_LISTS,
  ...REPORTS_ANALYTICS_LISTS,
  ...SECURITY_AUDIT_LISTS,
  ...SECURITY_AUDIT_EXTRA_LISTS,
  ...SYSTEM_ADMINISTRATION_LISTS,
  ...PLATFORM_SETTINGS_LISTS,
  ...MY_ACCOUNT_LISTS,
  ...APPROVAL_MANAGEMENT_LISTS,
];

export const RESOURCE_PANELS: ConfigPanelConfig[] = [
  ...ITSM_CONFIGURATION_PANELS,
  ...INTEGRATIONS_API_PANELS,
  ...SECURITY_AUDIT_PANELS,
  ...PLATFORM_SETTINGS_PANELS,
  ...MY_ACCOUNT_PANELS,
];

export const SAAS_ADMIN_BASE = "/saas-admin";

export function relativePath(path: string): string {
  return path.replace(SAAS_ADMIN_BASE, "").replace(/^\/+/, "");
}