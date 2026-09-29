import type { ScreenDefinition, ScreenKind } from "@features/itsm-core/models/screen";

export type ConfigurationManagementRoute = ScreenDefinition & { group: string };
type Module = { key: string; title: string; screens: readonly (readonly [string, ScreenKind])[] };
const modules: readonly Module[] = [
  { key: "home", title: "CMDB Home", screens: [["CMDB Home", "dashboard"], ["CMDB Dashboard", "dashboard"], ["CI Search", "list"]] },
  { key: "cis", title: "Configuration Items", screens: [["All CIs", "list"], ["Create CI", "settings"], ["CI Record", "record"], ["CI Overview", "record"], ["CI Identification", "record"], ["CI Classification", "record"], ["CI Ownership", "record"], ["CI Support", "record"], ["CI Location", "record"], ["CI Lifecycle", "record"], ["CI History", "record"]] },
  { key: "classes", title: "Class Management", screens: [["CI Classes", "list"], ["Class Hierarchy", "list"], ["Create CI Class", "settings"], ["CI Class Record", "record"], ["Class Attributes", "record"], ["Class Rules", "record"]] },
  { key: "relationships", title: "Relationships", screens: [["CI Relationships", "list"], ["Relationship Editor", "settings"], ["Upstream", "record"], ["Downstream", "record"], ["Dependency View", "dashboard"], ["Relationship Types", "record"]] },
  { key: "health", title: "Health", screens: [["CMDB Health", "dashboard"], ["Completeness", "dashboard"], ["Correctness", "dashboard"], ["Compliance", "dashboard"], ["Health Details", "record"]] },
  { key: "duplicates", title: "Duplicates", screens: [["Duplicate CIs", "list"], ["Duplicate Cluster", "record"], ["Duplicate Resolution", "record"], ["Merge Review", "record"]] },
  { key: "identification", title: "Identification", screens: [["Identification Rules", "list"], ["Create Identification Rule", "settings"], ["Identification Rule Record", "record"], ["Identification Simulation", "record"]] },
  { key: "reconciliation", title: "Reconciliation", screens: [["Reconciliation Rules", "list"], ["Create Reconciliation Rule", "settings"], ["Reconciliation Rule Record", "record"], ["Reconciliation Results", "report"]] },
  { key: "data-sources", title: "Data Sources", screens: [["CMDB Data Sources", "list"], ["Data Source Record", "record"], ["Import Results", "report"], ["Source History", "record"]] },
  { key: "certification", title: "Certification", screens: [["CI Certification", "list"], ["Certification Campaign", "record"], ["Certification Task", "record"], ["Certification Results", "report"]] },
  { key: "lifecycle", title: "Lifecycle", screens: [["Planned CIs", "list"], ["Operational CIs", "list"], ["Maintenance CIs", "list"], ["Retired CIs", "list"], ["Archived CIs", "list"]] },
  { key: "configuration", title: "Configuration", screens: [["CI Statuses", "record"], ["Relationship Types", "record"], ["CMDB Properties", "record"], ["CMDB Audit", "record"]] },
] as const;
const slug = (value: string) => value.toLowerCase().replace(/&/g, "and").replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "");
export const configurationManagementRoutes: ConfigurationManagementRoute[] = modules.flatMap((module, moduleIndex) =>
  module.screens.map(([title, kind], screenIndex) => ({
    id: 130000 + (moduleIndex + 1) * 100 + screenIndex + 1,
    title,
    path: `/instances/:instanceId/workspace/cmdb/${module.key}/${slug(title)}`,
    group: `Phase 13 · ${module.title}`,
    phase: 13,
    kind,
    area: module.title,
    module: module.key,
    screenId: `13.${moduleIndex + 1}.${screenIndex + 1}`,
    description: `${title} with governed operations and audit.`,
  })),
);
export const configurationManagementHomePath = configurationManagementRoutes[0].path;
