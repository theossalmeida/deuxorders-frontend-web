import { DashboardSummary } from "@/types/dashboard";
import { formatCurrency } from "@/lib/format";
import {
  TrendingUp,
  ShoppingCart,
  Clock,
  CheckCircle,
  XCircle,
  Minus,
} from "lucide-react";

interface Props {
  summary: DashboardSummary;
}

export function SummaryCards({ summary }: Props) {
  const cards = [
    {
      label: "Receita total",
      value: formatCurrency(summary.totalRevenue),
      icon: TrendingUp,
      color: "text-green-600",
      bg: "bg-green-50",
    },
    {
      label: "Desconto total",
      value: formatCurrency(summary.totalDiscount),
      icon: Minus,
      color: "text-orange-600",
      bg: "bg-orange-50",
    },
    {
      label: "Total de pedidos",
      value: String(summary.totalOrders),
      icon: ShoppingCart,
      color: "text-blue-600",
      bg: "bg-blue-50",
    },
    {
      label: "Pendentes",
      value: String(summary.pendingOrders),
      icon: Clock,
      color: "text-yellow-600",
      bg: "bg-yellow-50",
    },
    {
      label: "Concluídos",
      value: String(summary.completedOrders),
      icon: CheckCircle,
      color: "text-green-600",
      bg: "bg-green-50",
    },
    {
      label: "Cancelados",
      value: String(summary.canceledOrders),
      icon: XCircle,
      color: "text-red-600",
      bg: "bg-red-50",
    },
  ];

  return (
    <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
      {cards.map(({ label, value, icon: Icon, color, bg }) => (
        <div key={label} className="rounded-xl border bg-white p-4 shadow-sm">
          <div className="flex items-center justify-between mb-2">
            <p className="text-xs text-muted-foreground font-medium">{label}</p>
            <div className={`rounded-full p-1.5 ${bg}`}>
              <Icon className={`h-3.5 w-3.5 ${color}`} />
            </div>
          </div>
          <p className="text-xl font-bold">{value}</p>
        </div>
      ))}
    </div>
  );
}
