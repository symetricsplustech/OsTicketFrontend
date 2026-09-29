import type { ScreenDefinition, ScreenKind } from "@features/itsm-core/models/screen";

export type IntegrationRoute = ScreenDefinition & { group: string };
type Module = { key: string; title: string; screens: readonly (readonly [string, ScreenKind])[] };
const modules: readonly Module[] = [
  { key: "home", title: "Integrations", screens: [["Integration Home", "dashboard"]] },
  { key: "connections", title: "Connections", screens: [["Connections", "list"], ["Connection Record", "record"], ["Connection Test", "settings"], ["Connection History", "report"]] },
  { key: "service-graph", title: "Service Graph Connectors", screens: [["Service Graph Connectors", "list"], ["Connector Catalog", "list"], ["Connector Record", "record"], ["Graph Sync Status", "dashboard"]] },
  { key: "data-fabric", title: "Data Fabric", screens: [["Workflow Data Fabric", "workspace"], ["Data Pipelines", "list"], ["Pipeline Record", "record"], ["Fabric Jobs", "list"]] },
  { key: "webhooks", title: "Webhooks", screens: [["Webhooks", "list"], ["Webhook Record", "record"], ["Webhook Deliveries", "list"], ["Webhook Secrets", "settings"]] },
  { key: "import", title: "Import", screens: [["Import", "workspace"], ["Import Jobs", "list"], ["Import History", "list"], ["Import Templates", "settings"]] },
] as const;
const slug = (value: string) => value.toLowerCase().replace(/&/g, "and").replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "");
export const integrationRoutes: IntegrationRoute[] = modules.flatMap((module, moduleIndex) =>
  module.screens.map(([title, kind], screenIndex) => ({
    id: 370000 + (moduleIndex + 1) * 100 + screenIndex + 1,
    title,
    path: `/instances/:instanceId/workspace/integrations/${module.key}/${slug(title)}`,
    group: `Phase 37 · ${module.title}`,
    phase: 37,
    kind,
    area: module.title,
    module: module.key,
    screenId: `37.${moduleIndex + 1}.${screenIndex + 1}`,
    description: `${title} with governed operations and audit.`,
  })),
);
export const integrationHomePath = integrationRoutes[0].path;
