"use client";

import { useState } from "react";
import { useCashSummary } from "@/hooks/useCashFlow";
import { CashSummaryCards } from "@/components/cash/CashSummaryCards";
import { CashByCategoryChart } from "@/components/cash/CashByCategoryChart";
import { Input } from "@/components/ui/input";
import type { CashFlowFilters } from "@/types/cash";
import { PresetPicker } from "@/components/ui/preset-picker";
import { PageShell } from "@/components/layout/PageShell";

function startOfDay(date: Date): string {
  const y = date.getFullYear();
  const m = String(date.getMonth() + 1).padStart(2, "0");
  const d = String(date.getDate()).padStart(2, "0");
  return `${y}-${m}-${d}T00:00:00`;
}

function endOfDay(date: Date): string {
  const y = date.getFullYear();
  const m = String(date.getMonth() + 1).padStart(2, "0");
  const d = String(date.getDate()).padStart(2, "0");
  return `${y}-${m}-${d}T23:59:59`;
}

type Preset = "today" | "7d" | "month" | "custom";

export default function CashDashboardPage() {
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
      from: customFrom ? `${customFrom}T00:00:00` : undefined,
      to: customTo ? `${customTo}T23:59:59` : undefined,
    };
  }

  const filters = buildFilters();
  const { data: summary, isLoading } = useCashSummary(filters);

  return (
    <PageShell variant="dashboard" className="space-y-6">
      {/* Header */}
      <div className="space-y-3">
        <h1 className="text-xl font-bold">Caixa</h1>
        <div className="flex flex-wrap items-center gap-2">
          <PresetPicker<Preset>
            options={[
              { value: "today", label: "Hoje" },
              { value: "7d", label: "7 dias" },
              { value: "month", label: "Mês" },
              { value: "custom", label: "Período" },
            ]}
            value={preset}
            onChange={setPreset}
          />
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
        <div className="space-y-4">
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            {Array.from({ length: 4 }).map((_, i) => (
              <div key={i} className="h-24 rounded-2xl bg-zinc-100 animate-pulse" />
            ))}
          </div>
          <div className="h-64 rounded-2xl bg-zinc-100 animate-pulse" />
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
    </PageShell>
  );
}
