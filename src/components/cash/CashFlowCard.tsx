import Link from "next/link";
import { CashTypeBadge } from "./CashTypeBadge";
import { CashCategoryBadge } from "./CashCategoryBadge";
import { CashSourceBadge } from "./CashSourceBadge";
import { formatCurrency, formatDate } from "@/lib/format";
import { CASH_TYPE_BORDER } from "@/types/cash";
import { cn } from "@/lib/utils";
import type { CashFlowEntry } from "@/types/cash";

interface Props {
  entries: CashFlowEntry[];
}

export function CashFlowCard({ entries }: Props) {
  return (
    <div className="space-y-2">
      {entries.map((entry) => (
        <Link
          key={entry.id}
          href={`/cash/${entry.id}`}
          className={cn(
            "block border-l-4 bg-white rounded-xl p-4 shadow-sm space-y-2",
            "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand focus-visible:ring-offset-2",
            CASH_TYPE_BORDER[entry.type],
            entry.deletedAt && "opacity-50",
          )}
        >
          <div className="flex justify-between items-start">
            <div>
              <p className="font-semibold text-sm">{entry.counterparty}</p>
              <p className="text-xs text-muted-foreground">{formatDate(entry.billingDate)}</p>
            </div>
            <p
              className={cn(
                "font-bold text-base tabular-nums",
                entry.type === "Inflow" && "text-emerald-700",
                entry.type === "Outflow" && "text-red-600",
              )}
            >
              {entry.type === "Outflow" ? "\u2212" : ""}
              {formatCurrency(entry.amountCents)}
            </p>
          </div>
          <div className="flex gap-2 flex-wrap">
            <CashTypeBadge type={entry.type} />
            <CashCategoryBadge category={entry.category} />
            <CashSourceBadge source={entry.source} />
          </div>
        </Link>
      ))}
    </div>
  );
}
