import type { ResourceListConfig, ConfigPanelConfig } from "@/screens/saas-admin/components/resource/types";
import { usersConfigs } from "./users";
import { dashboardConfigs } from "./dashboard";
import { myAccountConfigs, myAccountPanelConfigs } from "./myAccount";
import { orgSettingsConfigs, orgSettingsPanelConfigs } from "./orgSettings";
import { knowledgeConfigs, knowledgePanelConfigs } from "./knowledge";
import { helpSupportConfigs } from "./helpSupport";
import { rolesConfigs } from "./roles";
import { customersConfigs } from "./customers";
import { structureConfigs } from "./structure";
import { serviceDeskConfigs } from "./serviceDesk";
import { incidentsConfigs } from "./incidents";
import { problemsConfigs } from "./problems";
import { changesConfigs } from "./changes";
import { catalogConfigs } from "./catalog";
import { slaConfigs } from "./sla";
import { workflowsConfigs } from "./workflows";
import { cmdbConfigs } from "./cmdb";
import { operationsConfigs } from "./operations";
import { notificationsConfigs } from "./notifications";
import { reportsConfigs } from "./reports";
import { securityConfigs } from "./security";
import { settingsConfigs } from "./settings";

export const TENANT_RESOURCE_LISTS: ResourceListConfig[] = [
  ...dashboardConfigs,
  ...myAccountConfigs,
  ...orgSettingsConfigs,
  ...helpSupportConfigs,
  ...usersConfigs,
  ...rolesConfigs,
  ...customersConfigs,
  ...structureConfigs,
  ...serviceDeskConfigs,
  ...incidentsConfigs,
  ...problemsConfigs,
  ...changesConfigs,
  ...catalogConfigs,
  ...knowledgeConfigs,
  ...slaConfigs,
  ...workflowsConfigs,
  ...cmdbConfigs,
  ...operationsConfigs,
  ...notificationsConfigs,
  ...reportsConfigs,
  ...securityConfigs,
  ...settingsConfigs,
];

export const TENANT_RESOURCE_PANELS: ConfigPanelConfig[] = [
  ...orgSettingsPanelConfigs,
  ...knowledgePanelConfigs,
  ...myAccountPanelConfigs,
];
