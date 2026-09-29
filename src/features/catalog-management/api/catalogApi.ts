import { baseApi } from "@shared/api/base";
import type { ApiListResponse, ApiRecordResponse, ListParams } from "@shared/api/itsmTypes";

export type CatalogResource = "catalogs" | "categories" | "items" | "variable-sets" | "fulfillment-plans";
export type CartResponse = { success?: boolean; data: Record<string, unknown> & { _id?: string; id?: string; items?: Array<Record<string, unknown>> } };

const catalogTag = (resource: CatalogResource) => ({ type: "ItsmWork" as const, id: `catalog/${resource}` });

export const catalogApi = baseApi.injectEndpoints({
  endpoints: (build) => ({
    listCatalogRecords: build.query<ApiListResponse, ListParams & { resource: CatalogResource }>({
      query: ({ resource, ...params }) => ({ url: `/core/requests/${resource}`, params }),
      providesTags: (_result, _error, { resource }) => [catalogTag(resource)],
    }),
    createCatalogRecord: build.mutation<ApiRecordResponse, { resource: CatalogResource; body: Record<string, unknown> }>({
      query: ({ resource, body }) => ({ url: `/core/requests/${resource}`, method: "POST", body }),
      invalidatesTags: (_result, _error, { resource }) => [catalogTag(resource)],
    }),
    updateCatalogRecord: build.mutation<ApiRecordResponse, { resource: CatalogResource; id: string; body: Record<string, unknown> }>({
      query: ({ resource, id, body }) => ({ url: `/core/requests/${resource}/${id}`, method: "PUT", body }),
      invalidatesTags: (_result, _error, { resource }) => [catalogTag(resource)],
    }),
    deleteCatalogRecord: build.mutation<{ success?: boolean }, { resource: CatalogResource; id: string }>({
      query: ({ resource, id }) => ({ url: `/core/requests/${resource}/${id}`, method: "DELETE" }),
      invalidatesTags: (_result, _error, { resource }) => [catalogTag(resource)],
    }),
    publishCatalogItem: build.mutation<ApiRecordResponse, { id: string }>({
      query: ({ id }) => ({ url: `/core/requests/items/${id}/publish`, method: "POST" }),
      invalidatesTags: [catalogTag("items")],
    }),
    getMyCart: build.query<CartResponse, void>({ query: () => "/core/requests/cart", providesTags: [{ type: "ItsmWork", id: "catalog/cart" }] }),
    addCatalogItemToCart: build.mutation<CartResponse, { cartId: string; itemId: string; quantity: number }>({ query: ({ cartId, itemId, quantity }) => ({ url: `/core/requests/cart/${cartId}/items`, method: "POST", body: { itemId, catalogItemId: itemId, quantity } }), invalidatesTags: [{ type: "ItsmWork", id: "catalog/cart" }] }),
    updateCatalogCartItem: build.mutation<CartResponse, { cartItemId: string; quantity: number }>({ query: ({ cartItemId, quantity }) => ({ url: `/core/requests/cart/items/${cartItemId}`, method: "PUT", body: { quantity } }), invalidatesTags: [{ type: "ItsmWork", id: "catalog/cart" }] }),
    removeCatalogCartItem: build.mutation<CartResponse, { cartItemId: string }>({ query: ({ cartItemId }) => ({ url: `/core/requests/cart/items/${cartItemId}`, method: "DELETE" }), invalidatesTags: [{ type: "ItsmWork", id: "catalog/cart" }] }),
    checkoutCatalogCart: build.mutation<ApiRecordResponse, { cartId: string }>({ query: ({ cartId }) => ({ url: `/core/requests/cart/${cartId}/checkout`, method: "POST", body: {} }), invalidatesTags: [{ type: "ItsmWork", id: "catalog/cart" }, { type: "ItsmWork", id: "requests/reqs" }] }),
  }),
});

export const { useListCatalogRecordsQuery, useCreateCatalogRecordMutation, useUpdateCatalogRecordMutation, useDeleteCatalogRecordMutation, usePublishCatalogItemMutation, useGetMyCartQuery, useAddCatalogItemToCartMutation, useUpdateCatalogCartItemMutation, useRemoveCatalogCartItemMutation, useCheckoutCatalogCartMutation } = catalogApi;
