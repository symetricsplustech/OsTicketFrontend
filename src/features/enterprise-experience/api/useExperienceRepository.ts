import { useMemo } from "react";
import type { ScreenDefinition } from "@features/itsm-core/models/screen";
import { useImprovementRepository } from "@features/continual-improvement/api/improvementApi";
import { useServiceOperationsRepository } from "@features/service-operations-workspace/api/serviceOperationsApi";
import { useEmployeeCenterRepository } from "@features/employee-center/api/employeeCenterApi";
import { useConversationalServiceRepository } from "@features/conversational-service/api/conversationalServiceApi";
import { useIntelligentAutomationRepository } from "@features/intelligent-automation/api/intelligentAutomationApi";
import { useWorkforceRepository } from "@features/workforce-optimization/api/workforceApi";
import { useVendorRepository } from "@features/vendor-management/api/vendorApi";
import { useExperienceFeedbackRepository } from "@features/experience-feedback/api/experienceFeedbackApi";
import { useBenchmarkRepository } from "@features/benchmark-management/api/benchmarkApi";
import { usePerformanceAnalyticsRepository } from "@features/performance-analytics/api/performanceAnalyticsApi";
import { experienceRows } from "./experienceTypes";
import { experienceDomain, experienceResource } from "../model/experienceDomain";

export function useExperienceRepository(screen: ScreenDefinition) {
  const domain = experienceDomain(screen);
  const resource = experienceResource(screen);
  const improvement = useImprovementRepository(resource, domain !== "improvement");
  const serviceOperations = useServiceOperationsRepository(resource, domain !== "service-operations");
  const employeeCenter = useEmployeeCenterRepository(resource, domain !== "employee-center");
  const conversationalService = useConversationalServiceRepository(resource, domain !== "conversational-service");
  const intelligentAutomation = useIntelligentAutomationRepository(resource, domain !== "intelligent-automation");
  const workforce = useWorkforceRepository(resource, domain !== "workforce");
  const vendor = useVendorRepository(resource, domain !== "vendor");
  const feedback = useExperienceFeedbackRepository(resource, domain !== "experience-feedback");
  const benchmarks = useBenchmarkRepository(resource, domain !== "benchmarks");
  const analytics = usePerformanceAnalyticsRepository(resource, domain !== "performance-analytics");
  const active = domain === "improvement" ? improvement : domain === "service-operations" ? serviceOperations : domain === "employee-center" ? employeeCenter : domain === "conversational-service" ? conversationalService : domain === "intelligent-automation" ? intelligentAutomation : domain === "workforce" ? workforce : domain === "vendor" ? vendor : domain === "experience-feedback" ? feedback : domain === "benchmarks" ? benchmarks : analytics;
  const records = useMemo(() => experienceRows(active.query.data), [active.query.data]);
  return { domain, resource, records, create: active.create, update: active.update, transition: active.transition, remove: active.remove, isLoading: active.query.isLoading, isError: active.query.isError, refetch: active.query.refetch };
}
