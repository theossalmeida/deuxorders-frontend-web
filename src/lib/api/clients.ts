import { createApiClient, ItemsResponse, unwrapItemsResponse } from "./client";
import { Client, ClientDetail, CreateClientInput, UpdateClientInput } from "@/types/clients";
import type { OrderStatus } from "@/types/orders";

interface ClientDetailDto {
  id: string;
  name: string;
  mobile: string;
  status: boolean;
  stats: {
    totalOrders: number;
    totalSpent: number;
    lastOrderDate: string | null;
  };
  orders: {
    items: Array<{
      id: string;
      deliveryDate: string;
      status: OrderStatus;
      totalPaid: number;
      totalValue: number;
    }>;
  };
}

function mapClientDetail(dto: ClientDetailDto): ClientDetail {
  return {
    id: dto.id,
    name: dto.name,
    mobile: dto.mobile,
    status: dto.status,
    stats: {
      totalOrders: dto.stats.totalOrders,
      totalSpentCents: dto.stats.totalSpent,
      lastOrderDate: dto.stats.lastOrderDate,
    },
    orders: dto.orders.items.map((o) => ({
      id: o.id,
      deliveryDate: o.deliveryDate,
      status: o.status,
      totalPaidCents: o.totalPaid,
      totalValueCents: o.totalValue,
    })),
  };
}

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

      return api
        .get<Client[] | ItemsResponse<Client>>(`/clients/all?${qs}`)
        .then(unwrapItemsResponse);
    },

    getById: async (id: string) =>
      mapClientDetail(await api.get<ClientDetailDto>(`/clients/${id}?orders=true`)),

    create: (input: CreateClientInput) =>
      api.post<Client>("/clients/new", input),

    update: (id: string, input: UpdateClientInput) =>
      api.put<Client>(`/clients/${id}`, input),

    setActive: (id: string) => api.patch<void>(`/clients/${id}/active`),

    setInactive: (id: string) => api.patch<void>(`/clients/${id}/inactive`),

    delete: (id: string) => api.delete<void>(`/clients/${id}`),
  };
}
