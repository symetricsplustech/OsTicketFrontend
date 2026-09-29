import type { ScreenDefinition, ScreenKind } from "@features/itsm-core/models/screen";

export type BenchmarkManagementRoute = ScreenDefinition & { group: string };

type Module = { key: string; title: string; screens: readonly (readonly [string, ScreenKind])[] };

const modules: readonly Module[] = [
  { key: "benchmarks", title: "Benchmarks", screens: [["Benchmarks Home", "dashboard"], ["Benchmark KPIs", "list"], ["Benchmark Detail", "record"], ["Peer Comparison", "list"], ["Trend Comparison", "list"]] },
  { key: "gap-analysis", title: "Gap Analysis", screens: [["Benchmark Gaps", "list"], ["Gap Detail", "record"], ["Create Improvement from Gap", "settings"]] },
  { key: "configuration", title: "Configuration", screens: [["Benchmark Settings", "settings"], ["Comparison Cohort", "list"], ["Metric Mapping", "settings"]] },
] as const;

const slug = (value: string) => value.toLowerCase().replace(/&/g, "and").replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "");

export const benchmarkManagementRoutes: BenchmarkManagementRoute[] = modules.flatMap((module, moduleIndex) =>
  module.screens.map(([title, kind], screenIndex) => ({
    id: 290000 + (moduleIndex + 1) * 100 + screenIndex + 1,
    title,
    path: `/instances/:instanceId/workspace/benchmarks/${module.key}/${slug(title)}`,
    group: `Phase 29 · ${module.title}`,
    phase: 29,
    kind,
    area: module.title,
    module: module.key,
    screenId: `29.${moduleIndex + 1}.${screenIndex + 1}`,
    description: `${title} with governed benchmarking, gap analysis, and audit operations.`,
  })),
);

export const benchmarkManagementHomePath = benchmarkManagementRoutes[0].path;
