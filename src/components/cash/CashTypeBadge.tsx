import { cn } from "@/lib/utils";
import { CASH_TYPE_COLOR, CASH_TYPE_LABEL, type CashFlowType } from "@/types/cash";

export function CashTypeBadge({ type }: { type: CashFlowType }) {
  return (
    <span className={cn("inline-flex rounded-full px-2.5 py-0.5 text-xs font-semibold", CASH_TYPE_COLOR[type])}>
      {CASH_TYPE_LABEL[type]}
    </span>
  );
}
