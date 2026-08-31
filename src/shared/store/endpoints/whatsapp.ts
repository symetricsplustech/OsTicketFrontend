import { platformApi } from '../platformApi';

const whatsappApi = platformApi.injectEndpoints({
  endpoints: (b) => ({
    sendWhatsapp: b.mutation<any, { to: string; message: string }>({
      query: (body) => ({ url: '/gaps/messages/whatsapp', method: 'POST', body }),
    }),
  }),
});

export const { useSendWhatsappMutation } = whatsappApi;
