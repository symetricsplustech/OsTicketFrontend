import { platformApi } from '../platformApi';

const helpdeskApi = platformApi.injectEndpoints({
  endpoints: (b) => ({
    getWorklog: b.query<any, string>({
      query: (ticketNumber) => `/gaps/worklogs/${ticketNumber}`,
      providesTags: ['Worklog'],
    }),
    addWorklog: b.mutation<any, { ticketNumber: string; minutes: number; billable: boolean; note?: string }>({
      query: ({ ticketNumber, ...body }) => ({ url: `/gaps/worklogs/${ticketNumber}`, method: 'POST', body }),
      invalidatesTags: ['Worklog'],
    }),
    getDraft: b.query<any, string>({
      query: (key) => `/gaps/drafts/${key}`,
      providesTags: ['Draft'],
    }),
    saveDraft: b.mutation<any, { key: string; content: string }>({
      query: ({ key, content }) => ({ url: `/gaps/drafts/${key}`, method: 'PUT', body: { content } }),
      invalidatesTags: ['Draft'],
    }),
    getPriorityMatrix: b.query<any[], void>({
      query: () => '/gaps3/priority-matrix',
      providesTags: ['PriorityMatrix'],
    }),
    setPriorityMatrix: b.mutation<any, { cells: Array<{ impact: string; urgency: string; priority: string }> }>({
      query: (body) => ({ url: '/gaps3/priority-matrix', method: 'PUT', body }),
      invalidatesTags: ['PriorityMatrix'],
    }),
    computePriority: b.mutation<any, { impact: string; urgency: string }>({
      query: (body) => ({ url: '/gaps3/priority-matrix/compute', method: 'POST', body }),
    }),
    getHandoverNotes: b.query<any[], void>({
      query: () => '/gaps2/handover-notes',
      providesTags: ['HandoverNote'],
    }),
    addHandoverNote: b.mutation<any, any>({
      query: (body) => ({ url: '/gaps2/handover-notes', method: 'POST', body }),
      invalidatesTags: ['HandoverNote'],
    }),
    publishKbSweep: b.mutation<any, void>({
      query: () => ({ url: '/gaps2/kb/publish-sweep', method: 'POST' }),
      invalidatesTags: ['KnowledgeBase'],
    }),
    getGapAnalysis: b.query<any, void>({
      query: () => '/gaps3/kb/gap-analysis',
      providesTags: ['KnowledgeBase'],
    }),
    getMttMetrics: b.query<any, void>({
      query: () => '/gaps2/mtt-metrics',
      providesTags: ['MttMetrics'],
    }),
  }),
});

export const {
  useGetWorklogQuery,
  useAddWorklogMutation,
  useGetDraftQuery,
  useSaveDraftMutation,
  useGetPriorityMatrixQuery,
  useSetPriorityMatrixMutation,
  useComputePriorityMutation,
  useGetHandoverNotesQuery,
  useAddHandoverNoteMutation,
  usePublishKbSweepMutation,
  useGetGapAnalysisQuery,
  useGetMttMetricsQuery,
} = helpdeskApi;
