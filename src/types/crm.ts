export interface CrmLastOrderInfo {
  products: string[];
  totalSpendCents: number;
}

export interface CrmClientSummary {
  clientId: string;
  name: string;
  mobile: string | null;
  orderCount: number;
  averageSpendCents: number;
  totalSpendCents: number;
  lastOrderDate: string;
  lastOrderInfo: CrmLastOrderInfo;
}

export interface PaginatedCrmSummaries {
  items: CrmClientSummary[];
  totalCount: number;
  pageNumber: number;
  pageSize: number;
}
