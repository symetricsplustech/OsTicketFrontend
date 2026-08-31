import { platformApi } from '../platformApi';

const governanceApi = platformApi.injectEndpoints({
  endpoints: (b) => ({
    getRegulatoryChanges: b.query<any[], void>({
      query: () => '/gaps/regulatory-changes',
      providesTags: ['RegulatoryChange'],
    }),
    addRegulatoryChange: b.mutation<any, any>({
      query: (body) => ({ url: '/gaps/regulatory-changes', method: 'POST', body }),
      invalidatesTags: ['RegulatoryChange'],
    }),
    getClauseItems: b.query<any[], void>({
      query: () => '/gaps/clause-items',
      providesTags: ['ClauseItem'],
    }),
    addClauseItem: b.mutation<any, any>({
      query: (body) => ({ url: '/gaps/clause-items', method: 'POST', body }),
      invalidatesTags: ['ClauseItem'],
    }),
  }),
});

export const {
  useGetRegulatoryChangesQuery,
  useAddRegulatoryChangeMutation,
  useGetClauseItemsQuery,
  useAddClauseItemMutation,
} = governanceApi;
