import { createApiClient } from "./client";
import {
  DashboardSummary,
  RevenueOverTime,
  RevenueDataPoint,
  TopProduct,
  TopClient,
  DashboardFilters,
} from "@/types/dashboard";

interface DashboardSummaryDto {
  totalRevenue: number;
  totalValue: number;
  totalDiscount: number;
  totalOrders: number;
  pendingOrders: number;
  completedOrders: number;
  canceledOrders: number;
  averageRevenuePerOrder: number;
}

interface RevenueDataPointDto {
  date: string;
  revenue: number;
  orderCount: number;
}

interface RevenueOverTimeDto {
  dataPoints: RevenueDataPointDto[];
}

interface TopProductDto {
  productId: string;
  productName: string;
  totalRevenue: number;
  totalQuantitySold: number;
  orderCount: number;
}

interface TopClientDto {
  clientId: string;
  clientName: string;
  totalRevenue: number;
  orderCount: number;
}

function mapSummary(dto: DashboardSummaryDto): DashboardSummary {
  return {
    totalRevenueCents: dto.totalRevenue,
    totalValueCents: dto.totalValue,
    totalDiscountCents: dto.totalDiscount,
    totalOrders: dto.totalOrders,
    pendingOrders: dto.pendingOrders,
    completedOrders: dto.completedOrders,
    canceledOrders: dto.canceledOrders,
    averageRevenuePerOrderCents: dto.averageRevenuePerOrder,
  };
}

function mapRevenueDataPoint(dto: RevenueDataPointDto): RevenueDataPoint {
  return { date: dto.date, revenueCents: dto.revenue, orderCount: dto.orderCount };
}

function mapRevenueOverTime(dto: RevenueOverTimeDto): RevenueOverTime {
  return { dataPoints: dto.dataPoints.map(mapRevenueDataPoint) };
}

function mapTopProduct(dto: TopProductDto): TopProduct {
  return {
    productId: dto.productId,
    productName: dto.productName,
    totalRevenueCents: dto.totalRevenue,
    totalQuantitySold: dto.totalQuantitySold,
    orderCount: dto.orderCount,
  };
}

function mapTopClient(dto: TopClientDto): TopClient {
  return {
    clientId: dto.clientId,
    clientName: dto.clientName,
    totalRevenueCents: dto.totalRevenue,
    orderCount: dto.orderCount,
  };
}

function buildDashboardParams(filters: DashboardFilters): string {
  const p = new URLSearchParams();
  if (filters.startDate) p.set("startDate", filters.startDate);
  if (filters.endDate) p.set("endDate", filters.endDate);
  if (filters.status) p.set("status", filters.status);
  const qs = p.toString();
  return qs ? `?${qs}` : "";
}

export function createDashboardApi(token: string) {
  const api = createApiClient(token);

  return {
    getSummary: async (filters: DashboardFilters) =>
      mapSummary(
        await api.get<DashboardSummaryDto>(`/dashboard/summary${buildDashboardParams(filters)}`)
      ),

    getRevenueOverTime: async (filters: DashboardFilters) =>
      mapRevenueOverTime(
        await api.get<RevenueOverTimeDto>(
          `/dashboard/revenue-over-time${buildDashboardParams(filters)}`
        )
      ),

    getTopProducts: async (filters: DashboardFilters, limit = 10) => {
      const base = buildDashboardParams(filters);
      const sep = base ? "&" : "?";
      const dtos = await api.get<TopProductDto[]>(
        `/dashboard/top-products${base}${sep}limit=${limit}`
      );
      return dtos.map(mapTopProduct);
    },

    getTopClients: async (filters: DashboardFilters, limit = 10) => {
      const base = buildDashboardParams(filters);
      const sep = base ? "&" : "?";
      const dtos = await api.get<TopClientDto[]>(
        `/dashboard/top-clients${base}${sep}limit=${limit}`
      );
      return dtos.map(mapTopClient);
    },

    exportOrders: async (
      filters: DashboardFilters,
      format: "csv" | "pdf"
    ): Promise<Blob> => {
      const p = new URLSearchParams();
      if (filters.startDate) p.set("from", filters.startDate);
      if (filters.endDate) p.set("to", filters.endDate);
      if (filters.status) p.set("status", filters.status);
      p.set("format", format);

      const res = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL}/dashboard/export?${p.toString()}`,
        { headers: { Authorization: `Bearer ${token}` } }
      );

      if (!res.ok) throw new Error("Falha ao exportar.");
      return res.blob();
    },
  };
}
