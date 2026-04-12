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

const cards = (summary: DashboardSummary) => [
  {
    label: "Receita total",
    value: formatCurrency(summary.totalRevenue),
    icon: TrendingUp,
    iconBg: "bg-emerald-500",
    accent: "from-emerald-50/60",
  },
  {
    label: "Desconto total",
    value: formatCurrency(summary.totalDiscount),
    icon: Minus,
    iconBg: "bg-orange-400",
    accent: "from-orange-50/60",
  },
  {
    label: "Total de pedidos",
    value: String(summary.totalOrders),
    icon: ShoppingCart,
    iconBg: "bg-blue-500",
    accent: "from-blue-50/60",
  },
  {
    label: "Pendentes",
    value: String(summary.pendingOrders),
    icon: Clock,
    iconBg: "bg-amber-400",
    accent: "from-amber-50/60",
  },
  {
    label: "Concluídos",
    value: String(summary.completedOrders),
    icon: CheckCircle,
    iconBg: "bg-emerald-500",
    accent: "from-emerald-50/60",
  },
  {
    label: "Cancelados",
    value: String(summary.canceledOrders),
    icon: XCircle,
    iconBg: "bg-red-400",
    accent: "from-red-50/60",
  },
];

export function SummaryCards({ summary }: Props) {
  return (
    <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
      {cards(summary).map(({ label, value, icon: Icon, iconBg, accent }) => (
        <div
          key={label}
          className={`relative overflow-hidden rounded-2xl bg-gradient-to-br ${accent} to-white shadow-sm border border-white p-4`}
        >
          <div className="flex items-start justify-between mb-3">
            <p className="text-xs text-muted-foreground font-medium leading-snug">{label}</p>
            <div className={`rounded-xl p-1.5 ${iconBg} shadow-sm shrink-0`}>
              <Icon className="h-3.5 w-3.5 text-white" />
            </div>
          </div>
          <p className="text-2xl font-bold tracking-tight">{value}</p>
        </div>
      ))}
    </div>
  );
}
