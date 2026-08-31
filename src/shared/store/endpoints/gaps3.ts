import { platformApi } from '../platformApi';

const gaps3Api = platformApi.injectEndpoints({
  endpoints: (b) => ({
    getMyOrgs: b.query<any[], void>({
      query: () => '/gaps3/my-organizations',
      providesTags: ['Organization'],
    }),
    selectOrganization: b.mutation<any, { organizationId: string }>({
      query: (body) => ({ url: '/gaps3/select-organization', method: 'POST', body }),
      invalidatesTags: ['Organization'],
    }),
    getOidcConfig: b.query<any, void>({
      query: () => '/gaps3/auth/oidc/config',
      providesTags: ['OidcConfig'],
    }),
    updateOidcConfig: b.mutation<any, any>({
      query: (body) => ({ url: '/gaps3/auth/oidc/config', method: 'PUT', body }),
      invalidatesTags: ['OidcConfig'],
    }),
    getAuthorityDocs: b.query<any[], void>({
      query: () => '/gaps3/authority-docs',
      providesTags: ['AuthorityDoc'],
    }),
    addAuthorityDoc: b.mutation<any, any>({
      query: (body) => ({ url: '/gaps3/authority-docs', method: 'POST', body }),
      invalidatesTags: ['AuthorityDoc'],
    }),
    getGrcQuestionnaires: b.query<any[], void>({
      query: () => '/gaps3/grc-questionnaires',
      providesTags: ['GrcQuestionnaire'],
    }),
    addGrcQuestionnaire: b.mutation<any, any>({
      query: (body) => ({ url: '/gaps3/grc-questionnaires', method: 'POST', body }),
      invalidatesTags: ['GrcQuestionnaire'],
    }),
    respondGrcQuestionnaire: b.mutation<any, any>({
      query: ({ id, ...body }: any) => ({ url: `/gaps3/grc-questionnaires/${id}/respond`, method: 'POST', body }),
      invalidatesTags: ['GrcQuestionnaire'],
    }),
    getPrivacyAssessments: b.query<any[], void>({
      query: () => '/gaps3/privacy-assessments',
      providesTags: ['PrivacyAssessment'],
    }),
    addPrivacyAssessment: b.mutation<any, any>({
      query: (body) => ({ url: '/gaps3/privacy-assessments', method: 'POST', body }),
      invalidatesTags: ['PrivacyAssessment'],
    }),
    getCrisisEvents: b.query<any[], void>({
      query: () => '/gaps3/crisis-events',
      providesTags: ['CrisisEvent'],
    }),
    addCrisisEvent: b.mutation<any, any>({
      query: (body) => ({ url: '/gaps3/crisis-events', method: 'POST', body }),
      invalidatesTags: ['CrisisEvent'],
    }),
    crisisAction: b.mutation<any, { id: string; action: string }>({
      query: ({ id, action }) => ({ url: `/gaps3/crisis-events/${id}/action`, method: 'POST', body: { action } }),
      invalidatesTags: ['CrisisEvent'],
    }),
    enrollSensor: b.mutation<any, any>({
      query: (body) => ({ url: '/gaps3/workplace/devices/enroll', method: 'POST', body }),
      invalidatesTags: ['Sensor'],
    }),
    getPatchCampaigns: b.query<any[], void>({
      query: () => '/gaps3/patch-campaigns',
      providesTags: ['PatchCampaign'],
    }),
    addPatchCampaign: b.mutation<any, any>({
      query: (body) => ({ url: '/gaps3/patch-campaigns', method: 'POST', body }),
      invalidatesTags: ['PatchCampaign'],
    }),
    schedulePatches: b.mutation<any, string>({
      query: (id) => ({ url: `/gaps3/patch-campaigns/${id}/schedule-remediations`, method: 'POST' }),
      invalidatesTags: ['PatchCampaign'],
    }),
    importCloudOtFindings: b.mutation<any, any>({
      query: (body) => ({ url: '/gaps3/secops/findings/cloud-ot', method: 'POST', body }),
      invalidatesTags: ['SecOpsFinding'],
    }),
    promoteEmployee: b.mutation<any, any>({
      query: (body) => ({ url: '/gaps3/hr/promote', method: 'POST', body }),
      invalidatesTags: ['Employee'],
    }),
    importVulnsDedupe: b.mutation<any, any>({
      query: (body) => ({ url: '/gaps2/secops/vulns/import-dedupe', method: 'POST', body }),
      invalidatesTags: ['SecOpsFinding'],
    }),
    getSavedPages: b.query<any[], void>({
      query: () => '/gaps3/saved-pages',
      providesTags: ['SavedPage'],
    }),
    addSavedPage: b.mutation<any, any>({
      query: (body) => ({ url: '/gaps3/saved-pages', method: 'POST', body }),
      invalidatesTags: ['SavedPage'],
    }),
    validateImport: b.mutation<any, any>({
      query: (body) => ({ url: '/gaps3/import-batches/validate', method: 'POST', body }),
    }),
    commitImport: b.mutation<any, string>({
      query: (id) => ({ url: `/gaps3/import-batches/${id}/commit`, method: 'POST' }),
    }),
    rollbackImport: b.mutation<any, string>({
      query: (id) => ({ url: `/gaps3/import-batches/${id}/rollback`, method: 'POST' }),
    }),
    searchAttachmentText: b.query<any, string>({
      query: (q) => `/gaps3/attachments/search-text?q=${encodeURIComponent(q)}`,
      providesTags: ['Attachment'],
    }),
    indexAttachmentText: b.mutation<any, any>({
      query: (body) => ({ url: '/gaps3/attachments/index-text', method: 'POST', body }),
      invalidatesTags: ['Attachment'],
    }),
    getDecisionTables: b.query<any[], void>({
      query: () => '/gaps3/decision-tables',
      providesTags: ['DecisionTable'],
    }),
    addDecisionTable: b.mutation<any, any>({
      query: (body) => ({ url: '/gaps3/decision-tables', method: 'POST', body }),
      invalidatesTags: ['DecisionTable'],
    }),
    evaluateDecisionTable: b.mutation<any, any>({
      query: ({ id, facts }: any) => ({ url: `/gaps3/decision-tables/${id}/evaluate`, method: 'POST', body: { facts } }),
      invalidatesTags: ['DecisionTable'],
    }),
    getOcInvoices: b.query<any[], void>({
      query: () => '/gaps3/outside-counsel-invoices',
      providesTags: ['OcInvoice'],
    }),
    addOcInvoice: b.mutation<any, any>({
      query: (body) => ({ url: '/gaps3/outside-counsel-invoices', method: 'POST', body }),
      invalidatesTags: ['OcInvoice'],
    }),
    approveOcInvoice: b.mutation<any, string>({
      query: (id) => ({ url: `/gaps3/outside-counsel-invoices/${id}/approve`, method: 'POST' }),
      invalidatesTags: ['OcInvoice'],
    }),
  }),
});

export const {
  useGetMyOrgsQuery,
  useSelectOrganizationMutation,
  useGetOidcConfigQuery,
  useUpdateOidcConfigMutation,
  useGetAuthorityDocsQuery,
  useAddAuthorityDocMutation,
  useGetGrcQuestionnairesQuery,
  useAddGrcQuestionnaireMutation,
  useRespondGrcQuestionnaireMutation,
  useGetPrivacyAssessmentsQuery,
  useAddPrivacyAssessmentMutation,
  useGetCrisisEventsQuery,
  useAddCrisisEventMutation,
  useCrisisActionMutation,
  useEnrollSensorMutation,
  useGetPatchCampaignsQuery,
  useAddPatchCampaignMutation,
  useSchedulePatchesMutation,
  useImportCloudOtFindingsMutation,
  usePromoteEmployeeMutation,
  useImportVulnsDedupeMutation,
  useGetSavedPagesQuery,
  useAddSavedPageMutation,
  useValidateImportMutation,
  useCommitImportMutation,
  useRollbackImportMutation,
  useSearchAttachmentTextQuery,
  useIndexAttachmentTextMutation,
  useGetDecisionTablesQuery,
  useAddDecisionTableMutation,
  useEvaluateDecisionTableMutation,
  useGetOcInvoicesQuery,
  useAddOcInvoiceMutation,
  useApproveOcInvoiceMutation,
} = gaps3Api;
