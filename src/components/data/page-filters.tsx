"use client";

import { cn } from "@/lib/utils";

export type PeriodKey = "today" | "7d" | "month" | "custom";

const OPTIONS: { k: PeriodKey; label: string }[] = [
  { k: "today",  label: "Hoje" },
  { k: "7d",     label: "7 dias" },
  { k: "month",  label: "Mês" },
  { k: "custom", label: "Período" },
];

type Props = {
  value: PeriodKey;
  onChange: (k: PeriodKey) => void;
  className?: string;
};

export function PageFilters({ value, onChange, className }: Props) {
  return (
    <div className={cn("flex gap-1.5 overflow-x-auto pb-0.5", className)}>
      {OPTIONS.map((o) => {
        const active = value === o.k;
        return (
          <button
            key={o.k}
            type="button"
            onClick={() => onChange(o.k)}
            className={cn(
              "whitespace-nowrap rounded-lg px-3 py-1.5 text-xs font-medium transition-colors",
              active
                ? "bg-foreground text-background"
                : "border border-border bg-card text-foreground-soft hover:bg-accent",
            )}
          >
            {o.label}
          </button>
        );
      })}
    </div>
  );
}

/** Convert a PeriodKey to an ISO date range. */
export function periodToRange(k: PeriodKey): { startDate: string; endDate: string } {
  const now = new Date();
  const pad = (n: number) => String(n).padStart(2, "0");
  const isoDate = (d: Date) =>
    `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`;

  const today = isoDate(now);

  if (k === "today") return { startDate: today, endDate: today };
  if (k === "7d") {
    const from = new Date(now);
    from.setDate(from.getDate() - 6);
    return { startDate: isoDate(from), endDate: today };
  }
  if (k === "month") {
    const from = new Date(now.getFullYear(), now.getMonth(), 1);
    return { startDate: isoDate(from), endDate: today };
  }
  return { startDate: today, endDate: today };
}
