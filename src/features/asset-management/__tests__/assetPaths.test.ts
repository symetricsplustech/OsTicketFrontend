import { describe, expect, it } from "vitest";
import {
  ASSET_ROOT,
  CRUD_RESOURCES,
  assetPath,
  assignmentActionPath,
  assignmentPath,
  auditActionPath,
  auditExceptionPath,
  auditExceptionsPath,
  auditPath,
  auditResultsPath,
  auditScanPath,
  auditTaskPath,
  auditTasksPath,
  costActionPath,
  costAllocationsPath,
  costPath,
  costReportPath,
  inventoryOverviewPath,
  isCrudResource,
  lifecycleMovePath,
  lifecyclePath,
  lifecycleStatesPath,
  stockroomBalancePath,
  stockroomConfigurationPath,
  stockroomInventoryPath,
  transferActionPath,
  transferLinePath,
  transferLinesPath,
  transferPath,
} from "@features/asset-management/api/assetPaths";

/**
 * These mirror the router in osTicketBackend/src/routes/core/assetManagement.js,
 * which is mounted at /api/v1/core/assets. A change on either side has to be
 * made here too, which is exactly what these assertions are for.
 */
const ID = "11111111-1111-4111-8111-111111111111";
const OTHER = "22222222-2222-4222-8222-222222222222";

describe("Phase 15 asset management URL builders", () => {
  it("roots every path at the /core/assets router", () => {
    expect(ASSET_ROOT).toBe("/core/assets");
    expect(assetPath("models")).toBe("/core/assets/models");
  });

  it("builds collection and row URLs for every CRUD resource", () => {
    const expected = [
      "model-categories",
      "models",
      "stockrooms",
      "inventory",
      "inventory/exceptions",
      "transfers",
      "assignments",
      "audits",
      "audit-exceptions",
      "costs",
      "cost-centers",
      "config/states",
      "config/substates",
      "config/properties",
    ];
    expect([...CRUD_RESOURCES].sort()).toEqual([...expected].sort());
    for (const resource of expected) {
      expect(assetPath(resource)).toBe(`/core/assets/${resource}`);
      expect(assetPath(resource, ID)).toBe(`/core/assets/${resource}/${ID}`);
      expect(isCrudResource(resource)).toBe(true);
    }
    expect(isCrudResource("audit-exceptions")).toBe(true);
    expect(isCrudResource("lifecycle")).toBe(false);
    expect(isCrudResource("not-a-resource")).toBe(false);
  });

  it("builds inventory URLs, with the overview before the id routes", () => {
    expect(stockroomInventoryPath(ID)).toBe(`/core/assets/stockrooms/${ID}/inventory`);
    expect(stockroomBalancePath(ID, OTHER)).toBe(
      `/core/assets/stockrooms/${ID}/inventory/${OTHER}`,
    );
    expect(inventoryOverviewPath()).toBe("/core/assets/inventory/overview");
  });

  it("builds transfer, line and transition URLs", () => {
    expect(transferPath()).toBe("/core/assets/transfers");
    expect(transferPath(ID)).toBe(`/core/assets/transfers/${ID}`);
    expect(transferLinesPath(ID)).toBe(`/core/assets/transfers/${ID}/lines`);
    expect(transferLinePath(ID, OTHER)).toBe(`/core/assets/transfers/${ID}/lines/${OTHER}`);
    for (const action of ["request", "ship", "receive", "cancel"] as const) {
      expect(transferActionPath(ID, action)).toBe(`/core/assets/transfers/${ID}/${action}`);
    }
  });

  it("builds assignment URLs, keeping the lifecycle move separate", () => {
    expect(assignmentPath()).toBe("/core/assets/assignments");
    expect(assignmentActionPath(ID, "return")).toBe(`/core/assets/assignments/${ID}/return`);
    expect(assignmentActionPath(ID, "swap")).toBe(`/core/assets/assignments/${ID}/swap`);
    expect(lifecyclePath()).toBe("/core/assets/lifecycle");
    expect(lifecycleMovePath(ID)).toBe(`/core/assets/lifecycle/${ID}/move`);
  });

  it("builds audit, task, result and exception URLs", () => {
    expect(auditPath()).toBe("/core/assets/audits");
    expect(auditPath(ID)).toBe(`/core/assets/audits/${ID}`);
    for (const action of ["start", "complete", "cancel"] as const) {
      expect(auditActionPath(ID, action)).toBe(`/core/assets/audits/${ID}/${action}`);
    }
    expect(auditTasksPath(ID)).toBe(`/core/assets/audits/${ID}/tasks`);
    expect(auditTaskPath(ID, OTHER)).toBe(`/core/assets/audits/${ID}/tasks/${OTHER}`);
    expect(auditResultsPath(ID)).toBe(`/core/assets/audits/${ID}/results`);
    expect(auditScanPath(ID)).toBe(`/core/assets/audits/${ID}/scan`);
    expect(auditExceptionsPath()).toBe("/core/assets/audit-exceptions");
    expect(auditExceptionPath(ID)).toBe(`/core/assets/audit-exceptions/${ID}`);
  });

  it("builds cost URLs with the report ahead of the row routes", () => {
    expect(costPath()).toBe("/core/assets/costs");
    expect(costPath(ID)).toBe(`/core/assets/costs/${ID}`);
    expect(costActionPath(ID, "approve")).toBe(`/core/assets/costs/${ID}/approve`);
    expect(costActionPath(ID, "pay")).toBe(`/core/assets/costs/${ID}/pay`);
    expect(costAllocationsPath(ID)).toBe(`/core/assets/costs/${ID}/allocations`);
    expect(costReportPath()).toBe("/core/assets/costs/report");
  });

  it("builds configuration URLs", () => {
    expect(stockroomConfigurationPath(ID)).toBe(`/core/assets/config/stockrooms/${ID}`);
    expect(lifecycleStatesPath()).toBe("/core/assets/config/lifecycle-states");
  });
});
