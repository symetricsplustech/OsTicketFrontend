import type { ScreenDefinition, ScreenKind } from "@features/itsm-core/models/screen";

export type TranslationRoute = ScreenDefinition & { group: string };
type Module = { key: string; title: string; screens: readonly (readonly [string, ScreenKind])[] };
const modules: readonly Module[] = [
  { key: "translation", title: "Translation", screens: [["Translation", "workspace"], ["Translation Record", "record"], ["Translation Jobs", "list"], ["Untranslated Strings", "list"]] },
  { key: "dynamic-translation", title: "Dynamic Translation", screens: [["Dynamic Translation", "workspace"], ["Live Translation", "record"], ["Translation Memory", "list"], ["Translation Providers", "settings"]] },
  { key: "localization", title: "Localization", screens: [["Localization", "workspace"], ["Locales", "list"], ["Locale Record", "record"], ["Regional Formats", "settings"]] },
] as const;
const slug = (value: string) => value.toLowerCase().replace(/&/g, "and").replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "");
export const translationRoutes: TranslationRoute[] = modules.flatMap((module, moduleIndex) =>
  module.screens.map(([title, kind], screenIndex) => ({
    id: 390000 + (moduleIndex + 1) * 100 + screenIndex + 1,
    title,
    path: `/instances/:instanceId/workspace/translations/${module.key}/${slug(title)}`,
    group: `Phase 39 · ${module.title}`,
    phase: 39,
    kind,
    area: module.title,
    module: module.key,
    screenId: `39.${moduleIndex + 1}.${screenIndex + 1}`,
    description: `${title} with governed operations and audit.`,
  })),
);
export const translationHomePath = translationRoutes[0].path;
