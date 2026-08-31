import { platformApi } from '../platformApi';

const modulesApi = platformApi.injectEndpoints({
  endpoints: (b) => ({
    getModuleCatalog: b.query<any[], void>({
      query: () => '/em/modules/catalog',
      providesTags: ['Modules'],
    }),
    getModuleHistory: b.query<any[], void>({
      query: () => '/em/modules/history',
      providesTags: ['ModuleHistory'],
    }),
    getModuleGraph: b.query<any, void>({
      query: () => '/em/modules/dependencies',
      providesTags: ['Modules'],
    }),
    previewModules: b.mutation<any, string[]>({
      query: (keys) => ({ url: '/em/modules/preview', method: 'POST', body: { keys } }),
      invalidatesTags: ['Modules'],
    }),
    previewModuleChange: b.mutation<any, { keys: string[] }>({
      query: (body) => ({ url: '/em/modules/preview', method: 'POST', body }),
      invalidatesTags: ['Modules'],
    }),
    setModuleStatus: b.mutation<any, { key: string; status: string; trialDays?: number; graceDays?: number }>({
      query: ({ key, ...body }) => ({ url: `/em/modules/${key}/status`, method: 'PUT', body }),
      invalidatesTags: ['Modules'],
    }),
    activateModuleV2: b.mutation<{ success?: boolean; error?: string; missingDependencies?: string[] }, { key: string; mode?: 'active' | 'trial' }>({
      query: ({ key, mode }) => ({ url: `/em/modules/${key}/activate`, method: 'POST', body: { mode } }),
      invalidatesTags: ['Modules'],
    }),
    deactivateModuleV2: b.mutation<any, { key: string; graceDays?: number }>({
      query: ({ key, graceDays }) => ({ url: `/em/modules/${key}/deactivate`, method: 'POST', body: { graceDays } }),
      invalidatesTags: ['Modules'],
    }),
    deactivationImpact: b.query<any, string>({
      query: (key) => `/em/modules/${key}/deactivation-impact`,
      providesTags: ['Modules'],
    }),
    getActivationHistory: b.query<any[], void>({
      query: () => '/em/modules/history',
      providesTags: ['ModuleHistory'],
    }),
  }),
});

export const {
  useGetModuleCatalogQuery,
  useGetModuleHistoryQuery,
  useGetModuleGraphQuery,
  usePreviewModulesMutation,
  usePreviewModuleChangeMutation,
  useSetModuleStatusMutation,
  useActivateModuleV2Mutation,
  useDeactivateModuleV2Mutation,
  useDeactivationImpactQuery,
  useGetActivationHistoryQuery,
} = modulesApi;
