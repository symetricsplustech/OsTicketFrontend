import { platformApi } from '../platformApi';

const complianceApi = platformApi.injectEndpoints({
  endpoints: (b) => ({
    getRetentionPolicies: b.query<any[], void>({
      query: () => '/gaps/retention-policies',
      providesTags: ['RetentionPolicy'],
    }),
    addRetentionPolicy: b.mutation<any, any>({
      query: (body) => ({ url: '/gaps/retention-policies', method: 'POST', body }),
      invalidatesTags: ['RetentionPolicy'],
    }),
    deleteRetentionPolicy: b.mutation<void, string>({
      query: (id) => ({ url: `/gaps/retention-policies/${id}`, method: 'DELETE' }),
      invalidatesTags: ['RetentionPolicy'],
    }),
    runRetentionPolicy: b.mutation<any, { id: string; confirmToken: string }>({
      query: ({ id, confirmToken }) => ({ url: `/gaps/retention-policies/${id}/execute`, method: 'POST', body: { confirmToken } }),
      invalidatesTags: ['RetentionPolicy'],
    }),
    getDsar: b.query<any[], void>({
      query: () => '/gaps/dsar',
      providesTags: ['Dsar'],
    }),
    createDsar: b.mutation<any, any>({
      query: (body) => ({ url: '/gaps/dsar', method: 'POST', body }),
      invalidatesTags: ['Dsar'],
    }),
    exportDsar: b.mutation<any, string>({
      query: (id) => ({ url: `/gaps/dsar/${id}/export`, method: 'POST' }),
      invalidatesTags: ['Dsar'],
    }),
    getFieldMasking: b.query<any[], void>({
      query: () => '/gaps/field-masking',
      providesTags: ['FieldMasking'],
    }),
    addFieldMasking: b.mutation<any, any>({
      query: (body) => ({ url: '/gaps/field-masking', method: 'POST', body }),
      invalidatesTags: ['FieldMasking'],
    }),
    getIpAllowlist: b.query<any, void>({
      query: () => '/gaps/ip-allowlist',
      providesTags: ['IpAllowlist'],
    }),
    updateIpAllowlist: b.mutation<any, { cidrs: string[] }>({
      query: (body) => ({ url: '/gaps/ip-allowlist', method: 'PUT', body }),
      invalidatesTags: ['IpAllowlist'],
    }),
    getPasswordPolicy: b.query<any, void>({
      query: () => '/gaps/password-policy',
      providesTags: ['PasswordPolicy'],
    }),
    updatePasswordPolicy: b.mutation<any, any>({
      query: (body) => ({ url: '/gaps/password-policy', method: 'PUT', body }),
      invalidatesTags: ['PasswordPolicy'],
    }),
    validatePassword: b.mutation<{ valid: boolean; errors: string[] }, string>({
      query: (password) => ({ url: '/gaps/password-policy/validate', method: 'POST', body: { password } }),
    }),
    getBackupTests: b.query<any[], void>({
      query: () => '/gaps/backup-tests',
      providesTags: ['BackupTest'],
    }),
    recordBackupTest: b.mutation<any, any>({
      query: (body) => ({ url: '/gaps/backup-tests', method: 'POST', body }),
      invalidatesTags: ['BackupTest'],
    }),
  }),
});

export const {
  useGetRetentionPoliciesQuery,
  useAddRetentionPolicyMutation,
  useDeleteRetentionPolicyMutation,
  useRunRetentionPolicyMutation,
  useGetDsarQuery,
  useCreateDsarMutation,
  useExportDsarMutation,
  useGetFieldMaskingQuery,
  useAddFieldMaskingMutation,
  useGetIpAllowlistQuery,
  useUpdateIpAllowlistMutation,
  useGetPasswordPolicyQuery,
  useUpdatePasswordPolicyMutation,
  useValidatePasswordMutation,
  useGetBackupTestsQuery,
  useRecordBackupTestMutation,
} = complianceApi;
