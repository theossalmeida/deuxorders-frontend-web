"use client";

import { useQuery } from "@tanstack/react-query";
import { createDashboardApi } from "@/lib/api/dashboard";
import { useToken } from "./useToken";
import { DashboardFilters } from "@/types/dashboard";

export function useDashboardAll(filters: DashboardFilters) {
  const token = useToken();
  const api = token ? createDashboardApi(token) : null;

  const summary = useQuery({
    queryKey: ["dashboard-summary", filters],
    queryFn: () => api!.getSummary(filters),
    enabled: !!token,
  });

  const revenue = useQuery({
    queryKey: ["dashboard-revenue", filters],
    queryFn: () => api!.getRevenueOverTime(filters),
    enabled: !!token,
  });

  const topProducts = useQuery({
    queryKey: ["dashboard-top-products", filters],
    queryFn: () => api!.getTopProducts(filters),
    enabled: !!token,
  });

  const topClients = useQuery({
    queryKey: ["dashboard-top-clients", filters],
    queryFn: () => api!.getTopClients(filters),
    enabled: !!token,
  });

  return { summary, revenue, topProducts, topClients };
}
