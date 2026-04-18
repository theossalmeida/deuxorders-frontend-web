import { ArrowDown, ArrowUp } from "lucide-react";
import { cn } from "@/lib/utils";
import { formatCents, formatDate } from "@/lib/format";
import { CASH_CATEGORY_LABEL, type CashFlowEntry } from "@/types/cash";

export function CashEntryRow({ entry }: { entry: CashFlowEntry }) {
  const inflow = entry.type === "Inflow";
  return (
    <div className="flex items-center gap-3 px-3.5 py-2.5">
      <div
        className={cn(
          "flex h-7 w-7 items-center justify-center rounded-lg",
          inflow ? "bg-ok/10 text-ok" : "bg-destructive/10 text-destructive",
        )}
      >
        {inflow ? <ArrowDown size={14} /> : <ArrowUp size={14} />}
      </div>
      <div className="min-w-0 flex-1">
        <div className="truncate text-[12.5px] font-medium">{entry.counterparty}</div>
        <div className="font-mono text-[10.5px] text-muted-foreground">
          {formatDate(entry.billingDate)} · {CASH_CATEGORY_LABEL[entry.category]}
        </div>
      </div>
      <div className={cn("font-mono text-[13px] font-semibold", inflow ? "text-ok" : "text-foreground")}>
        {inflow ? "+" : "−"}
        {formatCents(entry.amountCents)}
      </div>
    </div>
  );
}
