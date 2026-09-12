import { platformApi } from "../platformApi";
import type { Incident } from "@modules/helpdesk/services/incidents/incidentApi";

export interface IncidentListResponse {
  incidents: Incident[];
}

export const incidentsApi = platformApi.injectEndpoints({
  endpoints: (build) => ({
    listIncidents: build.query<
      IncidentListResponse,
      Record<string, unknown> | void
    >({
      query: (params) => ({
        url: "/core/incidents",
        params: (params || {}) as Record<string, unknown>,
      }),
      providesTags: ["Incident"],
    }),
    getIncidentById: build.query<Incident, string>({
      query: (id) => `/core/incidents/${id}`,
      providesTags: (_res, _err, id) => [{ type: "Incident", id }],
    }),
  }),
});

export const { useListIncidentsQuery, useGetIncidentByIdQuery } = incidentsApi;
