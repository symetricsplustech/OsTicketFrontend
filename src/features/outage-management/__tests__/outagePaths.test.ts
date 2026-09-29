import { describe, expect, it } from "vitest";
import {
  OUTAGE_ROOT,
  STATUS_PAGE_ROOT,
  availabilityCalculatePath,
  availabilityRecordsPath,
  communicationCadencePath,
  outageChangeLinkPath,
  outageCiPath,
  outageCommunicationPath,
  outageCommunicationPlanPath,
  outageDashboardPath,
  outageDetailPath,
  outageIncidentLinkPath,
  outageMajorIncidentPath,
  outagePath,
  outageRelationPath,
  outageRelationsPath,
  outageServicePath,
  outageTimelinePath,
  outageTransitionPath,
  serviceAvailabilityPath,
  statusPagePath,
} from "@features/outage-management/api/outagePaths";

describe("Phase 16 outage paths", () => {
  it("roots the two backend mounts separately", () => {
    // Status pages are not a sub-path of the outage router; conflating the two
    // would make every status page request 404.
    expect(OUTAGE_ROOT).toBe("/core/outage");
    expect(STATUS_PAGE_ROOT).toBe("/status-pages");
    expect(STATUS_PAGE_ROOT.startsWith(OUTAGE_ROOT)).toBe(false);
  });

  it("builds outage CRUD and lifecycle paths", () => {
    expect(outagePath("outages")).toBe("/core/outage/outages");
    expect(outagePath("outages", "o1")).toBe("/core/outage/outages/o1");
    expect(outageDetailPath("o1")).toBe("/core/outage/outages/o1/detail");
    expect(outageTransitionPath("o1")).toBe("/core/outage/outages/o1/transition");
    expect(outageDashboardPath()).toBe("/core/outage/dashboard");
  });

  it("builds 16.2 impact child paths with and without a child id", () => {
    expect(outageCiPath("o1")).toBe("/core/outage/outages/o1/cis");
    expect(outageCiPath("o1", "c1")).toBe("/core/outage/outages/o1/cis/c1");
    expect(outageServicePath("o1")).toBe("/core/outage/outages/o1/services");
    expect(outageServicePath("o1", "s1")).toBe("/core/outage/outages/o1/services/s1");
    expect(outageTimelinePath("o1")).toBe("/core/outage/outages/o1/timeline");
  });

  it("builds 16.3 relationship paths", () => {
    expect(outageRelationsPath("o1")).toBe("/core/outage/outages/o1/relations");
    expect(outageRelationPath("o1", "r1")).toBe("/core/outage/outages/o1/relations/r1");
    expect(outageIncidentLinkPath("o1")).toBe("/core/outage/outages/o1/incidents");
    expect(outageMajorIncidentPath("o1")).toBe("/core/outage/outages/o1/major-incident");
    expect(outageChangeLinkPath("o1")).toBe("/core/outage/outages/o1/changes");
  });

  it("builds 16.4 communication and 16.5 availability paths", () => {
    expect(outageCommunicationPlanPath("o1")).toBe("/core/outage/outages/o1/communication-plan");
    expect(outageCommunicationPath("o1")).toBe("/core/outage/outages/o1/communication");
    expect(communicationCadencePath()).toBe("/core/outage/communication-cadence");
    expect(availabilityCalculatePath()).toBe("/core/outage/availability/calculate");
    expect(availabilityRecordsPath()).toBe("/core/outage/availability/records");
    expect(serviceAvailabilityPath("s1")).toBe("/core/outage/availability/services/s1");
  });

  it("builds status page paths on their own mount", () => {
    expect(statusPagePath()).toBe("/status-pages");
    expect(statusPagePath("p1")).toBe("/status-pages/p1");
    expect(statusPagePath()).not.toContain(OUTAGE_ROOT);
  });
});
