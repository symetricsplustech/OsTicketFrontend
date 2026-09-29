import type { CatalogResource } from "@features/catalog-management/api/catalogApi";
import type { KnowledgeResource } from "@features/knowledge-management/api/knowledgeApi";
import type { RequestResource } from "@features/request-management/api/requestApi";
import type { ServiceLevelResource } from "@features/service-level-management/api/serviceLevelApi";
import type { ScreenDefinition } from "../models/screen";
import type { WorkDomain } from "../model/workRecord";

export type WorkRecordResource =
  | { domain: "interaction" }
  | { domain: "incident" }
  | { domain: "major" }
  | { domain: "problem" }
  | { domain: "change" }
  | { domain: "request"; resource: RequestResource }
  | { domain: "universal-request" }
  | { domain: "catalog"; resource: CatalogResource }
  | { domain: "knowledge"; resource: KnowledgeResource }
  | { domain: "sla"; resource: ServiceLevelResource };

export function domainForScreen(screen: ScreenDefinition): WorkDomain {
  if (screen.phase === 1) return "interaction";
  if (screen.phase === 2) return "incident";
  if (screen.phase === 3) return "major";
  if (screen.phase === 4) return "problem";
  if (screen.phase === 5) return "change";
  if (screen.phase === 6) return "request";
  if (screen.phase === 8) return "universal-request";
  if (screen.phase === 7) return "catalog";
  if (screen.phase === 9) return "knowledge";
  return "sla";
}

export function resourceForScreen(screen: ScreenDefinition, domain = domainForScreen(screen)): WorkRecordResource {
  if (domain === "interaction" || domain === "incident" || domain === "major" || domain === "problem" || domain === "change" || domain === "universal-request") return { domain };
  if (domain === "request") return { domain, resource: screen.module === "requested-items" ? "ritms" : screen.module === "catalog-tasks" ? "tasks" : "reqs" };
  if (domain === "catalog") return { domain, resource: screen.module === "catalogs" ? "catalogs" : screen.module === "categories" ? "categories" : screen.module === "variable-sets" ? "variable-sets" : screen.module === "fulfillment" ? "fulfillment-plans" : "items" };
  if (domain === "knowledge") return { domain, resource: screen.module === "bases" ? "bases" : screen.module === "categories" ? "categories" : screen.module === "lifecycle" && screen.title.includes("Approval") ? "approvals" : "articles" };
  return { domain: "sla", resource: screen.module === "ola-definitions" ? "olas" : screen.module === "schedules" ? "schedules" : screen.module === "calendars" ? "calendars" : screen.module === "task-sla" ? "events" : "plans" };
}
