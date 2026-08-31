import { platformApi } from '../platformApi';

const filesApi = platformApi.injectEndpoints({
  endpoints: (b) => ({
    signFile: b.mutation<{ token: string; expiresInMinutes: number }, { url: string }>({
      query: (body) => ({ url: '/gaps/files/sign', method: 'POST', body }),
    }),
  }),
});

export const { useSignFileMutation } = filesApi;
