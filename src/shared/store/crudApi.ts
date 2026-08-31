import { platformApi } from './platformApi';

// Generic CRUD hooks for ANY registered entity
export const crudApi = platformApi.injectEndpoints({
  endpoints: (b) => ({
    // List
    getRecords: b.query({
      query: ({ entity, ...params }) => ({
        url: `/crud/${entity}`,
        params,
      }),
      providesTags: (_res: any, _err: any, arg: any) => [{ type: 'Crud' as const, id: arg.entity }],
    }),
    // Single record
    getRecord: b.query({
      query: ({ entity, id }) => `/crud/${entity}/${id}`,
      providesTags: (_res, _err, arg) => [{ type: 'Crud', id: `${arg.entity}:${arg.id}` }],
    }),
    // Create
    createRecord: b.mutation({
      query: ({ entity, body }) => ({ url: `/crud/${entity}`, method: 'POST', body }),
      invalidatesTags: (_res: any, _err: any, arg: any) => [{ type: 'Crud' as const, id: arg.entity }],
    }),
    // Update
    updateRecord: b.mutation({
      query: ({ entity, id, body }) => ({ url: `/crud/${entity}/${id}`, method: 'PUT', body }),
      invalidatesTags: (_res, _err, arg) => [
        { type: 'Crud', id: arg.entity },
        { type: 'Crud', id: `${arg.entity}:${arg.id}` },
        { type: 'Crud', id: 'LIST' },
      ],
    }),
    // Delete
    deleteRecord: b.mutation({
      query: ({ entity, id }) => ({ url: `/crud/${entity}/${id}`, method: 'DELETE' }),
      invalidatesTags: (_res: any, _err: any, arg: any) => [{ type: 'Crud' as const, id: arg.entity }],
    }),
    // Related records
    getRelated: b.query({
      query: ({ entity, id }) => `/crud/${entity}/${id}/related`,
      providesTags: ['Related'],
    }),
    // Entity registry metadata
    getRegistry: b.query({ query: () => '/crud/_registry' }),
  }),
});

export const {
  useGetRecordsQuery,
  useGetRecordQuery,
  useCreateRecordMutation,
  useUpdateRecordMutation,
  useDeleteRecordMutation,
  useGetRelatedQuery,
  useGetRegistryQuery,
} = crudApi;
