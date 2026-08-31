import { platformApi } from '../platformApi';

const superadminApi = platformApi.injectEndpoints({
  endpoints: (b) => ({
    getSaDashboard: b.query<any, void>({
      query: () => '/superadmin/dashboard',
      providesTags: ['SaDashboard'],
    }),
    getSaStats: b.query<any, void>({
      query: () => '/superadmin/stats',
      providesTags: ['SaDashboard'],
    }),
    getTenants: b.query<any, { page?: number; limit?: number; status?: string; search?: string }>({
      query: (params) => ({ url: '/superadmin/companies', params: params as any }),
      providesTags: ['SaTenant'],
    }),
    getTenant: b.query<any, string>({
      query: (id) => `/superadmin/companies/${id}`,
      providesTags: (_r, _e, id) => [{ type: 'SaTenant' as const, id }],
    }),
    getTenantStructure: b.query<any, string>({
      query: (id) => `/superadmin/companies/${id}/structure`,
      providesTags: (_r, _e, id) => [{ type: 'SaTenant' as const, id }],
    }),
    createTenant: b.mutation<any, any>({
      query: (body) => ({ url: '/superadmin/companies', method: 'POST', body }),
      invalidatesTags: ['SaTenant', 'SaDashboard'],
    }),
    updateTenant: b.mutation<any, { id: string; body: any }>({
      query: ({ id, ...body }) => ({ url: `/superadmin/companies/${id}`, method: 'PUT', body }),
      invalidatesTags: ['SaTenant'],
    }),
    deleteTenant: b.mutation<any, string>({
      query: (id) => ({ url: `/superadmin/companies/${id}`, method: 'DELETE' }),
      invalidatesTags: ['SaTenant', 'SaDashboard'],
    }),
    setTenantStatus: b.mutation<any, { id: string; status: string }>({
      query: ({ id, ...body }) => ({ url: `/superadmin/companies/${id}/status`, method: 'PUT', body }),
      invalidatesTags: ['SaTenant'],
    }),
    setTenantPlan: b.mutation<any, { id: string; planId: string }>({
      query: ({ id, ...body }) => ({ url: `/superadmin/companies/${id}/plan`, method: 'PUT', body }),
      invalidatesTags: ['SaTenant'],
    }),
    updateTenantModules: b.mutation<any, { id: string; modules: string[] }>({
      query: ({ id, modules }) => ({ url: `/superadmin/companies/${id}/modules`, method: 'PUT', body: { modules } }),
      invalidatesTags: ['SaTenant'],
    }),
    impersonateTenant: b.mutation<any, { companyId: string }>({
      query: (body) => ({ url: '/superadmin/impersonate', method: 'POST', body }),
    }),
    getSaPlans: b.query<any[], void>({
      query: () => '/superadmin/plans',
      transformResponse: (res: any) => res?.data ?? [],
      providesTags: ['SaPlan'],
    }),
    createSaPlan: b.mutation<any, any>({
      query: (body) => ({ url: '/superadmin/plans', method: 'POST', body }),
      invalidatesTags: ['SaPlan'],
    }),
    updateSaPlan: b.mutation<any, { id: string; body: any }>({
      query: ({ id, ...body }) => ({ url: `/superadmin/plans/${id}`, method: 'PUT', body }),
      invalidatesTags: ['SaPlan'],
    }),
    deleteSaPlan: b.mutation<any, string>({
      query: (id) => ({ url: `/superadmin/plans/${id}`, method: 'DELETE' }),
      invalidatesTags: ['SaPlan'],
    }),
    getSaAuditLogs: b.query<any, { page?: number; limit?: number; action?: string; companyId?: string; search?: string }>({
      query: (params) => ({ url: '/superadmin/audit-logs', params: params as any }),
      providesTags: ['SaAudit'],
    }),
    getSaNotifications: b.query<any, void>({
      query: () => '/superadmin/notifications',
      providesTags: ['SaNotification'],
    }),
    getSaAdmins: b.query<any, void>({
      query: () => '/superadmin/admins',
      providesTags: ['SaAdmin'],
    }),
    createSaAdmin: b.mutation<any, any>({
      query: (body) => ({ url: '/superadmin/admins', method: 'POST', body }),
      invalidatesTags: ['SaAdmin'],
    }),
    updateSaAdmin: b.mutation<any, { id: string; body: any }>({
      query: ({ id, ...body }) => ({ url: `/superadmin/admins/${id}`, method: 'PUT', body }),
      invalidatesTags: ['SaAdmin'],
    }),
    deleteSaAdmin: b.mutation<any, string>({
      query: (id) => ({ url: `/superadmin/admins/${id}`, method: 'DELETE' }),
      invalidatesTags: ['SaAdmin'],
    }),
    getSaOperationsHealth: b.query<any, void>({
      query: () => '/superadmin/operations/health',
      providesTags: ['SaOperations'],
    }),
    getSaOperationsJobs: b.query<any, { page?: number; limit?: number }>({
      query: (params) => ({ url: '/superadmin/operations/jobs', params: params as any }),
      providesTags: ['SaOperations'],
    }),
    getSaModules: b.query<any, void>({
      query: () => '/superadmin/modules',
      providesTags: ['SaModule'],
    }),
    getSaSecurityRoles: b.query<any, void>({
      query: () => '/superadmin/security/privileged-roles',
      providesTags: ['SaSecurity'],
    }),
    forceLogout: b.mutation<any, { userId: string; reason?: string }>({
      query: (body) => ({ url: '/superadmin/security/force-logout', method: 'POST', body }),
      invalidatesTags: ['SaSecurity'],
    }),
  }),
});

export const {
  useGetSaDashboardQuery,
  useGetSaStatsQuery,
  useGetTenantsQuery,
  useGetTenantQuery,
  useGetTenantStructureQuery,
  useCreateTenantMutation,
  useUpdateTenantMutation,
  useDeleteTenantMutation,
  useSetTenantStatusMutation,
  useSetTenantPlanMutation,
  useUpdateTenantModulesMutation,
  useImpersonateTenantMutation,
  useGetSaPlansQuery,
  useCreateSaPlanMutation,
  useUpdateSaPlanMutation,
  useDeleteSaPlanMutation,
  useGetSaAuditLogsQuery,
  useGetSaNotificationsQuery,
  useGetSaAdminsQuery,
  useCreateSaAdminMutation,
  useUpdateSaAdminMutation,
  useDeleteSaAdminMutation,
  useGetSaOperationsHealthQuery,
  useGetSaOperationsJobsQuery,
  useGetSaModulesQuery,
  useGetSaSecurityRolesQuery,
  useForceLogoutMutation,
} = superadminApi;