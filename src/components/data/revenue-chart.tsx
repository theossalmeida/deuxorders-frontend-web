"use client";

import {
  ResponsiveContainer,
  AreaChart,
  Area,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
} from "recharts";
import { formatBRL } from "@/lib/format";

export type RevenuePoint = { date: string; value: number };

type Props = {
  data: RevenuePoint[];
  height?: number;
};

export function RevenueChart({ data, height = 180 }: Props) {
  return (
    <ResponsiveContainer width="100%" height={height}>
      <AreaChart data={data} margin={{ top: 10, right: 6, bottom: 6, left: 6 }}>
        <defs>
          <linearGradient id="rev-grad" x1="0" x2="0" y1="0" y2="1">
            <stop offset="0%" stopColor="var(--brand)" stopOpacity={0.2} />
            <stop offset="100%" stopColor="var(--brand)" stopOpacity={0} />
          </linearGradient>
        </defs>
        <CartesianGrid
          stroke="var(--border)"
          strokeDasharray="3 4"
          vertical={false}
        />
        <XAxis
          dataKey="date"
          tick={{ fontSize: 10, fill: "var(--muted-foreground)" }}
          axisLine={false}
          tickLine={false}
        />
        <YAxis hide />
        <Tooltip
          content={({ active, payload }) =>
            active && payload?.length ? (
              <div className="rounded-lg border border-border bg-card px-2.5 py-1.5 text-xs shadow-sm">
                <div className="text-muted-foreground">{payload[0].payload.date}</div>
                <div className="font-mono font-semibold">
                  {formatBRL(payload[0].value as number)}
                </div>
              </div>
            ) : null
          }
        />
        <Area
          type="monotone"
          dataKey="value"
          stroke="var(--brand)"
          strokeWidth={2}
          fill="url(#rev-grad)"
          dot={{ r: 3, fill: "var(--card)", stroke: "var(--brand)", strokeWidth: 1.6 }}
          activeDot={{ r: 5 }}
        />
      </AreaChart>
    </ResponsiveContainer>
  );
}
