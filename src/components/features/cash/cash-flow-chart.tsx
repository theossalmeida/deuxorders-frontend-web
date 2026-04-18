"use client";

import { ResponsiveContainer, BarChart, Bar, XAxis, Tooltip, CartesianGrid } from "recharts";
import { formatBRL } from "@/lib/format";
import type { CashChartPoint } from "@/hooks/useCashFlow";

export function CashFlowChart({ data }: { data: CashChartPoint[] }) {
  if (data.length === 0) {
    return (
      <div className="flex h-[240px] items-center justify-center rounded-xl border border-border bg-card">
        <span className="text-xs text-muted-foreground">Sem lançamentos no período</span>
      </div>
    );
  }
  return (
    <div className="rounded-xl border border-border bg-card p-4">
      <div className="flex items-center justify-between">
        <div className="text-[13px] font-semibold">Fluxo</div>
        <div className="flex items-center gap-3 text-[10.5px] text-muted-foreground">
          <span className="flex items-center gap-1">
            <span className="h-2 w-2 rounded-sm bg-ok" />
            Entradas
          </span>
          <span className="flex items-center gap-1">
            <span className="h-2 w-2 rounded-sm bg-destructive" />
            Saídas
          </span>
        </div>
      </div>
      <div className="mt-4">
        <ResponsiveContainer width="100%" height={180}>
          <BarChart data={data} barCategoryGap={18}>
            <CartesianGrid
              stroke="var(--border)"
              strokeDasharray="3 4"
              vertical={false}
            />
            <XAxis
              dataKey="d"
              tick={{ fontSize: 10, fill: "var(--muted-foreground)" }}
              axisLine={false}
              tickLine={false}
            />
            <Tooltip
              cursor={{ fill: "var(--accent)" }}
              content={({ active, payload, label }) =>
                active && payload?.length ? (
                  <div className="rounded-lg border border-border bg-card px-2.5 py-1.5 text-xs shadow-sm">
                    <div className="font-semibold">{label}</div>
                    <div className="mt-1 font-mono text-ok">
                      +{formatBRL(payload[0]?.value as number)}
                    </div>
                    <div className="font-mono text-destructive">
                      −{formatBRL(payload[1]?.value as number)}
                    </div>
                  </div>
                ) : null
              }
            />
            <Bar dataKey="in" fill="var(--ok)" radius={[3, 3, 0, 0]} />
            <Bar dataKey="out" fill="var(--destructive)" radius={[3, 3, 0, 0]} fillOpacity={0.8} />
          </BarChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}
