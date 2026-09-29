/**
 * URL builders for the Phase 16 Outage & Service Status Management routers.
 *
 * Kept separate from the RTK Query definitions so the paths can be asserted in
 * unit tests: the backend mounts outages at /api/v1/core/outage and service
 * status pages at /api/v1/status-pages, and a silent typo here would only
 * surface as a 404 at runtime.
 *
 * The two surfaces are separate mounts even though both belong to Phase 16, so
 * they get separate roots and separate tags rather than one fused base URL.
 */
export const OUTAGE_ROOT = "/core/outage";
export const STATUS_PAGE_ROOT = "/status-pages";

/** Collections on the outage router that behave like plain CRUD. */
export type OutageResource = "outages";

export const outagePath = (resource: OutageResource, id?: string) =>
  id ? `${OUTAGE_ROOT}/${resource}/${id}` : `${OUTAGE_ROOT}/${resource}`;

export const outageDetailPath = (id: string) => `${OUTAGE_ROOT}/outages/${id}/detail`;
export const outageTransitionPath = (id: string) => `${OUTAGE_ROOT}/outages/${id}/transition`;
export const outageTimelinePath = (outageId: string) => `${OUTAGE_ROOT}/outages/${outageId}/timeline`;

/** 16.2 impact: configuration items and business services hit by an outage. */
export const outageCiPath = (outageId: string, ciId?: string) =>
  ciId ? `${OUTAGE_ROOT}/outages/${outageId}/cis/${ciId}` : `${OUTAGE_ROOT}/outages/${outageId}/cis`;
export const outageServicePath = (outageId: string, serviceId?: string) =>
  serviceId
    ? `${OUTAGE_ROOT}/outages/${outageId}/services/${serviceId}`
    : `${OUTAGE_ROOT}/outages/${outageId}/services`;

/** 16.3 relationships: related incidents, the major incident, and changes. */
export const outageRelationsPath = (outageId: string) => `${OUTAGE_ROOT}/outages/${outageId}/relations`;
export const outageRelationPath = (outageId: string, relationId: string) =>
  `${OUTAGE_ROOT}/outages/${outageId}/relations/${relationId}`;
export const outageIncidentLinkPath = (outageId: string) => `${OUTAGE_ROOT}/outages/${outageId}/incidents`;
export const outageMajorIncidentPath = (outageId: string) => `${OUTAGE_ROOT}/outages/${outageId}/major-incident`;
export const outageChangeLinkPath = (outageId: string) => `${OUTAGE_ROOT}/outages/${outageId}/changes`;

/** 16.4 communications. */
export const outageCommunicationPlanPath = (outageId: string) =>
  `${OUTAGE_ROOT}/outages/${outageId}/communication-plan`;
export const outageCommunicationPath = (outageId: string) => `${OUTAGE_ROOT}/outages/${outageId}/communication`;
export const communicationCadencePath = () => `${OUTAGE_ROOT}/communication-cadence`;

/** 16.5 availability. */
export const availabilityCalculatePath = () => `${OUTAGE_ROOT}/availability/calculate`;
export const availabilityRecordsPath = () => `${OUTAGE_ROOT}/availability/records`;
export const serviceAvailabilityPath = (serviceId: string) => `${OUTAGE_ROOT}/availability/services/${serviceId}`;
export const outageDashboardPath = () => `${OUTAGE_ROOT}/dashboard`;

/** Service status pages live on their own mount, not under /core/outage. */
export const statusPagePath = (id?: string) => (id ? `${STATUS_PAGE_ROOT}/${id}` : STATUS_PAGE_ROOT);
