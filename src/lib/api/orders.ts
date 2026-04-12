import { createApiClient } from "./client";
import {
  Order,
  PaginatedOrders,
  CreateOrderInput,
  UpdateOrderInput,
  PresignedUrlRequest,
  PresignedUrlResponse,
  OrderStatus,
} from "@/types/orders";
import { ClientDropdownItem } from "@/types/clients";
import { ProductDropdownItem } from "@/types/products";

export function createOrdersApi(token: string) {
  const api = createApiClient(token);

  return {
    getAll: (params?: {
      page?: number;
      size?: number;
      status?: OrderStatus;
    }) => {
      const search = new URLSearchParams();
      if (params?.page) search.set("page", String(params.page));
      if (params?.size) search.set("size", String(params.size));
      if (params?.status) search.set("status", params.status);
      const qs = search.toString();
      return api.get<PaginatedOrders>(`/orders/all${qs ? `?${qs}` : ""}`);
    },

    getById: (id: string) => api.get<Order>(`/orders/${id}`),

    create: (input: CreateOrderInput) => api.post<Order>("/orders/new", input),

    update: (id: string, input: UpdateOrderInput) =>
      api.put<Order>(`/orders/${id}`, input),

    complete: (id: string) => api.patch<void>(`/orders/${id}/complete`),

    cancel: (id: string) => api.patch<void>(`/orders/${id}/cancel`),

    cancelItem: (orderId: string, productId: string) =>
      api.patch<void>(`/orders/${orderId}/items/${productId}/cancel`),

    updateItemQuantity: (
      orderId: string,
      productId: string,
      increment: number
    ) => api.patch<void>(`/orders/${orderId}/items/${productId}/quantity`, { increment }),

    delete: (id: string) => api.delete<void>(`/orders/${id}`),

    getPresignedUrl: (req: PresignedUrlRequest) =>
      api.post<PresignedUrlResponse>("/orders/references/presigned-url", req),

    deleteReference: (orderId: string, objectKey: string) =>
      api.delete<Order>(`/orders/${orderId}/references`, { objectKey }),

    getClientsDropdown: () =>
      api.get<ClientDropdownItem[]>("/clients/dropdown?status=true"),

    getProductsDropdown: () =>
      api.get<ProductDropdownItem[]>("/products/dropdown?status=true"),
  };
}

export async function uploadToPresignedUrl(
  uploadUrl: string,
  data: Blob,
  contentType: string
): Promise<void> {
  const res = await fetch(uploadUrl, {
    method: "PUT",
    headers: { "Content-Type": contentType },
    body: data,
  });

  if (!res.ok) {
    throw new Error("Falha ao enviar imagem de referência.");
  }
}
