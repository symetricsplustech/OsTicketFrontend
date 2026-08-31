import { platformApi } from '../platformApi';

const usageApi = platformApi.injectEndpoints({
  endpoints: (b) => ({
    getUsageSummary: b.query<any, void>({
      query: () => '/gaps/usage-summary',
      providesTags: ['Usage'],
    }),
  }),
});

export const { useGetUsageSummaryQuery } = usageApi;
