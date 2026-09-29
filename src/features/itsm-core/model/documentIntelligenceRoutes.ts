import type { ScreenDefinition, ScreenKind } from "@features/itsm-core/models/screen";

export type DocumentIntelligenceRoute = ScreenDefinition & { group: string };
type Module = { key: string; title: string; screens: readonly (readonly [string, ScreenKind])[] };
const modules: readonly Module[] = [
  { key: "attachments", title: "Attachments", screens: [["Attachments", "list"], ["Attachment Record", "record"], ["Attachment Preview", "record"], ["Bulk Attachments", "settings"]] },
  { key: "intake", title: "Document Intake", screens: [["Document Intake", "workspace"], ["Intake Queues", "list"], ["Scanned Documents", "list"], ["Email Attachments", "list"]] },
  { key: "configuration", title: "Document Configuration", screens: [["Document Configuration", "settings"], ["OCR Settings", "settings"], ["Storage Policies", "settings"], ["Retention Rules", "settings"]] },
] as const;
const slug = (value: string) => value.toLowerCase().replace(/&/g, "and").replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "");
export const documentIntelligenceRoutes: DocumentIntelligenceRoute[] = modules.flatMap((module, moduleIndex) =>
  module.screens.map(([title, kind], screenIndex) => ({
    id: 380000 + (moduleIndex + 1) * 100 + screenIndex + 1,
    title,
    path: `/instances/:instanceId/workspace/documents/${module.key}/${slug(title)}`,
    group: `Phase 38 · ${module.title}`,
    phase: 38,
    kind,
    area: module.title,
    module: module.key,
    screenId: `38.${moduleIndex + 1}.${screenIndex + 1}`,
    description: `${title} with governed operations and audit.`,
  })),
);
export const documentIntelligenceHomePath = documentIntelligenceRoutes[0].path;
