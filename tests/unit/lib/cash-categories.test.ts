import { describe, it, expect } from "vitest";
import { CATEGORY_COLOR } from "@/lib/cash-categories";
import { CASH_CATEGORY_LABEL, type CashFlowCategory } from "@/types/cash";

describe("CATEGORY_COLOR", () => {
  it("defines a color for every category the UI can label (guards against drift)", () => {
    const labeled = Object.keys(CASH_CATEGORY_LABEL).sort();
    const colored = Object.keys(CATEGORY_COLOR).sort();
    expect(colored).toEqual(labeled);
  });

  it("uses a valid 6-digit hex color for every category", () => {
    for (const category of Object.keys(CATEGORY_COLOR) as CashFlowCategory[]) {
      expect(CATEGORY_COLOR[category]).toMatch(/^#[0-9a-f]{6}$/i);
    }
  });

  it("gives Order and OrderReversal visually distinct colors despite being paired concepts", () => {
    expect(CATEGORY_COLOR.Order).not.toBe(CATEGORY_COLOR.OrderReversal);
  });
});
