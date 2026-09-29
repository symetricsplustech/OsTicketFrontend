import type { ScreenDefinition, ScreenKind } from "@features/itsm-core/models/screen";

export type EmployeeCenterRoute = ScreenDefinition & { group: string };
type Module = { key: string; title: string; screens: readonly (readonly [string, ScreenKind])[] };
const modules: readonly Module[] = [
  { key: "home", title: "Home", screens: [["Employee Center Home", "dashboard"], ["Search", "dashboard"], ["Quick Actions", "dashboard"], ["Announcements", "list"], ["Recommended Content", "list"], ["Open Work", "list"]] },
  { key: "get-help", title: "Get Help", screens: [["Get Help", "dashboard"], ["Submit Issue", "settings"], ["Submit Request", "settings"], ["Universal Request", "settings"]] },
  { key: "catalog", title: "Catalog", screens: [["Self-Service Catalog", "list"], ["Category", "list"], ["Item", "record"], ["Cart", "record"], ["Checkout", "settings"], ["Confirmation", "record"]] },
  { key: "knowledge", title: "Knowledge", screens: [["Self-Service Knowledge", "list"], ["Knowledge Search", "list"], ["Article Detail", "record"]] },
  { key: "my-items", title: "My Items", screens: [["My Requests", "list"], ["Request Detail", "record"], ["My Incidents", "list"], ["Incident Detail", "record"], ["Universal Requests", "list"], ["Universal Request Detail", "record"], ["My Approvals", "list"]] },
  { key: "service-status", title: "Service Status", screens: [["Service Status", "dashboard"], ["Service Detail", "record"], ["Planned Maintenance", "list"]] },
  { key: "appointments", title: "Appointments", screens: [["Walk-Up Locations", "list"], ["Book Appointment", "settings"], ["My Appointments", "list"], ["Appointment Detail", "record"]] },
  { key: "profile", title: "Profile", screens: [["Profile", "record"], ["Notification Preferences", "settings"], ["Subscriptions", "list"], ["Accessibility Preferences", "settings"]] },
  { key: "configuration", title: "Employee Center Configuration", screens: [["Portal Configuration", "settings"], ["Taxonomy", "list"], ["Topics", "list"], ["Homepage Configuration", "settings"], ["Content Configuration", "settings"], ["Audience", "list"]] },
] as const;
const slug = (value: string) => value.toLowerCase().replace(/&/g, "and").replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "");
export const employeeCenterRoutes: EmployeeCenterRoute[] = modules.flatMap((module, moduleIndex) =>
  module.screens.map(([title, kind], screenIndex) => ({
    id: 230000 + (moduleIndex + 1) * 100 + screenIndex + 1,
    title,
    path: `/instances/:instanceId/workspace/employee-center/${module.key}/${slug(title)}`,
    group: `Phase 23 · ${module.title}`,
    phase: 23,
    kind,
    area: module.title,
    module: module.key,
    screenId: `23.${moduleIndex + 1}.${screenIndex + 1}`,
    description: `${title} with governed employee self-service, catalog, knowledge, items, service status, appointments, profile, and audit operations.`,
  })),
);
export const employeeCenterHomePath = employeeCenterRoutes[0].path;
