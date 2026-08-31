import { platformApi } from '../platformApi';

const gaps2Api = platformApi.injectEndpoints({
  endpoints: (b) => ({
    getCommunityThreads: b.query<any[], void>({
      query: () => '/gaps2/community-threads',
      providesTags: ['CommunityThread'],
    }),
    addCommunityThread: b.mutation<any, any>({
      query: (body) => ({ url: '/gaps2/community-threads', method: 'POST', body }),
      invalidatesTags: ['CommunityThread'],
    }),
    answerThread: b.mutation<any, { id: string; body: string }>({
      query: ({ id, body }) => ({ url: `/gaps2/community-threads/${id}/answers`, method: 'POST', body: { body } }),
      invalidatesTags: ['CommunityThread'],
    }),
    acceptAnswer: b.mutation<any, { id: string; idx: number }>({
      query: ({ id, idx }) => ({ url: `/gaps2/community-threads/${id}/accept/${idx}`, method: 'POST' }),
      invalidatesTags: ['CommunityThread'],
    }),
    getUnifiedInbox: b.query<any[], void>({
      query: () => '/gaps/unified-inbox',
      providesTags: ['UnifiedInbox'],
    }),
    getManagerHub: b.query<any, void>({
      query: () => '/gaps/manager-hub',
      providesTags: ['ManagerHub'],
    }),
    getFloorPlan: b.query<any, string | void>({
      query: (buildingId) => `/gaps2/workplace/floorplan${buildingId ? `?buildingId=${buildingId}` : ''}`,
      providesTags: ['FloorPlan'],
    }),
    saveFloorPlan: b.mutation<any, any>({
      query: (body) => ({ url: '/gaps2/workplace/floorplan', method: 'PUT', body }),
      invalidatesTags: ['FloorPlan'],
    }),
    getOccupancyLive: b.query<any[], void>({
      query: () => '/gaps2/workplace/occupancy-live',
      providesTags: ['Occupancy'],
    }),
    ingestOccupancy: b.mutation<any, any>({
      query: (body) => ({ url: '/gaps2/workplace/occupancy-ingest', method: 'POST', body }),
      invalidatesTags: ['Occupancy'],
    }),
    getStorefront: b.query<any, void>({
      query: () => '/gaps2/storefront',
      providesTags: ['Storefront'],
    }),
    getBidGrid: b.query<any, string>({
      query: (id) => `/gaps2/sourcing-events/${id}/bid-grid`,
      providesTags: ['Storefront'],
    }),
    normalizeEvent: b.mutation<any, any>({
      query: (body) => ({ url: '/gaps2/events/normalize', method: 'POST', body }),
      invalidatesTags: ['Event'],
    }),
    getAclRules: b.query<any[], void>({
      query: () => '/gaps2/acl/rules',
      providesTags: ['AclRule'],
    }),
    addAclRule: b.mutation<any, any>({
      query: (body) => ({ url: '/gaps2/acl/rules', method: 'POST', body }),
      invalidatesTags: ['AclRule'],
    }),
    evaluateAcl: b.mutation<any, any>({
      query: (body) => ({ url: '/gaps2/acl/evaluate', method: 'POST', body }),
    }),
    getRoadmapItems: b.query<any[], void>({
      query: () => '/gaps2/roadmap-items',
      providesTags: ['RoadmapItem'],
    }),
    addRoadmapItem: b.mutation<any, any>({
      query: (body) => ({ url: '/gaps2/roadmap-items', method: 'POST', body }),
      invalidatesTags: ['RoadmapItem'],
    }),
    getSpendOptimisation: b.query<any, void>({
      query: () => '/gaps2/software/spend-optimisation',
      providesTags: ['SoftwareGovernance'],
    }),
    getEmployee360: b.query<any, string>({
      query: (userId) => `/gaps2/employee-360/${userId}`,
      providesTags: ['Employee'],
    }),
    saveBranding: b.mutation<any, any>({
      query: (body) => ({ url: '/gaps2/branding', method: 'PUT', body }),
      invalidatesTags: ['Branding'],
    }),
    setMaintenanceMode: b.mutation<any, { enabled: boolean; message?: string }>({
      query: (body) => ({ url: '/gaps2/maintenance', method: 'PUT', body }),
      invalidatesTags: ['Maintenance'],
    }),
    getFunnelReport: b.mutation<any, { stageOrder?: string[] } | void>({
      query: (body) => ({ url: '/gaps2/reports/funnel', method: 'POST', body: body || {} }),
    }),
    periodCompare: b.mutation<any, void>({
      query: () => ({ url: '/gaps2/reports/period-compare', method: 'POST' }),
    }),
    scorecard: b.mutation<any, { metric: string; value: number }>({
      query: (body) => ({ url: '/gaps2/reports/scorecard', method: 'POST', body }),
    }),
    replyInbound: b.mutation<any, { id: string; text: string }>({
      query: ({ id, text }) => ({ url: `/gaps2/inbound-messages/${id}/reply`, method: 'POST', body: { text } }),
      invalidatesTags: ['InboundMessage'],
    }),
  }),
});

export const {
  useGetCommunityThreadsQuery,
  useAddCommunityThreadMutation,
  useAnswerThreadMutation,
  useAcceptAnswerMutation,
  useGetUnifiedInboxQuery,
  useGetManagerHubQuery,
  useGetFloorPlanQuery,
  useSaveFloorPlanMutation,
  useGetOccupancyLiveQuery,
  useIngestOccupancyMutation,
  useGetStorefrontQuery,
  useGetBidGridQuery,
  useNormalizeEventMutation,
  useGetAclRulesQuery,
  useAddAclRuleMutation,
  useEvaluateAclMutation,
  useGetRoadmapItemsQuery,
  useAddRoadmapItemMutation,
  useGetSpendOptimisationQuery,
  useGetEmployee360Query,
  useSaveBrandingMutation,
  useSetMaintenanceModeMutation,
  useGetFunnelReportMutation,
  usePeriodCompareMutation,
  useScorecardMutation,
  useReplyInboundMutation,
} = gaps2Api;
