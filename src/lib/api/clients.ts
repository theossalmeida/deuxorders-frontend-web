import { createApiClient, ItemsResponse, unwrapItemsResponse } from "./client";
import { Client, CreateClientInput, UpdateClientInput } from "@/types/clients";

export function createClientsApi(token: string) {
  const api = createApiClient(token);

  return {
    getAll: (params?: { search?: string; status?: boolean; size?: number }) => {
      const searchParams = new URLSearchParams();
      
      const pageSize = params?.size || 100;
      searchParams.set("size", String(pageSize));

      if (params?.search) searchParams.set("search", params.search);
      if (params?.status !== undefined)
        searchParams.set("status", String(params.status));

      const qs = searchParams.toString();
      
      // 3. A interpolação agora usa apenas a query string construída
      return api
        .get<Client[] | ItemsResponse<Client>>(`/clients/all?${qs}`)
        .then(unwrapItemsResponse);
    },

    getById: (id: string) => api.get<Client>(`/clients/${id}`),

    create: (input: CreateClientInput) =>
      api.post<Client>("/clients/new", input),

    update: (id: string, input: UpdateClientInput) =>
      api.put<Client>(`/clients/${id}`, input),

    setActive: (id: string) => api.patch<void>(`/clients/${id}/active`),

    setInactive: (id: string) => api.patch<void>(`/clients/${id}/inactive`),

    delete: (id: string) => api.delete<void>(`/clients/${id}`),
  };
}
