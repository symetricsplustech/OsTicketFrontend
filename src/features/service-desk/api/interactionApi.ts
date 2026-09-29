import { baseApi } from "@shared/api/base";
import type { ApiListResponse, ApiRecordResponse, ListParams } from "@shared/api/itsmTypes";

const interactionTag = { type: "ItsmWork" as const, id: "walkup/interactions" };

export const interactionApi = baseApi.injectEndpoints({
  endpoints: (build) => ({
    listInteractions: build.query<ApiListResponse, ListParams & { channel?: string }>({
      query: (params) => ({ url: "/core/walkup/interactions", params }),
      providesTags: [interactionTag],
    }),
    createInteraction: build.mutation<ApiRecordResponse, Record<string, unknown>>({
      query: (body) => ({ url: "/core/walkup/interactions", method: "POST", body }),
      invalidatesTags: [interactionTag],
    }),
    updateInteraction: build.mutation<ApiRecordResponse, { id: string; body: Record<string, unknown> }>({
      query: ({ id, body }) => ({ url: `/core/walkup/interactions/${id}`, method: "PUT", body }),
      invalidatesTags: [interactionTag],
    }),
    completeInteraction: build.mutation<ApiRecordResponse, { id: string; body?: Record<string, unknown> }>({
      query: ({ id, body = {} }) => ({ url: `/core/walkup/interactions/${id}/complete`, method: "POST", body }),
      invalidatesTags: [interactionTag],
    }),
    cancelInteraction: build.mutation<ApiRecordResponse, { id: string }>({
      query: ({ id }) => ({ url: `/core/walkup/interactions/${id}`, method: "DELETE" }),
      invalidatesTags: [interactionTag],
    }),
  }),
});

export const { useListInteractionsQuery, useCreateInteractionMutation, useUpdateInteractionMutation, useCompleteInteractionMutation, useCancelInteractionMutation } = interactionApi;
