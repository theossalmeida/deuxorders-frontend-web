import { createApiClient } from "./client";
import { Client, CreateClientInput, UpdateClientInput } from "@/types/clients";

export function createClientsApi(token: string) {
  const api = createApiClient(token);

  return {
    getAll: (params?: { search?: string; status?: boolean }) => {
      const search = new URLSearchParams();
      if (params?.search) search.set("search", params.search);
      if (params?.status !== undefined)
        search.set("status", String(params.status));
      const qs = search.toString();
      return api.get<Client[]>(`/clients/all${qs ? `?${qs}` : ""}`);
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
