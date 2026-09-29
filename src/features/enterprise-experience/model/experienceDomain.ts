import type { ScreenDefinition } from "@features/itsm-core/models/screen";

export type ExperienceDomain = "improvement" | "service-operations" | "employee-center" | "conversational-service" | "intelligent-automation" | "workforce" | "vendor" | "experience-feedback" | "benchmarks" | "performance-analytics";

const domains: Record<number, ExperienceDomain> = {
  21: "improvement",
  22: "service-operations",
  23: "employee-center",
  24: "conversational-service",
  25: "intelligent-automation",
  26: "workforce",
  27: "vendor",
  28: "experience-feedback",
  29: "benchmarks",
  30: "performance-analytics",
};

export const experienceDomain = (screen: ScreenDefinition): ExperienceDomain => (screen.phase === undefined ? undefined : domains[screen.phase]) ?? "service-operations";
export const experienceResource = (screen: ScreenDefinition): string => screen.module || "records";
