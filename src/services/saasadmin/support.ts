import { saasadminApi } from "./base";
import type { ApiSuccess, ApiRecord, ListQuery } from "./types";

/**
 * Platform support desk (tickets and queues) — mounted at `/admin/support`.
 */
export const supportApi = saasadminApi.injectEndpoints({
  endpoints: (build) => ({
    listSupportTickets: build.query<ApiSuccess<ApiRecord[]>, ListQuery | void>({
      query: (params) => ({ url: "/admin/support/tickets", params: params ?? undefined }),
      providesTags: ["Support"],
    }),
    createSupportTicket: build.mutation<ApiSuccess<ApiRecord>, ApiRecord>({
      query: (body) => ({ url: "/admin/support/tickets", method: "POST", body }),
      invalidatesTags: ["Support"],
    }),
    getSupportTicket: build.query<ApiSuccess<ApiRecord>, string>({
      query: (ticketId) => ({ url: `/admin/support/tickets/${encodeURIComponent(ticketId)}` }),
      providesTags: (_r, _e, ticketId) => [{ type: "Support", id: ticketId }],
    }),
    updateSupportTicket: build.mutation<ApiSuccess<ApiRecord>, { ticketId: string; body: ApiRecord }>({
      query: ({ ticketId, body }) => ({
        url: `/admin/support/tickets/${encodeURIComponent(ticketId)}`,
        method: "PATCH",
        body,
      }),
      invalidatesTags: (_r, _e, { ticketId }) => ["Support", { type: "Support", id: ticketId }],
    }),
    assignSupportTicket: build.mutation<ApiSuccess<ApiRecord>, { ticketId: string; body: ApiRecord }>({
      query: ({ ticketId, body }) => ({
        url: `/admin/support/tickets/${encodeURIComponent(ticketId)}/assign`,
        method: "POST",
        body,
      }),
      invalidatesTags: (_r, _e, { ticketId }) => ["Support", { type: "Support", id: ticketId }],
    }),
    replySupportTicket: build.mutation<ApiSuccess<ApiRecord>, { ticketId: string; body: ApiRecord }>({
      query: ({ ticketId, body }) => ({
        url: `/admin/support/tickets/${encodeURIComponent(ticketId)}/reply`,
        method: "POST",
        body,
      }),
      invalidatesTags: (_r, _e, { ticketId }) => [{ type: "Support", id: ticketId }],
    }),
    resolveSupportTicket: build.mutation<ApiSuccess<ApiRecord>, { ticketId: string; body?: ApiRecord }>({
      query: ({ ticketId, body }) => ({
        url: `/admin/support/tickets/${encodeURIComponent(ticketId)}/resolve`,
        method: "POST",
        body: body ?? {},
      }),
      invalidatesTags: (_r, _e, { ticketId }) => ["Support", { type: "Support", id: ticketId }],
    }),
    reopenSupportTicket: build.mutation<ApiSuccess<ApiRecord>, { ticketId: string; body?: ApiRecord }>({
      query: ({ ticketId, body }) => ({
        url: `/admin/support/tickets/${encodeURIComponent(ticketId)}/reopen`,
        method: "POST",
        body: body ?? {},
      }),
      invalidatesTags: (_r, _e, { ticketId }) => ["Support", { type: "Support", id: ticketId }],
    }),
    getSupportTicketHistory: build.query<ApiSuccess<ApiRecord[]>, string>({
      query: (ticketId) => ({
        url: `/admin/support/tickets/${encodeURIComponent(ticketId)}/history`,
      }),
      providesTags: (_r, _e, ticketId) => [{ type: "Support", id: ticketId }],
    }),
    listSupportQueues: build.query<ApiSuccess<ApiRecord[]>, void>({
      query: () => ({ url: "/admin/support/queues" }),
      providesTags: ["Support"],
    }),
    createSupportQueue: build.mutation<ApiSuccess<ApiRecord>, ApiRecord>({
      query: (body) => ({ url: "/admin/support/queues", method: "POST", body }),
      invalidatesTags: ["Support"],
    }),
    updateSupportQueue: build.mutation<ApiSuccess<ApiRecord>, { queueId: string; body: ApiRecord }>({
      query: ({ queueId, body }) => ({
        url: `/admin/support/queues/${encodeURIComponent(queueId)}`,
        method: "PATCH",
        body,
      }),
      invalidatesTags: ["Support"],
    }),
  }),
});

export const {
  useListSupportTicketsQuery,
  useCreateSupportTicketMutation,
  useGetSupportTicketQuery,
  useUpdateSupportTicketMutation,
  useAssignSupportTicketMutation,
  useReplySupportTicketMutation,
  useResolveSupportTicketMutation,
  useReopenSupportTicketMutation,
  useGetSupportTicketHistoryQuery,
  useListSupportQueuesQuery,
  useCreateSupportQueueMutation,
  useUpdateSupportQueueMutation,
} = supportApi;
