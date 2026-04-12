import { createApiClient } from "./client";
import { Product } from "@/types/products";

export function createProductsApi(token: string) {
  const api = createApiClient(token);

  return {
    getAll: (params?: { search?: string; status?: boolean }) => {
      const search = new URLSearchParams();
      if (params?.search) search.set("search", params.search);
      if (params?.status !== undefined)
        search.set("status", String(params.status));
      const qs = search.toString();
      return api.get<Product[]>(`/products/all${qs ? `?${qs}` : ""}`);
    },

    getById: (id: string) => api.get<Product>(`/products/${id}`),

    create: (formData: FormData) =>
      api.postForm<Product>("/products/new", formData),

    update: (id: string, formData: FormData) =>
      api.putForm<Product>(`/products/${id}`, formData),

    setActive: (id: string) => api.patch<void>(`/products/${id}/active`),

    setInactive: (id: string) => api.patch<void>(`/products/${id}/inactive`),

    deleteImage: (id: string) => api.delete<void>(`/products/${id}/image`),

    delete: (id: string) => api.delete<void>(`/products/${id}`),
  };
}
