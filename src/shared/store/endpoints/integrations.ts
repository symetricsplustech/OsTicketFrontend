import { platformApi } from '../platformApi';

type ListArg = Record<string, string | undefined> | void;

const integrationsApi = platformApi.injectEndpoints({
  endpoints: (b) => ({
    getConnectors: b.query<any[], void>({
      query: () => '/gaps/connectors',
      providesTags: ['Connector'],
    }),
    addConnector: b.mutation<any, any>({
      query: (body) => ({ url: '/gaps/connectors', method: 'POST', body }),
      invalidatesTags: ['Connector'],
    }),
    testConnector: b.mutation<any, string>({
      query: (id) => ({ url: `/gaps/connectors/${id}/test`, method: 'POST' }),
    }),
    getInboundMessages: b.query<any[], ListArg>({
      query: (arg) => ({ url: '/gaps/inbound-messages', params: (arg || {}) as any }),
      providesTags: ['InboundMessage'],
    }),
    getErpConnections: b.query<any[], void>({
      query: () => '/gaps/erp-connections',
      providesTags: ['ErpConnection'],
    }),
    pushInvoiceToErp: b.mutation<any, { connectionId: string; invoiceId: string }>({
      query: (body) => ({ url: '/gaps/erp-push', method: 'POST', body }),
      invalidatesTags: ['ErpConnection'],
    }),
    getKnowledgeGraph: b.query<any, string>({
      query: (type) => `/gaps/kg?type=${type}`,
      providesTags: ['KnowledgeGraphLite'],
    }),
  }),
});

export const {
  useGetConnectorsQuery,
  useAddConnectorMutation,
  useTestConnectorMutation,
  useGetInboundMessagesQuery,
  useGetErpConnectionsQuery,
  usePushInvoiceToErpMutation,
  useGetKnowledgeGraphQuery,
} = integrationsApi;
