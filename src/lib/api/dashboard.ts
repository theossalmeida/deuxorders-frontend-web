import { createApiClient } from "./client";
import {
  DashboardSummary,
  RevenueOverTime,
  TopProduct,
  TopClient,
  DashboardFilters,
} from "@/types/dashboard";

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
    getSummary: (filters: DashboardFilters) =>
      api.get<DashboardSummary>(`/dashboard/summary${buildDashboardParams(filters)}`),

    getRevenueOverTime: (filters: DashboardFilters) =>
      api.get<RevenueOverTime>(`/dashboard/revenue-over-time${buildDashboardParams(filters)}`),

    getTopProducts: (filters: DashboardFilters, limit = 10) =>
      api.get<TopProduct[]>(
        `/dashboard/top-products${buildDashboardParams({ ...filters })}${
          buildDashboardParams(filters) ? "&" : "?"
        }limit=${limit}`
      ),

    getTopClients: (filters: DashboardFilters, limit = 10) =>
      api.get<TopClient[]>(
        `/dashboard/top-clients${buildDashboardParams({ ...filters })}${
          buildDashboardParams(filters) ? "&" : "?"
        }limit=${limit}`
      ),

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
