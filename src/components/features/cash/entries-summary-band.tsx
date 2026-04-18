import { ArrowDown, ArrowUp } from "lucide-react";
import { cn } from "@/lib/utils";
import { formatBRL } from "@/lib/format";
import type { CashFlowSummary } from "@/types/cash";

type Props = { summary?: CashFlowSummary };

export function EntriesSummaryBand({ summary }: Props) {
  const inflow = (summary?.totalInflowCents ?? 0) / 100;
  const outflow = (summary?.totalOutflowCents ?? 0) / 100;
  const net = (summary?.netBalanceCents ?? 0) / 100;
  const count = summary?.totalCount ?? 0;

  const items = [
    { label: "Entradas", value: formatBRL(inflow), icon: <ArrowDown size={14} />, color: "text-ok" },
    { label: "Saídas", value: formatBRL(outflow), icon: <ArrowUp size={14} />, color: "text-destructive" },
    { label: "Saldo", value: formatBRL(net), color: net >= 0 ? "text-ok" : "text-destructive" },
    { label: "Lançamentos", value: String(count), color: "text-foreground" },
  ];

  return (
    <div className="grid grid-cols-2 gap-2 md:grid-cols-4">
      {items.map((item) => (
        <div key={item.label} className="rounded-xl border border-border bg-card px-4 py-3">
          <div className="flex items-center gap-1.5 text-[10.5px] font-semibold uppercase tracking-wider text-muted-foreground">
            {item.icon}
            {item.label}
          </div>
          <div className={cn("mt-1.5 font-mono text-[18px] font-semibold tracking-tight", item.color)}>
            {item.value}
          </div>
        </div>
      ))}
    </div>
  );
}
