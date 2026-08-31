import { platformApi } from '../platformApi';

type ListArg = Record<string, string | undefined> | void;

const crmApi = platformApi.injectEndpoints({
  endpoints: (b) => ({
    getCampaigns: b.query<any[], ListArg>({
      query: () => '/gaps/campaigns',
      providesTags: ['Campaign'],
    }),
    addCampaign: b.mutation<any, any>({
      query: (body) => ({ url: '/gaps/campaigns', method: 'POST', body }),
      invalidatesTags: ['Campaign'],
    }),
    addCampaignMember: b.mutation<any, { id: string; contactId: string }>({
      query: ({ id, contactId }) => ({ url: `/gaps/campaigns/${id}/members`, method: 'POST', body: { contactId } }),
      invalidatesTags: ['Campaign'],
    }),
    getTerritories: b.query<any[], void>({
      query: () => '/gaps/territories',
      providesTags: ['Territory'],
    }),
    addTerritory: b.mutation<any, any>({
      query: (body) => ({ url: '/gaps/territories', method: 'POST', body }),
      invalidatesTags: ['Territory'],
    }),
    getAccountTeams: b.query<any[], void>({
      query: () => '/gaps/account-teams',
      providesTags: ['AccountTeam'],
    }),
    addAccountTeamMember: b.mutation<any, any>({
      query: (body) => ({ url: '/gaps/account-teams', method: 'POST', body }),
      invalidatesTags: ['AccountTeam'],
    }),
    getStageAgeing: b.query<any, void>({
      query: () => '/gaps/crm/stage-ageing',
      providesTags: ['StageAgeing'],
    }),
    getSalesPipelines: b.query<any[], void>({
      query: () => '/gaps2/sales-pipelines',
      providesTags: ['SalesPipeline'],
    }),
    addSalesPipeline: b.mutation<any, any>({
      query: (body) => ({ url: '/gaps2/sales-pipelines', method: 'POST', body }),
      invalidatesTags: ['SalesPipeline'],
    }),
    getOppMeta: b.query<any, string>({
      query: (id) => `/gaps2/opportunities/${id}/meta`,
      providesTags: ['Opportunity'],
    }),
    updateOppMeta: b.mutation<any, { id: string; body: any }>({
      query: ({ id, body }) => ({ url: `/gaps2/opportunities/${id}/meta`, method: 'PUT', body }),
      invalidatesTags: ['Opportunity'],
    }),
    getQuoteVersions: b.query<any[], string>({
      query: (id) => `/gaps2/quotes/${id}/versions`,
      providesTags: ['Quote'],
    }),
    addQuoteVersion: b.mutation<any, string>({
      query: (id) => ({ url: `/gaps2/quotes/${id}/version`, method: 'POST' }),
      invalidatesTags: ['Quote'],
    }),
    getLeadSnippet: b.query<any, void>({
      query: () => '/gaps2/lead-capture/snippet',
      providesTags: ['LeadCapture'],
    }),
  }),
});

export const {
  useGetCampaignsQuery,
  useAddCampaignMutation,
  useAddCampaignMemberMutation,
  useGetTerritoriesQuery,
  useAddTerritoryMutation,
  useGetAccountTeamsQuery,
  useAddAccountTeamMemberMutation,
  useGetStageAgeingQuery,
  useGetSalesPipelinesQuery,
  useAddSalesPipelineMutation,
  useGetOppMetaQuery,
  useUpdateOppMetaMutation,
  useGetQuoteVersionsQuery,
  useAddQuoteVersionMutation,
  useGetLeadSnippetQuery,
} = crmApi;
