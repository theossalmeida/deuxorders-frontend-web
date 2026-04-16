"use client";

import { useState } from "react";
import { useToken } from "@/hooks/useToken";
import { useCashSummary } from "@/hooks/useCashFlow";
import { CashSummaryCards } from "@/components/cash/CashSummaryCards";
import { CashByCategoryChart } from "@/components/cash/CashByCategoryChart";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Loader2 } from "lucide-react";
import { toISODate } from "@/lib/format";
import type { CashFlowFilters } from "@/types/cash";

function startOfDay(date: Date): string {
  const d = new Date(date);
  d.setHours(0, 0, 0, 0);
  return toISODate(d);
}

function endOfDay(date: Date): string {
  const d = new Date(date);
  d.setHours(23, 59, 59, 999);
  return toISODate(d);
}

type Preset = "today" | "7d" | "month" | "custom";

export default function CashDashboardPage() {
  useToken();
  const [preset, setPreset] = useState<Preset>("month");
  const [customFrom, setCustomFrom] = useState("");
  const [customTo, setCustomTo] = useState("");

  function buildFilters(): Omit<CashFlowFilters, "page" | "size" | "includeDeleted"> {
    const now = new Date();
    if (preset === "today") {
      return { from: startOfDay(now), to: endOfDay(now) };
    }
    if (preset === "7d") {
      const from = new Date(now);
      from.setDate(from.getDate() - 6);
      return { from: startOfDay(from), to: endOfDay(now) };
    }
    if (preset === "month") {
      const from = new Date(now.getFullYear(), now.getMonth(), 1);
      return { from: startOfDay(from), to: endOfDay(now) };
    }
    return {
      from: customFrom ? new Date(customFrom).toISOString() : undefined,
      to: customTo ? endOfDay(new Date(customTo)) : undefined,
    };
  }

  const filters = buildFilters();
  const { data: summary, isLoading } = useCashSummary(filters);

  return (
    <div className="max-w-4xl mx-auto px-4 py-6 space-y-6">
      {/* Header */}
      <div className="space-y-3">
        <h1 className="text-xl font-bold">Caixa</h1>
        <div className="flex flex-wrap items-center gap-2">
          {(["today", "7d", "month", "custom"] as Preset[]).map((p) => (
            <Button
              key={p}
              variant={preset === p ? "default" : "outline"}
              size="sm"
              onClick={() => setPreset(p)}
              style={preset === p ? { backgroundColor: "#581629" } : undefined}
            >
              {p === "today" ? "Hoje" : p === "7d" ? "7 dias" : p === "month" ? "Mês" : "Período"}
            </Button>
          ))}
          {preset === "custom" && (
            <div className="flex items-center gap-2">
              <Input
                type="date"
                className="h-8 text-sm w-36"
                value={customFrom}
                onChange={(e) => setCustomFrom(e.target.value)}
              />
              <span className="text-sm text-muted-foreground">até</span>
              <Input
                type="date"
                className="h-8 text-sm w-36"
                value={customTo}
                onChange={(e) => setCustomTo(e.target.value)}
              />
            </div>
          )}
        </div>
      </div>

      {/* Summary cards */}
      {isLoading ? (
        <div className="flex justify-center py-16">
          <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
        </div>
      ) : summary ? (
        <>
          <CashSummaryCards summary={summary} />

          <div className="rounded-2xl border bg-white p-4 shadow-sm space-y-3">
            <h2 className="text-sm font-semibold text-muted-foreground uppercase tracking-wide">
              Saídas por categoria
            </h2>
            <CashByCategoryChart outflowByCategory={summary.outflowByCategory} />
          </div>
        </>
      ) : null}
    </div>
  );
}
