import type { ScreenDefinition, ScreenKind } from "@features/itsm-core/models/screen";

export type DigitalPortfolioRoute = ScreenDefinition & { group: string };
type Module = { key: string; title: string; screens: readonly (readonly [string, ScreenKind])[] };
const modules: readonly Module[] = [
  { key: "portfolio", title: "Portfolio", screens: [["Digital Portfolio", "dashboard"], ["Portfolio Record", "record"], ["Portfolio Hierarchy", "record"], ["Portfolio Metrics", "record"], ["Portfolio Audit", "record"]] },
  { key: "portfolio-items", title: "Portfolio Items", screens: [["Portfolio Items", "list"], ["Create Portfolio Item", "settings"], ["Portfolio Item Record", "record"], ["Item Lifecycle", "record"], ["Item Dependencies", "record"]] },
  { key: "investment", title: "Investment", screens: [["Investments", "list"], ["Create Investment", "settings"], ["Investment Record", "record"], ["Funding Requests", "list"], ["Investment Pipeline", "dashboard"]] },
  { key: "health", title: "Health", screens: [["Portfolio Health", "dashboard"], ["Health Indicators", "list"], ["Health Record", "record"], ["Health Trends", "report"], ["Health Audit", "record"]] },
  { key: "roadmap-view", title: "Roadmap View", screens: [["Roadmap", "dashboard"], ["Roadmap Timeline", "dashboard"], ["Roadmap Milestones", "list"], ["Roadmap Record", "record"], ["Roadmap Audit", "record"]] },
  { key: "service-owner", title: "Service Owner", screens: [["Service Owners", "list"], ["Service Owner Record", "record"], ["Ownership Assignments", "record"], ["Owner Directory", "list"], ["Owner Audit", "record"]] },
  { key: "configuration", title: "Configuration", screens: [["Portfolio Settings", "settings"], ["Investment Rules", "list"], ["Health Rules", "record"], ["Portfolio Properties", "settings"]] },
] as const;

const slug = (value: string) => value.toLowerCase().replace(/&/g, "and").replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "");

export const digitalPortfolioRoutes: DigitalPortfolioRoute[] = modules.flatMap((module, moduleIndex) =>
  module.screens.map(([title, kind], screenIndex) => ({
    id: 190000 + (moduleIndex + 1) * 100 + screenIndex + 1,
    title,
    path: `/instances/:instanceId/workspace/portfolios/${module.key}/${slug(title)}`,
    group: `Phase 19 · ${module.title}`,
    phase: 19,
    kind,
    area: module.title,
    module: module.key,
    screenId: `19.${moduleIndex + 1}.${screenIndex + 1}`,
    description: `${title} with governed operations and audit.`,
  })),
);

export const digitalPortfolioHomePath = digitalPortfolioRoutes[0].path;
