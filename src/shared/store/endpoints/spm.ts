import { platformApi } from '../platformApi';

type ListArg = Record<string, string | undefined> | void;

const spmApi = platformApi.injectEndpoints({
  endpoints: (b) => ({
    getOkrs: b.query<any[], void>({
      query: () => '/gaps/okrs',
      providesTags: ['Okr'],
    }),
    addOkr: b.mutation<any, any>({
      query: (body) => ({ url: '/gaps/okrs', method: 'POST', body }),
      invalidatesTags: ['Okr'],
    }),
    updateKeyResult: b.mutation<any, { id: string; krIndex: number; current: number }>({
      query: ({ id, ...body }) => ({ url: `/gaps/okrs/${id}/kr`, method: 'PUT', body }),
      invalidatesTags: ['Okr'],
    }),
    getSprints: b.query<any[], ListArg>({
      query: (arg) => ({ url: '/gaps/sprints', params: (arg || {}) as any }),
      providesTags: ['Sprint'],
    }),
    addSprint: b.mutation<any, any>({
      query: (body) => ({ url: '/gaps/sprints', method: 'POST', body }),
      invalidatesTags: ['Sprint'],
    }),
    sprintAddTask: b.mutation<any, { id: string; taskRef: string }>({
      query: ({ id, taskRef }) => ({ url: `/gaps/sprints/${id}/tasks`, method: 'POST', body: { taskRef } }),
      invalidatesTags: ['Sprint'],
    }),
    getRateCards: b.query<any[], void>({
      query: () => '/gaps/rate-cards',
      providesTags: ['RateCard'],
    }),
    addRateCard: b.mutation<any, any>({
      query: (body) => ({ url: '/gaps/rate-cards', method: 'POST', body }),
      invalidatesTags: ['RateCard'],
    }),
  }),
});

export const {
  useGetOkrsQuery,
  useAddOkrMutation,
  useUpdateKeyResultMutation,
  useGetSprintsQuery,
  useAddSprintMutation,
  useSprintAddTaskMutation,
  useGetRateCardsQuery,
  useAddRateCardMutation,
} = spmApi;
