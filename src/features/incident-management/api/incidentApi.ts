import { baseApi } from "@shared/api/base";
import type { ApiListResponse, ApiRecordResponse, ListParams } from "@shared/api/itsmTypes";

export const incidentApi = baseApi.injectEndpoints({ endpoints: (build) => ({
  listIncidents: build.query<ApiListResponse, ListParams & { major?: boolean }>({ query: ({ major, ...params }) => ({ url: major ? "/core/incidents/major" : "/core/incidents", params }), providesTags: [{ type: "ItsmWork", id: "incidents" }] }),
  createIncident: build.mutation<ApiRecordResponse, Record<string, unknown>>({ query: (body) => ({ url: "/core/incidents", method: "POST", body }), invalidatesTags: [{ type: "ItsmWork", id: "incidents" }] }),
  updateIncident: build.mutation<ApiRecordResponse, { id: string; body: Record<string, unknown> }>({ query: ({ id, body }) => ({ url: `/core/incidents/${id}`, method: "PUT", body }), invalidatesTags: [{ type: "ItsmWork", id: "incidents" }] }),
  transitionIncident: build.mutation<ApiRecordResponse, { id: string; status: string; notes?: string }>({ query: ({ id, ...body }) => ({ url: `/core/incidents/${id}/transition`, method: "POST", body }), invalidatesTags: [{ type: "ItsmWork", id: "incidents" }] }),
  commentOnIncident: build.mutation<ApiRecordResponse, { id: string; body: string }>({ query: ({ id, body }) => ({ url: `/core/incidents/${id}/comment`, method: "POST", body: { body } }), invalidatesTags: [{ type: "ItsmWork", id: "incidents" }] }),
}) });
export const { useListIncidentsQuery, useCreateIncidentMutation, useUpdateIncidentMutation, useTransitionIncidentMutation, useCommentOnIncidentMutation } = incidentApi;
