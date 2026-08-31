import { platformApi } from '../platformApi';

const shellApi = platformApi.injectEndpoints({
  endpoints: (b) => ({
    getNotifications: b.query<any, void>({
      query: () => '/gaps3/notifications',
      providesTags: ['Notification'],
    }),
    markRead: b.mutation<any, string>({
      query: (id) => ({ url: `/gaps3/notifications/${id}/read`, method: 'PUT' }),
      invalidatesTags: ['Notification'],
    }),
    markAllRead: b.mutation<any, void>({
      query: () => ({ url: '/gaps3/notifications/read-all', method: 'PUT' }),
      invalidatesTags: ['Notification'],
    }),
    globalSearch: b.query<any[], string>({
      query: (q) => `/gaps3/global-search?q=${encodeURIComponent(q)}`,
      providesTags: ['SearchResult'],
    }),
    myApprovals: b.query<any[], void>({
      query: () => '/gaps3/my-approvals',
      providesTags: ['Approval'],
    }),
  }),
});

export const {
  useGetNotificationsQuery,
  useMarkReadMutation,
  useMarkAllReadMutation,
  useGlobalSearchQuery,
  useMyApprovalsQuery,
} = shellApi;
