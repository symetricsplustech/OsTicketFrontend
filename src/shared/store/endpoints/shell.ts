import { platformApi } from '../platformApi';

const shellApi = platformApi.injectEndpoints({
  endpoints: (b) => ({
    getNotifications: b.query<{ items: any[]; unread: number }, void>({
      query: () => '/users/notifications',
      transformResponse: (response: { items?: any[]; unread?: number }) => ({
        items: response.items ?? [],
        unread: response.unread ?? 0,
      }),
      providesTags: ['Notification'],
    }),
    markRead: b.mutation<any, string>({
      query: (id) => ({ url: `/users/notifications/${id}/read`, method: 'PUT' }),
      invalidatesTags: ['Notification'],
    }),
    markAllRead: b.mutation<any, void>({
      query: () => ({ url: '/users/notifications/read', method: 'PUT' }),
      invalidatesTags: ['Notification'],
    }),
    globalSearch: b.query<any[], string>({
      query: (q) => ({ url: '/search', params: { q } }),
      transformResponse: (response: { results?: Array<{ items?: any[] }> } | any[]) =>
        Array.isArray(response)
          ? response
          : (response.results ?? []).flatMap((section) => section.items ?? []),
      providesTags: ['SearchResult'],
    }),
    myApprovals: b.query<any, void>({
      query: () => '/core/approvals/pending',
      transformResponse: (response: { approvals?: any[] } | any[]) =>
        Array.isArray(response) ? response : response.approvals ?? [],
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
