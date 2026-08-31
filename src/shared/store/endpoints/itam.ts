import { platformApi } from '../platformApi';

const itamApi = platformApi.injectEndpoints({
  endpoints: (b) => ({
    importSoftware: b.mutation<any, any>({
      query: (body) => ({ url: '/gaps/software-import', method: 'POST', body }),
      invalidatesTags: ['SoftwareImport'],
    }),
    requestReclamation: b.mutation<any, any>({
      query: (body) => ({ url: '/gaps/reclamations', method: 'POST', body }),
      invalidatesTags: ['Reclamation'],
    }),
    confirmReclamation: b.mutation<any, { id: string; confirmed: boolean }>({
      query: ({ id, confirmed }) => ({ url: `/gaps/reclamations/${id}/confirm`, method: 'POST', body: { confirmed } }),
      invalidatesTags: ['Reclamation'],
    }),
    getSaasRoster: b.query<any, void>({
      query: () => '/gaps/saas-roster',
      providesTags: ['SaaSRoster'],
    }),
    scanAssetAudit: b.mutation<any, { id: string; scannedIds: string[] }>({
      query: ({ id, scannedIds }) => ({ url: `/gaps/asset-audits/${id}/scan`, method: 'PUT', body: { scannedIds } }),
      invalidatesTags: ['AssetAuditRun'],
    }),
    scanAssetAuditBatch: b.mutation<any, any>({
      query: (body) => ({ url: '/gaps2/asset-audits/scan', method: 'POST', body }),
      invalidatesTags: ['AssetAuditRun'],
    }),
    reportLostAsset: b.mutation<any, any>({
      query: (body) => ({ url: `/gaps2/assets/${body.assetId}/lost-stolen`, method: 'POST', body }),
      invalidatesTags: ['AssetAuditRun'],
    }),
    getVendorPack: b.query<string, void>({
      query: () => '/gaps2/licenses/vendor-pack.md',
      providesTags: ['VendorPack'],
    }),
  }),
});

export const {
  useImportSoftwareMutation,
  useRequestReclamationMutation,
  useConfirmReclamationMutation,
  useGetSaasRosterQuery,
  useScanAssetAuditMutation,
  useScanAssetAuditBatchMutation,
  useReportLostAssetMutation,
  useGetVendorPackQuery,
} = itamApi;
