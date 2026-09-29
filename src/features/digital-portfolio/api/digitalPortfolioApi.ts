import { baseApi } from "@shared/api/base";
import type { OperationalResponse, ResourceMutation, ResourceQuery } from "@features/enterprise-operations/api/operationalTypes";
const tag = { type: "ItsmWork" as const, id: "digital-portfolios" };
export const digitalPortfolioApi = baseApi.injectEndpoints({ endpoints: (build) => ({
  listDigitalPortfolios: build.query<OperationalResponse, ResourceQuery>({ query: (params) => ({ url: "/core/cmdb/portfolios", params }), providesTags: [tag] }),
  createDigitalPortfolio: build.mutation<OperationalResponse, ResourceMutation>({ query: ({ body }) => ({ url: "/core/cmdb/portfolios", method: "POST", body }), invalidatesTags: [tag] }),
  updateDigitalPortfolio: build.mutation<OperationalResponse, ResourceMutation>({ query: ({ id, body }) => ({ url: `/core/cmdb/portfolios/${id}`, method: "PUT", body }), invalidatesTags: [tag] }),
  deleteDigitalPortfolio: build.mutation<OperationalResponse, ResourceMutation>({ query: ({ id }) => ({ url: `/core/cmdb/portfolios/${id}`, method: "DELETE" }), invalidatesTags: [tag] }),
}) });
export const { useListDigitalPortfoliosQuery, useCreateDigitalPortfolioMutation, useUpdateDigitalPortfolioMutation, useDeleteDigitalPortfolioMutation } = digitalPortfolioApi;
