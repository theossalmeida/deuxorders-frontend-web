"use client";

import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, Cell } from "recharts";
import { formatCurrency } from "@/lib/format";
import { CASH_CATEGORY_LABEL, type CashFlowCategory, type CashFlowSummary } from "@/types/cash";

interface Props {
  outflowByCategory: CashFlowSummary["outflowByCategory"];
}

export function CashByCategoryChart({ outflowByCategory }: Props) {
  const data = Object.entries(outflowByCategory)
    .map(([cat, total]) => ({
      name: CASH_CATEGORY_LABEL[cat as CashFlowCategory],
      total: total ?? 0,
    }))
    .sort((a, b) => b.total - a.total)
    .slice(0, 5);

  if (data.length === 0) {
    return <p className="text-sm text-muted-foreground py-8 text-center">Sem saídas no período.</p>;
  }

  return (
    <ResponsiveContainer width="100%" height={200}>
      <BarChart data={data} layout="vertical" margin={{ left: 8, right: 16 }}>
        <XAxis type="number" tickFormatter={(v) => formatCurrency(v)} tick={{ fontSize: 11 }} />
        <YAxis type="category" dataKey="name" width={120} tick={{ fontSize: 11 }} />
        <Tooltip formatter={(v) => formatCurrency(v as number)} />
        <Bar dataKey="total" radius={[0, 4, 4, 0]}>
          {data.map((_, i) => (
            <Cell key={i} fill={i === 0 ? "#ef4444" : "#fca5a5"} />
          ))}
        </Bar>
      </BarChart>
    </ResponsiveContainer>
  );
}
