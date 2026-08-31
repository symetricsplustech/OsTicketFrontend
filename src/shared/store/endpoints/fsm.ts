import { platformApi } from '../platformApi';

const fsmApi = platformApi.injectEndpoints({
  endpoints: (b) => ({
    getContractors: b.query<any[], void>({
      query: () => '/gaps/contractors',
      providesTags: ['Contractor'],
    }),
    addContractor: b.mutation<any, any>({
      query: (body) => ({ url: '/gaps/contractors', method: 'POST', body }),
      invalidatesTags: ['Contractor'],
    }),
    assignContractor: b.mutation<any, any>({
      query: (body) => ({ url: '/gaps/contractor-assignments', method: 'POST', body }),
      invalidatesTags: ['ContractorAssignment'],
    }),
    completeAssignment: b.mutation<any, { id: string; performanceScore: number }>({
      query: ({ id, performanceScore }) => ({ url: `/gaps/contractor-assignments/${id}/complete`, method: 'POST', body: { performanceScore } }),
      invalidatesTags: ['ContractorAssignment', 'Contractor'],
    }),
    getContractorsV2: b.query<any[], void>({
      query: () => '/gaps2/contractors',
      providesTags: ['Contractor'],
    }),
    assignContractorV2: b.mutation<any, any>({
      query: (body) => ({ url: '/gaps2/contractor-assignments', method: 'POST', body }),
      invalidatesTags: ['ContractorAssignment'],
    }),
    getDispatcherBoard: b.query<any, void>({
      query: () => '/gaps3/dispatcher/board',
      providesTags: ['DispatcherBoard'],
    }),
    routeSequence: b.mutation<any, { stops: Array<{ lat: number; lng: number; label: string }> }>({
      query: (body) => ({ url: '/gaps2/work-orders/route-sequence', method: 'POST', body }),
    }),
    geofenceCheckin: b.mutation<any, { id: string; lat: number; lng: number }>({
      query: ({ id, ...body }) => ({ url: `/gaps2/work-orders/${id}/geofence-checkin`, method: 'POST', body }),
    }),
    consumePart: b.mutation<any, any>({
      query: ({ id, ...body }) => ({ url: `/gaps2/work-orders/${id}/consume-part`, method: 'POST', body }),
    }),
    getFtfRate: b.query<any, void>({
      query: () => '/gaps2/work-orders/ftf-rate',
      providesTags: ['WorkOrder'],
    }),
  }),
});

export const {
  useGetContractorsQuery,
  useAddContractorMutation,
  useAssignContractorMutation,
  useCompleteAssignmentMutation,
  useGetContractorsV2Query,
  useAssignContractorV2Mutation,
  useGetDispatcherBoardQuery,
  useRouteSequenceMutation,
  useGeofenceCheckinMutation,
  useConsumePartMutation,
  useGetFtfRateQuery,
} = fsmApi;
