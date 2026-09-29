import { describe, expect, it } from "vitest";
import { directoryUrl, effectiveAccessUrl, reportingLineUrl } from "@features/instance-admin/people/hierarchy/src/urls";

describe("Module 1 — user hierarchy URL builders", () => {
  it("builds the directory URL with search and pagination", () => {
    expect(directoryUrl({ instanceId: "inst-1", search: "ada", page: 2, limit: 20 })).toBe(
      "/instances/inst-1/directory?search=ada&page=2&limit=20",
    );
  });

  it("omits empty parameters", () => {
    expect(directoryUrl({ instanceId: "inst-1" })).toBe("/instances/inst-1/directory");
  });

  it("builds effective-access URLs for self and a target user", () => {
    expect(effectiveAccessUrl("inst-1", undefined)).toBe("/instances/inst-1/me/effective-access");
    expect(effectiveAccessUrl("inst-1", "user-9")).toBe(
      "/instances/inst-1/users/user-9/effective-access",
    );
  });

  it("builds reporting line URLs", () => {
    expect(reportingLineUrl("inst-1", "user-9")).toBe("/instances/inst-1/users/user-9/reporting-line");
    expect(reportingLineUrl("inst-1", "user-9", "chain")).toBe(
      "/instances/inst-1/users/user-9/reporting-chain",
    );
  });
});