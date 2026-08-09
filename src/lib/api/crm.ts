import { createApiClient } from "./client";
import { CrmClientSummary, PaginatedCrmSummaries } from "@/types/crm";

interface CrmLastOrderInfoDto {
  products: string[];
  totalSpend: number;
}

interface CrmClientSummaryDto {
  clientId: string;
  name: string;
  mobile: string | null;
  orderCount: number;
  averageSpend: number;
  totalSpend: number;
  lastOrderDate: string;
  lastOrderInfo: CrmLastOrderInfoDto;
}

interface PaginatedCrmDto {
  items: CrmClientSummaryDto[];
  totalCount: number;
  pageNumber: number;
  pageSize: number;
}

function mapCrmClientSummary(dto: CrmClientSummaryDto): CrmClientSummary {
  return {
    clientId: dto.clientId,
    name: dto.name,
    mobile: dto.mobile,
    orderCount: dto.orderCount,
    averageSpendCents: dto.averageSpend,
    totalSpendCents: dto.totalSpend,
    lastOrderDate: dto.lastOrderDate,
    lastOrderInfo: {
      products: dto.lastOrderInfo.products,
      totalSpendCents: dto.lastOrderInfo.totalSpend,
    },
  };
}

export function createCrmApi(token: string) {
  const api = createApiClient(token);

  return {
    getList: async (params?: {
      search?: string;
      page?: number;
      size?: number;
    }): Promise<PaginatedCrmSummaries> => {
      const qs = new URLSearchParams();
      if (params?.search) qs.set("search", params.search);
      qs.set("page", String(params?.page ?? 1));
      qs.set("size", String(params?.size ?? 100));

      const dto = await api.get<PaginatedCrmDto>(`/crm/list?${qs.toString()}`);
      return {
        items: dto.items.map(mapCrmClientSummary),
        totalCount: dto.totalCount,
        pageNumber: dto.pageNumber,
        pageSize: dto.pageSize,
      };
    },
  };
}
