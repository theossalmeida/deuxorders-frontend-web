export type OrderStatus =
  | "Pending"
  | "Completed"
  | "Canceled"
  | "Received"
  | "Preparing"
  | "WaitingPickupOrDelivery";

export interface OrderItem {
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

export interface Order {
  id: string;
  deliveryDate: string;
  status: OrderStatus;
  clientId: string;
  clientName: string;
  totalPaid: number;
  totalValue: number;
  references: string[];
  items: OrderItem[];
}

export interface PaginatedOrders {
  items: Order[];
  totalCount: number;
  pageNumber: number;
  pageSize: number;
}

export interface OrderItemInput {
  productId: string;
  quantity: number;
  unitPrice: number;
  observation?: string;
  massa?: string;
  sabor?: string;
}

export interface OrderItemUpdate {
  productId: string;
  quantity?: number;
  paidUnitPrice?: number;
  observation?: string;
  massa?: string;
  sabor?: string;
}

export interface CreateOrderInput {
  clientId: string;
  deliveryDate: string;
  items: OrderItemInput[];
  references?: string[];
}

export interface UpdateOrderInput {
  deliveryDate?: string;
  status?: number;
  items?: OrderItemUpdate[];
  references?: string[];
}

export interface PresignedUrlRequest {
  fileName: string;
  contentType: string;
}

export interface PresignedUrlResponse {
  uploadUrl: string;
  objectKey: string;
}

export const ORDER_STATUS_LABEL: Record<OrderStatus, string> = {
  Pending: "Pendente",
  Completed: "Concluído",
  Canceled: "Cancelado",
  Received: "Recebido",
  Preparing: "Preparando",
  WaitingPickupOrDelivery: "Aguardando Retirada/Entrega",
};

export const ORDER_STATUS_COLOR: Record<OrderStatus, string> = {
  Pending: "bg-yellow-100 text-yellow-800",
  Completed: "bg-green-100 text-green-800",
  Canceled: "bg-red-100 text-red-800",
  Received: "bg-blue-100 text-blue-800",
  Preparing: "bg-orange-100 text-orange-800",
  WaitingPickupOrDelivery: "bg-purple-100 text-purple-800",
};

export const ORDER_STATUS_INT: Record<OrderStatus, number> = {
  Pending: 1,
  Completed: 2,
  Canceled: 3,
  Received: 4,
  Preparing: 5,
  WaitingPickupOrDelivery: 6,
};

export const ALL_ORDER_STATUSES: OrderStatus[] = [
  "Received",
  "Pending",
  "Preparing",
  "WaitingPickupOrDelivery",
  "Completed",
  "Canceled",
];
