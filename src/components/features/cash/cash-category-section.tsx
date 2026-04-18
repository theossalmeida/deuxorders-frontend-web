import { CategoryBar } from "@/components/data/category-bar";
import { CASH_CATEGORY_LABEL, type CashFlowSummary } from "@/types/cash";
import { CATEGORY_COLOR } from "@/lib/cash-categories";
import type { CashFlowCategory } from "@/types/cash";

type Props = { summary?: CashFlowSummary };

export function CashCategorySection({ summary }: Props) {
  const slices =
    summary?.outflowByCategory
      ? (Object.entries(summary.outflowByCategory) as [CashFlowCategory, number][])
          .filter(([, v]) => v > 0)
          .sort(([, a], [, b]) => b - a)
          .map(([cat, cents]) => ({
            name: CASH_CATEGORY_LABEL[cat],
            value: cents / 100,
            color: CATEGORY_COLOR[cat],
          }))
      : [
          { name: "Matéria-Prima", value: 6840, color: CATEGORY_COLOR.RawMaterial },
          { name: "Fornecedor", value: 4120, color: CATEGORY_COLOR.Supplier },
          { name: "Salário", value: 3600, color: CATEGORY_COLOR.Salary },
          { name: "Utilidades", value: 1480, color: CATEGORY_COLOR.Utilities },
          { name: "Equipamento", value: 960, color: CATEGORY_COLOR.Equipment },
          { name: "Outros", value: 1320, color: CATEGORY_COLOR.Other },
        ];

  return <CategoryBar data={slices} title="Saídas por categoria" />;
}
