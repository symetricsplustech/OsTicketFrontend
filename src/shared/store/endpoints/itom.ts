import { platformApi } from '../platformApi';

const itomApi = platformApi.injectEndpoints({
  endpoints: (b) => ({
    getRemediationActions: b.query<any[], void>({
      query: () => '/gaps/remediation-actions',
      providesTags: ['RemediationAction'],
    }),
    addRemediationAction: b.mutation<any, any>({
      query: (body) => ({ url: '/gaps/remediation-actions', method: 'POST', body }),
      invalidatesTags: ['RemediationAction'],
    }),
    executeRemediation: b.mutation<any, { id: string; body: any }>({
      query: ({ id, body }) => ({ url: `/gaps/remediation-actions/${id}/execute`, method: 'POST', body }),
      invalidatesTags: ['RemediationAction', 'RemediationExecution'],
    }),
    getCloudAccounts: b.query<any[], void>({
      query: () => '/gaps/cloud-accounts',
      providesTags: ['CloudAccount'],
    }),
    addCloudAccount: b.mutation<any, any>({
      query: (body) => ({ url: '/gaps/cloud-accounts', method: 'POST', body }),
      invalidatesTags: ['CloudAccount'],
    }),
    addCloudCost: b.mutation<any, any>({
      query: (body) => ({ url: '/gaps/cloud-costs', method: 'POST', body }),
      invalidatesTags: ['CloudCost'],
    }),
    getSoarPlaybooks: b.query<any[], void>({
      query: () => '/gaps/soar-playbooks',
      providesTags: ['SoarPlaybook'],
    }),
    runSoarPlaybook: b.mutation<any, { id: string; incidentId: string }>({
      query: ({ id, incidentId }) => ({ url: `/gaps/soar-playbooks/${id}/run`, method: 'POST', body: { incidentId } }),
      invalidatesTags: ['SoarPlaybook'],
    }),
    enrichThreatIntel: b.mutation<any, string>({
      query: (incidentId) => ({ url: `/gaps/threat-enrich/${incidentId}`, method: 'POST' }),
      invalidatesTags: ['ThreatFeed'],
    }),
    getDiscoverySchedules: b.query<any[], void>({
      query: () => '/gaps3/discovery-schedules',
      providesTags: ['DiscoverySchedule'],
    }),
    addDiscoverySchedule: b.mutation<any, any>({
      query: (body) => ({ url: '/gaps3/discovery-schedules', method: 'POST', body }),
      invalidatesTags: ['DiscoverySchedule'],
    }),
    runDiscoverySchedule: b.mutation<any, string>({
      query: (id) => ({ url: `/gaps3/discovery-schedules/${id}/run`, method: 'POST' }),
      invalidatesTags: ['DiscoverySchedule'],
    }),
  }),
});

export const {
  useGetRemediationActionsQuery,
  useAddRemediationActionMutation,
  useExecuteRemediationMutation,
  useGetCloudAccountsQuery,
  useAddCloudAccountMutation,
  useAddCloudCostMutation,
  useGetSoarPlaybooksQuery,
  useRunSoarPlaybookMutation,
  useEnrichThreatIntelMutation,
  useGetDiscoverySchedulesQuery,
  useAddDiscoveryScheduleMutation,
  useRunDiscoveryScheduleMutation,
} = itomApi;
