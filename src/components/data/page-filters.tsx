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
  customStart?: string;
  customEnd?: string;
  onCustomChange?: (start: string, end: string) => void;
  className?: string;
};

export function PageFilters({ value, onChange, customStart, customEnd, onCustomChange, className }: Props) {
  return (
    <div className={cn("flex flex-col gap-1.5", className)}>
      <div className="flex gap-1.5 overflow-x-auto pb-0.5">
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
      {value === "custom" && (
        <div className="flex items-center gap-1.5">
          <input
            type="date"
            value={customStart ?? ""}
            onChange={(e) => onCustomChange?.(e.target.value, customEnd ?? e.target.value)}
            className="rounded-lg border border-border bg-card px-2 py-1 text-xs text-foreground"
          />
          <span className="text-xs text-muted-foreground">–</span>
          <input
            type="date"
            value={customEnd ?? ""}
            min={customStart}
            onChange={(e) => onCustomChange?.(customStart ?? e.target.value, e.target.value)}
            className="rounded-lg border border-border bg-card px-2 py-1 text-xs text-foreground"
          />
        </div>
      )}
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
