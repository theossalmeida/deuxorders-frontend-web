import { createApiClient } from "./client";
import {
  Order,
  OrderItem,
  PaginatedOrders,
  CreateOrderInput,
  OrderItemInput,
  UpdateOrderInput,
  OrderItemUpdate,
  PresignedUrlRequest,
  PresignedUrlResponse,
  OrderStatus,
} from "@/types/orders";

export interface OrderUpdateResult {
  order: Order;
  warnings: string[];
}
import { ClientDropdownItem } from "@/types/clients";
import { ProductDropdownItem } from "@/types/products";
import { ItemsResponse, unwrapItemsResponse } from "./client";

interface OrderItemDto {
  productId: string;
  productName: string;
  productSize: string | null;
  observation: string | null;
  massa: string | null;
  sabor: string | null;
  quantity: number;
  paidUnitPrice: number;
  baseUnitPrice: number;
  itemCanceled: boolean;
  totalPaid: number;
  totalValue: number;
}

interface OrderDto {
  id: string;
  deliveryDate: string;
  status: OrderStatus;
  clientId: string;
  clientName: string;
  totalPaid: number;
  totalValue: number;
  references: string[] | null;
  items: OrderItemDto[];
  delivery: string | null;
  paidAt: string | null;
  paidByUserName: string | null;
}

interface PaginatedOrdersDto {
  items: OrderDto[];
  totalCount: number;
  pageNumber: number;
  pageSize: number;
}

interface CreateOrderItemWire {
  productId: string;
  quantity: number;
  unitPrice: number;
  observation?: string;
  massa?: string;
  sabor?: string;
}

interface CreateOrderWire {
  clientId: string;
  deliveryDate: string;
  items: CreateOrderItemWire[];
  references?: string[];
  delivery?: string;
}

interface UpdateOrderItemWire {
  productId: string;
  quantity?: number;
  paidUnitPrice?: number;
  observation?: string;
  massa?: string;
  sabor?: string;
}

interface UpdateOrderWire {
  deliveryDate?: string;
  status?: number;
  items?: UpdateOrderItemWire[];
  references?: string[];
  delivery?: string | null;
}

function mapOrderItem(dto: OrderItemDto): OrderItem {
  return {
    productId: dto.productId,
    productName: dto.productName,
    productSize: dto.productSize,
    observation: dto.observation,
    massa: dto.massa,
    sabor: dto.sabor,
    quantity: dto.quantity,
    paidUnitPriceCents: dto.paidUnitPrice,
    baseUnitPriceCents: dto.baseUnitPrice,
    itemCanceled: dto.itemCanceled,
    totalPaidCents: dto.totalPaid,
    totalValueCents: dto.totalValue,
  };
}

export function mapOrder(dto: OrderDto): Order {
  return {
    id: dto.id,
    deliveryDate: dto.deliveryDate,
    status: dto.status,
    clientId: dto.clientId,
    clientName: dto.clientName,
    totalPaidCents: dto.totalPaid,
    totalValueCents: dto.totalValue,
    references: dto.references ?? [],
    items: dto.items.map(mapOrderItem),
    delivery: dto.delivery,
    paidAt: dto.paidAt,
    paidByUserName: dto.paidByUserName,
  };
}

function mapPaginatedOrders(dto: PaginatedOrdersDto): PaginatedOrders {
  return {
    items: dto.items.map(mapOrder),
    totalCount: dto.totalCount,
    pageNumber: dto.pageNumber,
    pageSize: dto.pageSize,
  };
}

function toCreateOrderItemWire(input: OrderItemInput): CreateOrderItemWire {
  return {
    productId: input.productId,
    quantity: input.quantity,
    unitPrice: input.unitPriceCents,
    observation: input.observation,
    massa: input.massa,
    sabor: input.sabor,
  };
}

function toCreateOrderWire(input: CreateOrderInput): CreateOrderWire {
  return {
    clientId: input.clientId,
    deliveryDate: input.deliveryDate,
    items: input.items.map(toCreateOrderItemWire),
    references: input.references,
    delivery: input.delivery,
  };
}

function toUpdateOrderItemWire(input: OrderItemUpdate): UpdateOrderItemWire {
  return {
    productId: input.productId,
    quantity: input.quantity,
    paidUnitPrice: input.paidUnitPriceCents,
    observation: input.observation,
    massa: input.massa,
    sabor: input.sabor,
  };
}

function toUpdateOrderWire(input: UpdateOrderInput): UpdateOrderWire {
  return {
    deliveryDate: input.deliveryDate,
    status: input.status,
    items: input.items?.map(toUpdateOrderItemWire),
    references: input.references,
    delivery: input.delivery,
  };
}

export function createOrdersApi(token: string) {
  const api = createApiClient(token);

  return {
    getAll: async (params?: {
      page?: number;
      size?: number;
      status?: OrderStatus;
      from?: string;
      to?: string;
      search?: string;
    }) => {
      const qs = new URLSearchParams();
      if (params?.size) qs.set("size", String(params.size));
      if (params?.page) qs.set("page", String(params.page));
      if (params?.status) qs.set("status", params.status);
      if (params?.from) qs.set("from", params.from);
      if (params?.to) qs.set("to", params.to);
      if (params?.search) qs.set("search", params.search);

      const dto = await api.get<PaginatedOrdersDto>(`/orders/all?${qs.toString()}`);
      return mapPaginatedOrders(dto);
    },

    getById: async (id: string) => mapOrder(await api.get<OrderDto>(`/orders/${id}`)),

    create: async (input: CreateOrderInput) =>
      mapOrder(await api.post<OrderDto>("/orders/new", toCreateOrderWire(input))),

    update: async (id: string, input: UpdateOrderInput): Promise<OrderUpdateResult> => {
      const raw = await api.put<OrderDto | { response: OrderDto; warnings: string[] }>(
        `/orders/${id}`,
        toUpdateOrderWire(input)
      );
      if ("response" in raw && "warnings" in raw) {
        return { order: mapOrder(raw.response), warnings: raw.warnings };
      }
      return { order: mapOrder(raw as OrderDto), warnings: [] };
    },

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

    markAsPaid: async (id: string) =>
      mapOrder(await api.patch<OrderDto>(`/orders/${id}/pay`)),

    unmarkAsPaid: async (id: string, reason: string) =>
      mapOrder(await api.patch<OrderDto>(`/orders/${id}/unpay`, { reason })),

    getPresignedUrl: (req: PresignedUrlRequest) =>
      api.post<PresignedUrlResponse>("/orders/references/presigned-url", req),

    deleteReference: async (orderId: string, objectKey: string) =>
      mapOrder(
        await api.delete<OrderDto>(`/orders/${orderId}/references`, { objectKey }),
      ),

    getClientsDropdown: () =>
      api.get<ClientDropdownItem[]>("/clients/dropdown?status=true"),

    getProductsDropdown: async (): Promise<ProductDropdownItem[]> => {
      const raw = await api.get<
        { id: string; name: string; price: number; category: string | null }[]
        | ItemsResponse<{ id: string; name: string; price: number; category: string | null }>
      >("/products/all?status=true&size=200");
      return unwrapItemsResponse(raw).map((p) => ({
        id: p.id,
        name: p.name,
        priceCents: p.price,
        category: p.category,
      }));
    },
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
