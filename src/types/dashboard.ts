import { OrderStatus } from "./orders";

export interface DashboardSummary {
  totalRevenueCents: number;
  totalValueCents: number;
  totalDiscountCents: number;
  totalOrders: number;
  pendingOrders: number;
  completedOrders: number;
  canceledOrders: number;
  averageRevenuePerOrderCents: number;
}

export interface RevenueDataPoint {
  date: string;
  revenueCents: number;
  orderCount: number;
}

export interface RevenueOverTime {
  dataPoints: RevenueDataPoint[];
}

export interface TopProduct {
  productId: string;
  productName: string;
  totalRevenueCents: number;
  totalQuantitySold: number;
  orderCount: number;
}

export interface TopClient {
  clientId: string;
  clientName: string;
  totalRevenueCents: number;
  orderCount: number;
}

export interface DashboardFilters {
  startDate?: string;
  endDate?: string;
  status?: OrderStatus;
}
