"use client";

import { ResponsiveContainer, BarChart, Bar, XAxis, Tooltip, CartesianGrid } from "recharts";
import { formatBRL } from "@/lib/format";

type DataPoint = { d: string; in: number; out: number };

const DEMO: DataPoint[] = [
  { d: "1 abr", in: 1640, out: 820 },
  { d: "5 abr", in: 2340, out: 1240 },
  { d: "9 abr", in: 3120, out: 1820 },
  { d: "13 abr", in: 2820, out: 940 },
  { d: "17 abr", in: 4260, out: 2140 },
];

export function CashFlowChart({ data = DEMO }: { data?: DataPoint[] }) {
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
