import type { MeasureUnit } from "@/types/inventory";
import { MEASURE_UNIT_SHORT } from "@/types/inventory";

const BRL = new Intl.NumberFormat("pt-BR", {
  style: "currency",
  currency: "BRL",
  minimumFractionDigits: 2,
});

const BRL_COMPACT = new Intl.NumberFormat("pt-BR", {
  style: "currency",
  currency: "BRL",
  minimumFractionDigits: 0,
  maximumFractionDigits: 0,
});

/** Format a real-unit value (not cents) as BRL currency. */
export function formatBRL(value: number, opts?: { compact?: boolean }) {
  if (opts?.compact && Number.isInteger(value)) return BRL_COMPACT.format(value);
  return BRL.format(value);
}

/** Format a cent-unit value as BRL currency. */
export function formatCents(cents: number) {
  return formatBRL(cents / 100);
}

/** @deprecated Use formatCents() for cent values or formatBRL() for real values. */
export function formatCurrency(cents: number): string {
  return formatCents(cents);
}

const DATE_SHORT = new Intl.DateTimeFormat("pt-BR", {
  day: "2-digit",
  month: "short",
});

const DATE_LONG = new Intl.DateTimeFormat("pt-BR", {
  weekday: "long",
  day: "2-digit",
  month: "long",
});

const TIME_FMT = new Intl.DateTimeFormat("pt-BR", {
  hour: "2-digit",
  minute: "2-digit",
});

const DATETIME_FMT = new Intl.DateTimeFormat("pt-BR", {
  day: "2-digit",
  month: "2-digit",
  year: "numeric",
  hour: "2-digit",
  minute: "2-digit",
});

function parseDateForDisplay(iso: string): Date {
  const value = iso.trim();
  if (/^\d{4}-\d{2}-\d{2}$/.test(value)) {
    return new Date(`${value}T00:00:00`);
  }
  return new Date(value);
}

function dateKeyToUtcMs(dateKey: string): number {
  const [y, m, d] = dateKey.split("-").map(Number);
  return Date.UTC(y, m - 1, d);
}

export function formatDate(iso: string): string {
  return DATE_SHORT.format(parseDateForDisplay(iso));
}

export function formatDateLong(iso: string): string {
  return DATE_LONG.format(parseDateForDisplay(iso));
}

export function formatTime(iso: string): string {
  return TIME_FMT.format(parseDateForDisplay(iso));
}

/** @deprecated Use formatDate + formatTime separately. */
export function formatDateTime(iso: string): string {
  return DATETIME_FMT.format(parseDateForDisplay(iso));
}

/** "Hoje", "Amanhã", "Ontem", or short date. */
export function formatRelativeDay(iso: string): string {
  const dateKey = localDateKey(iso);
  const todayKey = localISODate(new Date());
  const diff = Math.round((dateKeyToUtcMs(dateKey) - dateKeyToUtcMs(todayKey)) / 86400000);
  if (diff === 0) return "Hoje";
  if (diff === 1) return "Amanhã";
  if (diff === -1) return "Ontem";
  return "";
  //return formatDate(iso);
}

export function formatPercentDelta(v: number): string {
  const sign = v >= 0 ? "+" : "";
  return `${sign}${v.toFixed(1).replace(".", ",")}%`;
}

/** Format a Date as a local YYYY-MM-DD string (no UTC shift). */
export function localISODate(date: Date): string {
  const y = date.getFullYear();
  const m = String(date.getMonth() + 1).padStart(2, "0");
  const d = String(date.getDate()).padStart(2, "0");
  return `${y}-${m}-${d}`;
}

/** Format a Date as a local YYYY-MM-DDTHH:mm string for datetime-local inputs. */
export function localISODatetime(date: Date): string {
  const hh = String(date.getHours()).padStart(2, "0");
  const mm = String(date.getMinutes()).padStart(2, "0");
  return `${localISODate(date)}T${hh}:${mm}`;
}

/** Convert an API date/datetime value to the user's local calendar date key. */
export function localDateKey(iso: string): string {
  return localISODate(parseDateForDisplay(iso));
}

/** Convert an API datetime value to a value suitable for datetime-local inputs. */
export function apiDatetimeLocal(iso: string): string {
  return localISODatetime(parseDateForDisplay(iso));
}

/** Convert a datetime-local value to an API-safe UTC ISO string. */
export function localDatetimeToUtcIso(value: string): string {
  const trimmed = value.trim();
  if (!trimmed) return trimmed;

  const normalized = /^\d{4}-\d{2}-\d{2}$/.test(trimmed)
    ? `${trimmed}T00:00`
    : trimmed;

  return new Date(normalized).toISOString();
}

/**
 * Convert local calendar date filters to UTC bounds for automatic UTC columns.
 * The end is exclusive: selected end day + 1 at local 00:00.
 */
export function localDateRangeToUtcBounds(startDate?: string, endDate?: string) {
  const startUtc = startDate
    ? new Date(`${startDate}T00:00:00`).toISOString()
    : undefined;

  let endUtc: string | undefined;
  if (endDate) {
    const end = new Date(`${endDate}T00:00:00`);
    end.setDate(end.getDate() + 1);
    endUtc = end.toISOString();
  }

  return { startUtc, endUtc };
}

export function formatQuantity(quantity: number, unit: MeasureUnit): string {
  return `${quantity} ${MEASURE_UNIT_SHORT[unit]}`;
}

export function formatUnitCostDisplay(unitCost: number, unit: MeasureUnit): string {
  return `${formatCents(unitCost)} / ${MEASURE_UNIT_SHORT[unit]}`;
}
