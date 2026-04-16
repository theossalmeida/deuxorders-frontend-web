import { Link2 } from "lucide-react";
import { CASH_SOURCE_LABEL, type CashFlowSource } from "@/types/cash";

export function CashSourceBadge({ source }: { source: CashFlowSource }) {
  const isAuto = source !== "Manual";
  return (
    <span className={`inline-flex items-center gap-1 rounded-full px-2.5 py-0.5 text-xs font-semibold
      ${isAuto ? "bg-blue-50 text-blue-700 ring-1 ring-blue-200" : "bg-white text-zinc-500 ring-1 ring-zinc-200"}`}
    >
      {isAuto && <Link2 className="h-3 w-3" />}
      {CASH_SOURCE_LABEL[source]}
    </span>
  );
}
