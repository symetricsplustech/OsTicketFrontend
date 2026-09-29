import type { OperationalDomain } from "./operationalDomain";

export type OperationalCapabilities = {
  create: boolean;
  update: boolean;
  remove: boolean;
  transition: boolean;
};

const fullLifecycle: OperationalCapabilities = { create: true, update: true, remove: true, transition: true };
const readOnly: OperationalCapabilities = { create: false, update: false, remove: false, transition: false };

/**
 * Resources that only have a GET list endpoint. Offering create/edit/delete on
 * them would call a POST/PUT/DELETE path the API does not serve.
 */
const readOnlyResources = new Set(["dashboard", "capacity", "presence"]);

export function operationalCapabilities(domain: OperationalDomain, resource: string, screenIsReadOnly = false): OperationalCapabilities {
  if (screenIsReadOnly || readOnlyResources.has(resource)) return readOnly;
  if (domain === "approval" && resource === "instances") {
    return { create: true, update: false, remove: false, transition: false };
  }
  if (domain === "on-call" && resource === "coverage") {
    return { create: true, update: false, remove: false, transition: false };
  }
  return fullLifecycle;
}
