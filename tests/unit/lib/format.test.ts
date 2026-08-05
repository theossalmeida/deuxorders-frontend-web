import { describe, it, expect, vi, afterEach } from "vitest";
import {
  formatBRL,
  formatCents,
  formatCurrency,
  formatDate,
  formatDateLong,
  formatTime,
  formatDateTime,
  formatRelativeDay,
  formatPercentDelta,
  localISODate,
  localISODatetime,
  localDateKey,
  apiDatetimeLocal,
  localDatetimeToUtcIso,
  localDateRangeToUtcBounds,
  formatQuantity,
  formatUnitCostDisplay,
} from "@/lib/format";

const brl = (value: number, fractionDigits = 2) =>
  new Intl.NumberFormat("pt-BR", {
    style: "currency",
    currency: "BRL",
    minimumFractionDigits: fractionDigits,
    maximumFractionDigits: fractionDigits,
  }).format(value);

describe("formatBRL / formatCents / formatCurrency", () => {
  it("formats a real-unit value as BRL with two decimals", () => {
    expect(formatBRL(1234.5)).toBe(brl(1234.5));
  });

  it("uses zero-decimal compact formatting only for integer values", () => {
    expect(formatBRL(10, { compact: true })).toBe(brl(10, 0));
  });

  it("falls back to full precision when compact is requested for a non-integer", () => {
    expect(formatBRL(10.5, { compact: true })).toBe(brl(10.5));
  });

  it("treats zero as an integer for compact formatting", () => {
    expect(formatBRL(0, { compact: true })).toBe(brl(0, 0));
  });

  it("converts a cent-unit value to its real-unit BRL display", () => {
    expect(formatCents(12345)).toBe(brl(123.45));
  });

  it("rounds sub-cent-of-a-real values correctly", () => {
    expect(formatCents(5)).toBe(brl(0.05));
  });

  it("keeps the deprecated formatCurrency alias in sync with formatCents", () => {
    expect(formatCurrency(999)).toBe(formatCents(999));
  });
});

describe("date parsing: date-only strings vs full timestamps", () => {
  it("does not shift a date-only string to the previous local day", () => {
    // In America/Sao_Paulo (UTC-3), naively parsing "2026-01-01" as UTC and
    // rendering in local time would show 2025-12-31. The date-only fast path
    // in parseDateForDisplay must avoid this.
    expect(formatDate("2026-01-01")).toMatch(/^01/);
  });

  it("does convert a full UTC timestamp to the local calendar day", () => {
    // 2026-01-01T02:00:00Z is 2025-12-31T23:00 in America/Sao_Paulo.
    expect(formatDate("2026-01-01T02:00:00Z")).toMatch(/^31/);
  });

  it("renders date-only strings at local midnight for formatTime", () => {
    expect(formatTime("2026-01-01")).toBe("00:00");
  });

  it("converts full UTC timestamps to local time for formatTime", () => {
    expect(formatTime("2026-01-01T15:30:00Z")).toBe("12:30");
  });

  it("trims surrounding whitespace before detecting the date-only shape", () => {
    expect(formatTime(" 2026-01-01 ")).toBe("00:00");
  });

  it("formatDateLong and formatDateTime share the same non-shifting parsing", () => {
    expect(formatDateLong("2026-01-01")).toMatch(/^quinta|^qui/i);
    expect(formatDateTime("2026-01-01")).toContain("01/01/2026");
  });
});

describe("formatRelativeDay", () => {
  const NOW = new Date("2026-03-15T12:00:00-03:00");

  afterEach(() => {
    vi.useRealTimers();
  });

  it("labels today, tomorrow, and yesterday", () => {
    vi.useFakeTimers();
    vi.setSystemTime(NOW);

    expect(formatRelativeDay("2026-03-15")).toBe("Hoje");
    expect(formatRelativeDay("2026-03-16")).toBe("Amanhã");
    expect(formatRelativeDay("2026-03-14")).toBe("Ontem");
  });

  it("returns an empty string for any other offset (no generic fallback wired up)", () => {
    vi.useFakeTimers();
    vi.setSystemTime(NOW);

    // NOTE: the implementation's generic fallback (`formatDate(iso)`) is
    // commented out, so today+2/-2 and beyond currently render nothing.
    // This test pins the current behavior; if that fallback is re-enabled,
    // update this expectation.
    expect(formatRelativeDay("2026-03-17")).toBe("");
    expect(formatRelativeDay("2026-03-13")).toBe("");
  });
});

describe("formatPercentDelta", () => {
  it("prefixes non-negative deltas with a plus sign", () => {
    expect(formatPercentDelta(5)).toBe("+5,0%");
    expect(formatPercentDelta(0)).toBe("+0,0%");
  });

  it("keeps the sign for negative deltas without doubling it", () => {
    expect(formatPercentDelta(-3.456)).toBe("-3,5%");
  });

  it("uses a comma as the decimal separator", () => {
    expect(formatPercentDelta(12.34)).toBe("+12,3%");
  });
});

describe("localISODate / localISODatetime", () => {
  it("pads single-digit months and days", () => {
    expect(localISODate(new Date(2026, 0, 3))).toBe("2026-01-03");
  });

  it("uses local getters, so a late-night time stays on the same local day", () => {
    expect(localISODate(new Date(2026, 0, 5, 23, 59))).toBe("2026-01-05");
  });

  it("pads hours and minutes for datetime-local inputs", () => {
    expect(localISODatetime(new Date(2026, 0, 3, 9, 5))).toBe("2026-01-03T09:05");
  });
});

describe("localDateKey / apiDatetimeLocal", () => {
  it("round-trips a date-only string unchanged", () => {
    expect(localDateKey("2026-03-05")).toBe("2026-03-05");
  });

  it("converts a UTC timestamp near midnight to the correct local calendar day", () => {
    expect(localDateKey("2026-03-05T02:00:00Z")).toBe("2026-03-04");
  });

  it("produces a datetime-local-ready string from an API timestamp", () => {
    expect(apiDatetimeLocal("2026-03-05T15:30:00Z")).toBe("2026-03-05T12:30");
  });
});

describe("localDatetimeToUtcIso", () => {
  it("returns an empty string unchanged (including whitespace-only input)", () => {
    expect(localDatetimeToUtcIso("")).toBe("");
    expect(localDatetimeToUtcIso("   ")).toBe("");
  });

  it("treats a bare date as local midnight before converting to UTC", () => {
    expect(localDatetimeToUtcIso("2026-03-05")).toBe("2026-03-05T03:00:00.000Z");
  });

  it("converts a full datetime-local value using the local offset", () => {
    expect(localDatetimeToUtcIso("2026-03-05T14:30")).toBe("2026-03-05T17:30:00.000Z");
  });
});

describe("localDateRangeToUtcBounds", () => {
  it("returns undefined bounds when neither date is provided", () => {
    expect(localDateRangeToUtcBounds()).toEqual({ startUtc: undefined, endUtc: undefined });
  });

  it("computes an inclusive start and an exclusive end (+1 day) bound", () => {
    const { startUtc, endUtc } = localDateRangeToUtcBounds("2026-03-05", "2026-03-10");
    expect(startUtc).toBe("2026-03-05T03:00:00.000Z");
    // end is start-of-next-day so the range end is exclusive.
    expect(endUtc).toBe("2026-03-11T03:00:00.000Z");
  });

  it("supports an open-ended start (only end provided)", () => {
    const { startUtc, endUtc } = localDateRangeToUtcBounds(undefined, "2026-03-10");
    expect(startUtc).toBeUndefined();
    expect(endUtc).toBe("2026-03-11T03:00:00.000Z");
  });

  it("supports an open-ended end (only start provided)", () => {
    const { startUtc, endUtc } = localDateRangeToUtcBounds("2026-03-05", undefined);
    expect(startUtc).toBe("2026-03-05T03:00:00.000Z");
    expect(endUtc).toBeUndefined();
  });

  it("rolls over the month/year boundary when adding a day to the end date", () => {
    const { endUtc } = localDateRangeToUtcBounds(undefined, "2026-12-31");
    expect(endUtc).toBe("2027-01-01T03:00:00.000Z");
  });
});

describe("formatQuantity / formatUnitCostDisplay", () => {
  it("appends the short unit label", () => {
    expect(formatQuantity(250, "G")).toBe("250 g");
    expect(formatQuantity(1.5, "ML")).toBe("1.5 mL");
    expect(formatQuantity(3, "U")).toBe("3 u");
  });

  it("formats a per-unit cost as currency over the short unit label", () => {
    expect(formatUnitCostDisplay(150, "G")).toBe(`${brl(1.5)} / g`);
  });
});
