import { baseApi } from "@shared/api/base";
import type { OperationalResponse, ResourceQuery } from "@features/enterprise-operations/api/operationalTypes";
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
} from "./outagePaths";

/**
 * Phase 16 Outage & Service Status Management.
 *
 * Every builder in outagePaths is used here so the two cannot drift: the
 * outage_* screens and the service status pages are tagged separately because
 * they are separate backend mounts and are never invalidated by each other.
 */
/**
 * The outage router exposes one fixed collection, so unlike the generic
 * resource mutations there is no `resource` segment to send; these arg shapes
 * deliberately omit it rather than accepting a value the route ignores.
 */
type OutageBody = { body?: Record<string, unknown> };
type OutageItem = OutageBody & { id: string };
type OutageChild = OutageBody & { outageId: string };
type OutageChildItem = OutageBody & { outageId: string; ciId?: string; serviceId?: string; relationId?: string };

const outageTag = { type: "ItsmWork" as const, id: "outages" };
const statusPageTag = { type: "ItsmWork" as const, id: "status-pages" };

export const outageManagementApi = baseApi.injectEndpoints({
  endpoints: (build) => ({
    // ── 16.1 Outages ──────────────────────────────────────────────────────
    listOutages: build.query<OperationalResponse, ResourceQuery>({
      query: (params) => ({ url: outagePath("outages"), params }),
      providesTags: [outageTag],
    }),
    getOutage: build.query<OperationalResponse, { id: string }>({
      query: ({ id }) => ({ url: outagePath("outages", id) }),
      providesTags: [outageTag],
    }),
    getOutageDetail: build.query<OperationalResponse, { id: string }>({
      query: ({ id }) => ({ url: outageDetailPath(id) }),
      providesTags: [outageTag],
    }),
    getOutageDashboard: build.query<OperationalResponse, void>({
      query: () => ({ url: outageDashboardPath() }),
      providesTags: [outageTag],
    }),
    createOutage: build.mutation<OperationalResponse, OutageBody>({
      query: ({ body }) => ({ url: outagePath("outages"), method: "POST", body }),
      invalidatesTags: [outageTag],
    }),
    updateOutage: build.mutation<OperationalResponse, OutageItem>({
      query: ({ id, body }) => ({ url: outagePath("outages", id), method: "PUT", body }),
      invalidatesTags: [outageTag],
    }),
    transitionOutage: build.mutation<OperationalResponse, OutageItem>({
      query: ({ id, body }) => ({ url: outageTransitionPath(id), method: "POST", body }),
      invalidatesTags: [outageTag],
    }),
    deleteOutage: build.mutation<OperationalResponse, { id: string }>({
      query: ({ id }) => ({ url: outagePath("outages", id), method: "DELETE" }),
      invalidatesTags: [outageTag],
    }),

    // ── 16.2 Outage impact ────────────────────────────────────────────────
    listOutageCIs: build.query<OperationalResponse, { outageId: string }>({
      query: ({ outageId }) => ({ url: outageCiPath(outageId) }),
      providesTags: [outageTag],
    }),
    addOutageCI: build.mutation<OperationalResponse, OutageChild>({
      query: ({ outageId, body }) => ({ url: outageCiPath(outageId), method: "POST", body }),
      invalidatesTags: [outageTag],
    }),
    updateOutageCI: build.mutation<OperationalResponse, OutageChild & { ciId: string }>({
      query: ({ outageId, ciId, body }) => ({ url: outageCiPath(outageId, ciId), method: "PUT", body }),
      invalidatesTags: [outageTag],
    }),
    removeOutageCI: build.mutation<OperationalResponse, { outageId: string; ciId: string }>({
      query: ({ outageId, ciId }) => ({ url: outageCiPath(outageId, ciId), method: "DELETE" }),
      invalidatesTags: [outageTag],
    }),
    listOutageServices: build.query<OperationalResponse, { outageId: string }>({
      query: ({ outageId }) => ({ url: outageServicePath(outageId) }),
      providesTags: [outageTag],
    }),
    addOutageService: build.mutation<OperationalResponse, OutageChild>({
      query: ({ outageId, body }) => ({ url: outageServicePath(outageId), method: "POST", body }),
      invalidatesTags: [outageTag],
    }),
    updateOutageService: build.mutation<OperationalResponse, OutageChild & { serviceId: string }>({
      query: ({ outageId, serviceId, body }) => ({ url: outageServicePath(outageId, serviceId), method: "PUT", body }),
      invalidatesTags: [outageTag],
    }),
    removeOutageService: build.mutation<OperationalResponse, { outageId: string; serviceId: string }>({
      query: ({ outageId, serviceId }) => ({ url: outageServicePath(outageId, serviceId), method: "DELETE" }),
      invalidatesTags: [outageTag],
    }),

    // ── 16.2 impact timeline ──────────────────────────────────────────────
    getOutageTimeline: build.query<OperationalResponse, { outageId: string }>({
      query: ({ outageId }) => ({ url: outageTimelinePath(outageId) }),
      providesTags: [outageTag],
    }),
    addTimelineEntry: build.mutation<OperationalResponse, OutageChild>({
      query: ({ outageId, body }) => ({ url: outageTimelinePath(outageId), method: "POST", body }),
      invalidatesTags: [outageTag],
    }),

    // ── 16.3 Outage relationships ─────────────────────────────────────────
    listOutageRelations: build.query<OperationalResponse, { outageId: string; relationType?: string }>({
      query: ({ outageId, relationType }) => ({ url: outageRelationsPath(outageId), params: { relationType } }),
      providesTags: [outageTag],
    }),
    linkIncident: build.mutation<OperationalResponse, OutageChild>({
      query: ({ outageId, body }) => ({ url: outageIncidentLinkPath(outageId), method: "POST", body }),
      invalidatesTags: [outageTag],
    }),
    linkMajorIncident: build.mutation<OperationalResponse, OutageChild>({
      query: ({ outageId, body }) => ({ url: outageMajorIncidentPath(outageId), method: "POST", body }),
      invalidatesTags: [outageTag],
    }),
    linkChange: build.mutation<OperationalResponse, OutageChild>({
      query: ({ outageId, body }) => ({ url: outageChangeLinkPath(outageId), method: "POST", body }),
      invalidatesTags: [outageTag],
    }),
    unlinkRelation: build.mutation<OperationalResponse, { outageId: string; relationId: string }>({
      query: ({ outageId, relationId }) => ({ url: outageRelationPath(outageId, relationId), method: "DELETE" }),
      invalidatesTags: [outageTag],
    }),

    // ── 16.4 Outage communications ────────────────────────────────────────
    getCommunicationPlan: build.query<OperationalResponse, { outageId: string }>({
      query: ({ outageId }) => ({ url: outageCommunicationPlanPath(outageId) }),
      providesTags: [outageTag],
    }),
    updateCommunicationPlan: build.mutation<OperationalResponse, OutageChild>({
      query: ({ outageId, body }) => ({ url: outageCommunicationPlanPath(outageId), method: "PUT", body }),
      invalidatesTags: [outageTag],
    }),
    sendOutageCommunication: build.mutation<OperationalResponse, OutageChild>({
      query: ({ outageId, body }) => ({ url: outageCommunicationPath(outageId), method: "POST", body }),
      invalidatesTags: [outageTag],
    }),
    runCommunicationCadence: build.mutation<OperationalResponse, void>({
      query: () => ({ url: communicationCadencePath(), method: "POST" }),
      invalidatesTags: [outageTag],
    }),

    // ── 16.5 Service availability ─────────────────────────────────────────
    calculateAvailability: build.mutation<OperationalResponse, OutageBody>({
      query: ({ body }) => ({ url: availabilityCalculatePath(), method: "POST", body }),
      invalidatesTags: [outageTag],
    }),
    listAvailabilityRecords: build.query<OperationalResponse, ResourceQuery>({
      query: (params) => ({ url: availabilityRecordsPath(), params }),
      providesTags: [outageTag],
    }),
    getServiceAvailability: build.query<OperationalResponse, { serviceId: string; periodStart?: string; periodEnd?: string }>({
      query: ({ serviceId, periodStart, periodEnd }) => ({
        url: serviceAvailabilityPath(serviceId),
        params: { periodStart, periodEnd },
      }),
      providesTags: [outageTag],
    }),

    // ── Service status pages (separate backend mount) ─────────────────────
    listStatusPages: build.query<OperationalResponse, ResourceQuery>({
      query: (params) => ({ url: statusPagePath(), params }),
      providesTags: [statusPageTag],
    }),
    getStatusPage: build.query<OperationalResponse, { id: string }>({
      query: ({ id }) => ({ url: statusPagePath(id) }),
      providesTags: [statusPageTag],
    }),
    createStatusPage: build.mutation<OperationalResponse, OutageBody>({
      query: ({ body }) => ({ url: statusPagePath(), method: "POST", body }),
      invalidatesTags: [statusPageTag],
    }),
    updateStatusPage: build.mutation<OperationalResponse, OutageItem>({
      query: ({ id, body }) => ({ url: statusPagePath(id), method: "PUT", body }),
      invalidatesTags: [statusPageTag],
    }),
    deleteStatusPage: build.mutation<OperationalResponse, { id: string }>({
      query: ({ id }) => ({ url: statusPagePath(id), method: "DELETE" }),
      invalidatesTags: [statusPageTag],
    }),
  }),
});

export const {
  // 16.1
  useListOutagesQuery,
  useGetOutageQuery,
  useGetOutageDetailQuery,
  useGetOutageDashboardQuery,
  useCreateOutageMutation,
  useUpdateOutageMutation,
  useTransitionOutageMutation,
  useDeleteOutageMutation,
  // 16.2
  useListOutageCIsQuery,
  useAddOutageCIMutation,
  useUpdateOutageCIMutation,
  useRemoveOutageCIMutation,
  useListOutageServicesQuery,
  useAddOutageServiceMutation,
  useUpdateOutageServiceMutation,
  useRemoveOutageServiceMutation,
  useGetOutageTimelineQuery,
  useAddTimelineEntryMutation,
  // 16.3
  useListOutageRelationsQuery,
  useLinkIncidentMutation,
  useLinkMajorIncidentMutation,
  useLinkChangeMutation,
  useUnlinkRelationMutation,
  // 16.4
  useGetCommunicationPlanQuery,
  useUpdateCommunicationPlanMutation,
  useSendOutageCommunicationMutation,
  useRunCommunicationCadenceMutation,
  // 16.5
  useCalculateAvailabilityMutation,
  useListAvailabilityRecordsQuery,
  useGetServiceAvailabilityQuery,
  // status pages
  useListStatusPagesQuery,
  useGetStatusPageQuery,
  useCreateStatusPageMutation,
  useUpdateStatusPageMutation,
  useDeleteStatusPageMutation,
} = outageManagementApi;

export { OUTAGE_ROOT, STATUS_PAGE_ROOT };
