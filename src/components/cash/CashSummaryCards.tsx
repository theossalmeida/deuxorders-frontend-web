import { formatCurrency } from "@/lib/format";
import { TrendingUp, TrendingDown, Scale, Hash, AlertTriangle } from "lucide-react";
import type { CashFlowSummary, CashFlowCategory } from "@/types/cash";
import { CASH_CATEGORY_LABEL } from "@/types/cash";

interface Props {
  summary: CashFlowSummary;
}

export function CashSummaryCards({ summary }: Props) {
  const topOutflowEntry = Object.entries(summary.outflowByCategory)
    .sort(([, a], [, b]) => (b ?? 0) - (a ?? 0))[0];
  const topOutflowCategory = topOutflowEntry
    ? CASH_CATEGORY_LABEL[topOutflowEntry[0] as CashFlowCategory]
    : "—";
  const topOutflowPct = topOutflowEntry && summary.totalOutflowCents > 0
    ? Math.round(((topOutflowEntry[1] ?? 0) / summary.totalOutflowCents) * 100)
    : 0;

  const cards = [
    {
      label: "Total entradas",
      value: formatCurrency(summary.totalInflowCents),
      icon: TrendingUp,
      iconBg: "bg-emerald-500",
      accent: "from-emerald-50/60",
    },
    {
      label: "Total saídas",
      value: formatCurrency(summary.totalOutflowCents),
      icon: TrendingDown,
      iconBg: "bg-red-400",
      accent: "from-red-50/60",
    },
    {
      label: "Saldo líquido",
      value: formatCurrency(summary.netBalanceCents),
      icon: Scale,
      iconBg: summary.netBalanceCents >= 0 ? "bg-emerald-500" : "bg-red-400",
      accent: summary.netBalanceCents >= 0 ? "from-emerald-50/60" : "from-red-50/60",
    },
    {
      label: "Lançamentos",
      value: String(summary.totalCount),
      icon: Hash,
      iconBg: "bg-blue-500",
      accent: "from-blue-50/60",
    },
    {
      label: "Maior saída",
      value: topOutflowCategory,
      icon: AlertTriangle,
      iconBg: topOutflowPct > 50 ? "bg-amber-400" : "bg-zinc-400",
      accent: topOutflowPct > 50 ? "from-amber-50/60" : "from-zinc-50/60",
    },
  ];

  return (
    <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
      {cards.map(({ label, value, icon: Icon, iconBg, accent }) => (
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
