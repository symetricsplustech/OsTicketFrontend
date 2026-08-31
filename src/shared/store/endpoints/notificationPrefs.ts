import { platformApi } from '../platformApi';

const notificationPrefsApi = platformApi.injectEndpoints({
  endpoints: (b) => ({
    getNotificationPrefs: b.query<any, void>({
      query: () => '/gaps/notification-prefs',
      providesTags: ['NotificationPrefs'],
    }),
    updateNotificationPrefs: b.mutation<any, any>({
      query: (body) => ({ url: '/gaps/notification-prefs', method: 'PUT', body }),
      invalidatesTags: ['NotificationPrefs'],
    }),
  }),
});

export const {
  useGetNotificationPrefsQuery,
  useUpdateNotificationPrefsMutation,
} = notificationPrefsApi;
