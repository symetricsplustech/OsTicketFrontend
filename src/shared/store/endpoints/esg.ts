import { platformApi } from '../platformApi';

const esgApi = platformApi.injectEndpoints({
  endpoints: (b) => ({
    getSupplierEsg: b.query<any[], void>({
      query: () => '/gaps/supplier-esg',
      providesTags: ['SupplierEsg'],
    }),
    addSupplierEsg: b.mutation<any, any>({
      query: (body) => ({ url: '/gaps/supplier-esg', method: 'POST', body }),
      invalidatesTags: ['SupplierEsg'],
    }),
  }),
});

export const {
  useGetSupplierEsgQuery,
  useAddSupplierEsgMutation,
} = esgApi;
