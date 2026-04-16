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
  /** null or "pickup" = Retirada; any other string = address for Entrega */
  delivery: string | null;
  paidAt: string | null;
  paidByUserName: string | null;
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
  delivery?: string;
}

export interface UpdateOrderInput {
  deliveryDate?: string;
  status?: number;
  items?: OrderItemUpdate[];
  references?: string[];
  delivery?: string | null;
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
  Pending: "bg-amber-50 text-amber-700 ring-1 ring-amber-200",
  Completed: "bg-emerald-50 text-emerald-700 ring-1 ring-emerald-200",
  Canceled: "bg-red-50 text-red-600 ring-1 ring-red-200",
  Received: "bg-blue-50 text-blue-700 ring-1 ring-blue-200",
  Preparing: "bg-orange-50 text-orange-700 ring-1 ring-orange-200",
  WaitingPickupOrDelivery: "bg-violet-50 text-violet-700 ring-1 ring-violet-200",
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
