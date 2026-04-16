export type CashFlowType = "Inflow" | "Outflow";

export type CashFlowSource = "Manual" | "OrderPayment" | "OrderReversal";

export type CashFlowCategory =
  | "Order" | "OrderReversal" | "RawMaterial" | "Supplier"
  | "Salary" | "Tax" | "Utilities" | "Equipment" | "Marketing" | "Other";

export interface CashFlowEntry {
  id: string;
  createdAt: string;
  billingDate: string;
  type: CashFlowType;
  category: CashFlowCategory;
  counterparty: string;
  amountCents: number;
  notes: string | null;
  source: CashFlowSource;
  sourceId: string | null;
  authorUserId: string;
  authorUserName: string;
  updatedAt: string | null;
  deletedAt: string | null;
}

export interface PaginatedCashEntries {
  items: CashFlowEntry[];
  totalCount: number;
  pageNumber: number;
  pageSize: number;
}

export interface CashFlowFilters {
  from?: string;
  to?: string;
  type?: CashFlowType;
  category?: CashFlowCategory;
  source?: CashFlowSource;
  includeDeleted?: boolean;
  page?: number;
  size?: number;
}

export interface CashFlowSummary {
  totalInflowCents: number;
  totalOutflowCents: number;
  netBalanceCents: number;
  totalCount: number;
  inflowByCategory: Partial<Record<CashFlowCategory, number>>;
  outflowByCategory: Partial<Record<CashFlowCategory, number>>;
}

export interface CreateCashFlowEntryInput {
  billingDate: string;
  type: CashFlowType;
  category: CashFlowCategory;
  counterparty: string;
  amountCents: number;
  notes?: string;
}

export type UpdateCashFlowEntryInput = CreateCashFlowEntryInput;

export const CASH_TYPE_LABEL: Record<CashFlowType, string> = {
  Inflow: "Entrada",
  Outflow: "Saída",
};

export const CASH_CATEGORY_LABEL: Record<CashFlowCategory, string> = {
  Order: "Pedido",
  OrderReversal: "Estorno de Pedido",
  RawMaterial: "Matéria-Prima",
  Supplier: "Fornecedor",
  Salary: "Salário",
  Tax: "Imposto",
  Utilities: "Serviços/Utilidades",
  Equipment: "Equipamento",
  Marketing: "Marketing",
  Other: "Outros",
};

export const CASH_SOURCE_LABEL: Record<CashFlowSource, string> = {
  Manual: "Manual",
  OrderPayment: "Pedido pago",
  OrderReversal: "Estorno",
};

export const CASH_TYPE_COLOR: Record<CashFlowType, string> = {
  Inflow: "bg-emerald-50 text-emerald-700 ring-1 ring-emerald-200",
  Outflow: "bg-red-50 text-red-700 ring-1 ring-red-200",
};

export const CASH_TYPE_BORDER: Record<CashFlowType, string> = {
  Inflow: "border-l-emerald-400",
  Outflow: "border-l-red-400",
};
