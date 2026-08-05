import { describe, it, expect } from "vitest";
import { STATUS_META } from "@/lib/order-status";
import { ALL_ORDER_STATUSES } from "@/types/orders";

describe("STATUS_META", () => {
  it("has a fully-populated entry for every known order status", () => {
    for (const status of ALL_ORDER_STATUSES) {
      const meta = STATUS_META[status];
      expect(meta, `missing STATUS_META entry for "${status}"`).toBeDefined();
      expect(meta.label).toBeTruthy();
      expect(meta.bg).toMatch(/^bg-/);
      expect(meta.fg).toMatch(/^text-/);
      expect(meta.dot).toMatch(/^bg-/);
    }
  });

  it("does not define entries for statuses outside the known set", () => {
    expect(Object.keys(STATUS_META).sort()).toEqual([...ALL_ORDER_STATUSES].sort());
  });

  it("gives every status a visually distinct dot color", () => {
    const dots = ALL_ORDER_STATUSES.map((status) => STATUS_META[status].dot);
    expect(new Set(dots).size).toBe(dots.length);
  });
});
