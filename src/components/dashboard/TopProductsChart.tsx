"use client";

import {
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
} from "recharts";
import { TopProduct } from "@/types/dashboard";
import { formatCurrency } from "@/lib/format";

interface Props {
  data: TopProduct[];
}

export function TopProductsChart({ data }: Props) {
  if (data.length === 0) {
    return (
      <div className="flex items-center justify-center h-48 text-muted-foreground text-sm">
        Sem dados para o período selecionado.
      </div>
    );
  }

  const chartData = data.slice(0, 5).map((p) => ({
    name: p.productName.length > 14 ? p.productName.slice(0, 14) + "…" : p.productName,
    revenue: p.totalRevenue,
    qty: p.totalQuantitySold,
  }));

  return (
    <ResponsiveContainer width="100%" height={200}>
      <BarChart data={chartData} margin={{ top: 4, right: 4, left: 0, bottom: 0 }}>
        <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
        <XAxis dataKey="name" tick={{ fontSize: 10 }} tickLine={false} axisLine={false} />
        <YAxis
          tickFormatter={(v: number) => `R$${(v / 100).toFixed(0)}`}
          tick={{ fontSize: 11 }}
          tickLine={false}
          axisLine={false}
          width={56}
        />
        <Tooltip
          formatter={(value) => [formatCurrency(Number(value)), "Receita"]}
        />
        <Bar dataKey="revenue" fill="#581629" radius={[4, 4, 0, 0]} />
      </BarChart>
    </ResponsiveContainer>
  );
}
