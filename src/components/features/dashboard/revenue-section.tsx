"use client";

import { useState } from "react";
import { cn } from "@/lib/utils";
import { RevenueChart, type RevenuePoint } from "@/components/data/revenue-chart";
import { Skeleton } from "@/components/ui/skeleton";
import { formatBRL, formatPercentDelta } from "@/lib/format";
import type { RevenueOverTime } from "@/types/dashboard";

type Props = {
  data?: RevenueOverTime;
  isLoading?: boolean;
};

export function RevenueSection({ data, isLoading }: Props) {
  const [mode, setMode] = useState<"revenue" | "orders">("revenue");

  if (isLoading) {
    return <Skeleton className="h-[300px] rounded-xl" />;
  }

  const points: RevenuePoint[] = (data?.dataPoints ?? []).map((p) => ({
    date: p.date,
    value: mode === "revenue" ? p.revenue : p.orderCount,
  }));

  const total = points.reduce((a, p) => a + p.value, 0);

  return (
    <div className="rounded-xl border border-border bg-card p-4 md:p-5">
      <div className="flex items-start justify-between">
        <div>
          <div className="text-[13px] font-semibold">Receita ao longo do tempo</div>
          <div className="text-[11px] text-muted-foreground">últimos dias</div>
        </div>
        <div className="flex gap-0.5 rounded-lg bg-muted p-0.5">
          {(
            [
              ["revenue", "Receita"],
              ["orders", "Pedidos"],
            ] as const
          ).map(([k, l]) => (
            <button
              key={k}
              type="button"
              onClick={() => setMode(k)}
              className={cn(
                "rounded-md px-2.5 py-1 text-[11px] font-medium transition-colors",
                mode === k ? "bg-card text-foreground shadow-sm" : "text-muted-foreground",
              )}
            >
              {l}
            </button>
          ))}
        </div>
      </div>

      <div className="mt-3 font-mono text-2xl font-semibold tracking-tight md:text-[28px]">
        {mode === "revenue" ? formatBRL(total) : String(total)}{" "}
        <span className="font-sans text-xs font-semibold text-ok">
          {formatPercentDelta(12.4)}
        </span>
      </div>

      <div className="mt-3">
        <RevenueChart data={points} height={180} />
      </div>
    </div>
  );
}
