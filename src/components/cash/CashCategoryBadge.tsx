import { CASH_CATEGORY_LABEL, type CashFlowCategory } from "@/types/cash";

export function CashCategoryBadge({ category }: { category: CashFlowCategory }) {
  return (
    <span className="inline-flex rounded-full px-2.5 py-0.5 text-xs font-semibold bg-zinc-100 text-zinc-600 ring-1 ring-zinc-200">
      {CASH_CATEGORY_LABEL[category]}
    </span>
  );
}
