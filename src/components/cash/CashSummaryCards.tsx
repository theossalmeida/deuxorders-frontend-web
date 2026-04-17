import { formatCurrency } from "@/lib/format";
import { TrendingUp, TrendingDown, Scale, Hash, Lightbulb } from "lucide-react";
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
    : null;
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
  ];

  return (
    <div className="space-y-3">
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
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

      {topOutflowCategory && topOutflowPct > 0 && (
        <div className="flex items-center gap-2.5 rounded-xl border border-amber-200 bg-amber-50/60 px-3.5 py-2.5 text-sm">
          <Lightbulb className="h-4 w-4 text-amber-600 shrink-0" />
          <p className="text-amber-900">
            <span className="font-semibold">{topOutflowCategory}</span>
            {" representou "}
            <span className="font-semibold tabular-nums">{topOutflowPct}%</span>
            {" das saídas no período."}
          </p>
        </div>
      )}
    </div>
  );
}
