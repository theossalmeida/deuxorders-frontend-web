import type { CashFlowCategory } from "@/types/cash";

export const CATEGORY_COLOR: Record<CashFlowCategory, string> = {
  Order:         "#3f7a5a",
  OrderReversal: "#b85c3a",
  RawMaterial:   "#b85c3a",
  Supplier:      "#a07a3a",
  Salary:        "#6b5842",
  Tax:           "#7a3e12",
  Utilities:     "#8a7560",
  Equipment:     "#4f7a5a",
  Marketing:     "#a13e6a",
  Other:         "#9a8a75",
};
