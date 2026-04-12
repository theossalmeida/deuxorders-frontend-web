import { OrderStatus } from "./orders";

export interface DashboardSummary {
  totalRevenue: number;
  totalValue: number;
  totalDiscount: number;
  totalOrders: number;
  pendingOrders: number;
  completedOrders: number;
  canceledOrders: number;
  averageRevenuePerOrder: number;
}

export interface RevenueDataPoint {
  date: string;
  revenue: number;
  orderCount: number;
}

export interface RevenueOverTime {
  dataPoints: RevenueDataPoint[];
}

export interface TopProduct {
  productId: string;
  productName: string;
  totalRevenue: number;
  totalQuantitySold: number;
  orderCount: number;
}

export interface TopClient {
  clientId: string;
  clientName: string;
  totalRevenue: number;
  orderCount: number;
}

export interface DashboardFilters {
  startDate?: string;
  endDate?: string;
  status?: OrderStatus;
}
