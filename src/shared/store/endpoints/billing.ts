import { platformApi } from '../platformApi';

const billingApi = platformApi.injectEndpoints({
  endpoints: (b) => ({
    getInvoices: b.query<any[], void>({
      query: () => '/gaps/invoices',
      providesTags: ['Invoice'],
    }),
    markInvoicePaid: b.mutation<any, string>({
      query: (id) => ({ url: `/gaps/invoices/${id}/pay`, method: 'POST' }),
      invalidatesTags: ['Invoice'],
    }),
  }),
});

export const { useGetInvoicesQuery, useMarkInvoicePaidMutation } = billingApi;
