import type { OrderStatus } from "./orders";

export interface Client {
  id: string;
  name: string;
  mobile: string;
  status: boolean;
}

export interface ClientStats {
  totalOrders: number;
  totalSpentCents: number;
  lastOrderDate: string | null;
}

export interface ClientOrder {
  id: string;
  deliveryDate: string;
  status: OrderStatus;
  totalPaidCents: number;
  totalValueCents: number;
}

export interface ClientDetail extends Client {
  stats: ClientStats;
  orders: ClientOrder[];
}

export interface ClientDropdownItem {
  id: string;
  name: string;
}

export interface CreateClientInput {
  name: string;
  mobile: string;
}

export interface UpdateClientInput {
  name?: string;
  mobile?: string;
  status?: boolean;
}
