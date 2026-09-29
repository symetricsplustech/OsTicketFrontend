import type { ScreenDefinition, ScreenKind } from "@features/itsm-core/models/screen";

export type PlatformAdministrationRoute = ScreenDefinition & { group: string };

type ScreenSeed = readonly [title: string, kind: ScreenKind];
type ModuleSeed = { key: string; title: string; screens: readonly ScreenSeed[] };

const modules: readonly ModuleSeed[] = [
  { key: "instance", title: "Tenant & Instance", screens: [["Instance Home", "dashboard"], ["Instance Profile", "record"], ["Instance Settings", "settings"], ["Branding", "settings"], ["Locale & Time Zone", "settings"], ["Feature Entitlements", "list"], ["Module Activation", "list"], ["Instance Health", "dashboard"], ["Instance Audit", "report"]] },
  { key: "identity", title: "Identity", screens: [["Sign In", "settings"], ["SSO Sign In", "settings"], ["MFA Challenge", "settings"], ["Password Recovery", "settings"], ["Invitation Acceptance", "settings"], ["Account Recovery", "settings"], ["Session Expired", "settings"], ["Active Sessions", "list"]] },
  { key: "organization", title: "Organization", screens: [["Organization Home", "dashboard"], ["Companies", "list"], ["Company Record", "record"], ["Business Units", "list"], ["Business Unit Record", "record"], ["Departments", "list"], ["Department Record", "record"], ["Locations", "list"], ["Location Record", "record"], ["Organization Hierarchy", "dashboard"]] },
  { key: "users", title: "Users", screens: [["User Directory", "list"], ["Create User", "settings"], ["Invite User", "settings"], ["Bulk Invite", "settings"], ["User Record", "record"], ["User Access", "record"], ["User Sessions", "list"], ["User Workload", "dashboard"], ["Transfer User", "settings"], ["Suspend User", "settings"], ["Reactivate User", "settings"], ["Offboard User", "settings"]] },
  { key: "groups", title: "Groups", screens: [["Groups", "list"], ["Create Group", "settings"], ["Group Record", "record"], ["Group Members", "list"], ["Group Roles", "list"], ["Group Services", "list"], ["Group Schedule", "settings"], ["Group Audit", "report"]] },
  { key: "assignment-groups", title: "Assignment Groups", screens: [["Assignment Groups", "list"], ["Assignment Group Record", "record"], ["Members", "list"], ["Manager", "settings"], ["Skills", "list"], ["Supported Services", "list"], ["Queue", "list"], ["Capacity", "dashboard"], ["Schedule", "settings"]] },
  { key: "roles", title: "Roles & Permissions", screens: [["Roles", "list"], ["Create Role", "settings"], ["Role Record", "record"], ["Permission Catalog", "list"], ["Role Permissions", "list"], ["Role Members", "list"], ["Role Inheritance", "dashboard"], ["Field Permissions", "list"], ["Record Conditions", "list"], ["Effective Access", "record"], ["Access Simulator", "settings"], ["Role Comparison", "report"]] },
  { key: "delegation", title: "Delegation", screens: [["Delegations", "list"], ["Create Delegation", "settings"], ["Delegation Record", "record"], ["Temporary Access", "settings"], ["Approval Delegation", "settings"], ["Delegation History", "report"]] },
  { key: "preferences", title: "System Preferences", screens: [["User Preferences", "settings"], ["Date & Time Preferences", "settings"], ["Accessibility Preferences", "settings"], ["Notification Preferences", "settings"], ["List Preferences", "settings"], ["Workspace Preferences", "settings"]] },
  { key: "audit", title: "Audit", screens: [["Audit Home", "dashboard"], ["Record Audit", "report"], ["User Audit", "report"], ["Access Audit", "report"], ["Configuration Audit", "report"], ["Export Audit", "report"], ["Login Audit", "report"], ["AI Audit", "report"]] },
] as const;

const slug = (value: string) => value.toLowerCase().replace(/&/g, "and").replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "");

export const platformAdministrationRoutes: PlatformAdministrationRoute[] = modules.flatMap((module, moduleIndex) =>
  module.screens.map(([title, kind], screenIndex) => ({
    id: (moduleIndex + 1) * 100 + screenIndex + 1,
    title,
    path: `/instances/:instanceId/admin/${module.key}/${slug(title)}`,
    group: `Phase 00 · ${module.title}`,
    phase: 0,
    kind,
    area: module.title,
    module: module.key,
    screenId: `00.${moduleIndex + 1}.${screenIndex + 1}`,
    description: `${title} administration with governed actions, direct links, validation, permission-aware controls, and audit history.`,
  })),
);

export const platformAdministrationHomePath = platformAdministrationRoutes[0].path;
