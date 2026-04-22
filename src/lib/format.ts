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

export function formatDate(iso: string): string {
  return DATE_SHORT.format(new Date(iso));
}

export function formatDateLong(iso: string): string {
  return DATE_LONG.format(new Date(iso));
}

export function formatTime(iso: string): string {
  return TIME_FMT.format(new Date(iso));
}

/** @deprecated Use formatDate + formatTime separately. */
export function formatDateTime(iso: string): string {
  return DATETIME_FMT.format(new Date(iso));
}

/** "Hoje", "Amanhã", "Ontem", or short date. */
export function formatRelativeDay(iso: string): string {
  const d = new Date(iso);
  const today = new Date();
  const diff = Math.round(
    (d.setHours(0, 0, 0, 0) - today.setHours(0, 0, 0, 0)) / 86400000
  );
  if (diff === 0) return "Hoje";
  if (diff === 1) return "Amanhã";
  if (diff === -1) return "Ontem";
  return formatDate(iso);
}

export function formatPercentDelta(v: number): string {
  const sign = v >= 0 ? "+" : "";
  return `${sign}${v.toFixed(1).replace(".", ",")}%`;
}

export function toISODate(date: Date): string {
  return date.toISOString();
}

import type { MeasureUnit } from "@/types/inventory";
import { MEASURE_UNIT_SHORT } from "@/types/inventory";

export function formatQuantity(quantity: number, unit: MeasureUnit): string {
  return `${quantity} ${MEASURE_UNIT_SHORT[unit]}`;
}

export function formatUnitCostDisplay(unitCost: number, unit: MeasureUnit): string {
  return `${formatCents(unitCost)} / ${MEASURE_UNIT_SHORT[unit]}`;
}
