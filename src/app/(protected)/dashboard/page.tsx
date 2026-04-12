"use client";

import { useState } from "react";
import { useDashboardAll } from "@/hooks/useDashboard";
import { useToken } from "@/hooks/useToken";
import { createDashboardApi } from "@/lib/api/dashboard";
import { SummaryCards } from "@/components/dashboard/SummaryCards";
import { RevenueChart } from "@/components/dashboard/RevenueChart";
import { TopProductsChart } from "@/components/dashboard/TopProductsChart";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Loader2, Download } from "lucide-react";
import { ALL_ORDER_STATUSES, ORDER_STATUS_LABEL, OrderStatus } from "@/types/orders";
import { formatCurrency } from "@/lib/format";
import { toast } from "sonner";

type Preset = "today" | "week" | "month" | "custom";

function getPresetDates(preset: Preset): { start: string; end: string } {
  const today = new Date();
  const fmt = (d: Date) => d.toISOString().slice(0, 10);

  if (preset === "today") {
    const s = fmt(today);
    return { start: s, end: s };
  }
  if (preset === "week") {
    const start = new Date(today);
    start.setDate(today.getDate() - 6);
    return { start: fmt(start), end: fmt(today) };
  }
  if (preset === "month") {
    const start = new Date(today.getFullYear(), today.getMonth(), 1);
    const end = new Date(today.getFullYear(), today.getMonth() + 1, 0);
    return { start: fmt(start), end: fmt(end) };
  }
  return { start: fmt(today), end: fmt(today) };
}

export default function DashboardPage() {
  const token = useToken();

  const [preset, setPreset] = useState<Preset>("week");
  const [customStart, setCustomStart] = useState(() => getPresetDates("week").start);
  const [customEnd, setCustomEnd] = useState(() => getPresetDates("week").end);
  const [statusFilter, setStatusFilter] = useState<OrderStatus | "all">("all");
  const [isExporting, setIsExporting] = useState(false);

  const { start, end } =
    preset === "custom"
      ? { start: customStart, end: customEnd }
      : getPresetDates(preset);

  const filters = {
    startDate: new Date(start + "T00:00:00Z").toISOString(),
    endDate: new Date(end + "T23:59:59Z").toISOString(),
    status: statusFilter === "all" ? undefined : statusFilter,
  };

  const { summary, revenue, topProducts, topClients } = useDashboardAll(filters);

  async function handleExport(format: "csv" | "pdf") {
    if (!token) return;
    setIsExporting(true);
    try {
      const blob = await createDashboardApi(token).exportOrders(filters, format);
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `pedidos.${format}`;
      a.click();
      URL.revokeObjectURL(url);
    } catch (e) {
      toast.error("Falha ao exportar.");
    } finally {
      setIsExporting(false);
    }
  }

  const isLoading =
    summary.isLoading || revenue.isLoading || topProducts.isLoading || topClients.isLoading;

  return (
    <div className="px-4 py-6 space-y-6 max-w-4xl mx-auto">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Dashboard</h1>
          <p className="text-sm text-muted-foreground mt-0.5">Visão geral dos pedidos</p>
        </div>
        <div className="flex gap-2">
          <Button
            variant="outline"
            size="sm"
            className="rounded-xl"
            disabled={isExporting}
            onClick={() => handleExport("csv")}
          >
            {isExporting ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <Download className="h-3.5 w-3.5 mr-1" />}
            CSV
          </Button>
          <Button
            variant="outline"
            size="sm"
            className="rounded-xl"
            disabled={isExporting}
            onClick={() => handleExport("pdf")}
          >
            {isExporting ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <Download className="h-3.5 w-3.5 mr-1" />}
            PDF
          </Button>
        </div>
      </div>

      {/* Filters */}
      <div className="flex flex-wrap gap-2 items-center">
        <div className="flex gap-1 bg-white rounded-xl p-1 shadow-sm border">
          {(["today", "week", "month", "custom"] as Preset[]).map((p) => (
            <button
              key={p}
              onClick={() => setPreset(p)}
              className={`rounded-lg px-3 py-1.5 text-xs font-semibold transition-all duration-150 ${
                preset === p ? "text-white shadow-sm" : "text-muted-foreground hover:text-foreground"
              }`}
              style={preset === p ? { backgroundColor: "#581629" } : undefined}
            >
              {p === "today" ? "Hoje" : p === "week" ? "7 dias" : p === "month" ? "Mês" : "Período"}
            </button>
          ))}
        </div>

        {preset === "custom" && (
          <>
            <Input type="date" value={customStart} onChange={(e) => setCustomStart(e.target.value)} className="w-36 rounded-xl" />
            <Input type="date" value={customEnd} onChange={(e) => setCustomEnd(e.target.value)} className="w-36 rounded-xl" />
          </>
        )}

        <Select value={statusFilter} onValueChange={(v) => setStatusFilter((v ?? "all") as OrderStatus | "all")}>
          <SelectTrigger className="w-44 rounded-xl">
            <SelectValue>{statusFilter === "all" ? "Todos os status" : ORDER_STATUS_LABEL[statusFilter as OrderStatus]}</SelectValue>
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Todos os status</SelectItem>
            {ALL_ORDER_STATUSES.map((s) => (
              <SelectItem key={s} value={s}>{ORDER_STATUS_LABEL[s]}</SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {isLoading && (
        <div className="flex justify-center py-16">
          <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
        </div>
      )}

      {!isLoading && summary.data && <SummaryCards summary={summary.data} />}

      {!isLoading && revenue.data && (
        <div className="rounded-2xl bg-white shadow-sm border-0 p-5">
          <h2 className="text-sm font-semibold text-foreground mb-1">Receita ao longo do tempo</h2>
          <p className="text-xs text-muted-foreground mb-4">Valores em reais</p>
          <RevenueChart data={revenue.data.dataPoints} />
        </div>
      )}

      {!isLoading && topProducts.data && (
        <div className="rounded-2xl bg-white shadow-sm border-0 p-5">
          <h2 className="text-sm font-semibold text-foreground mb-1">Top produtos</h2>
          <p className="text-xs text-muted-foreground mb-4">Por receita no período</p>
          <TopProductsChart data={topProducts.data} />
        </div>
      )}

      {!isLoading && topClients.data && topClients.data.length > 0 && (
        <div className="rounded-2xl bg-white shadow-sm border-0 p-5">
          <h2 className="text-sm font-semibold text-foreground mb-1">Top clientes</h2>
          <p className="text-xs text-muted-foreground mb-4">Por receita no período</p>
          <div className="space-y-1">
            {topClients.data.slice(0, 5).map((client, i) => (
              <div key={client.clientId} className="flex items-center justify-between rounded-xl px-3 py-2.5 hover:bg-slate-50 transition-colors">
                <div className="flex items-center gap-3">
                  <span className="text-xs font-bold text-muted-foreground w-5 text-center">{i + 1}</span>
                  <div
                    className="flex h-9 w-9 items-center justify-center rounded-full text-white text-sm font-bold shrink-0 shadow-sm"
                    style={{ backgroundColor: "#581629" }}
                  >
                    {client.clientName.charAt(0).toUpperCase()}
                  </div>
                  <div>
                    <p className="text-sm font-semibold leading-tight">{client.clientName}</p>
                    <p className="text-xs text-muted-foreground">
                      {client.orderCount} pedido{client.orderCount !== 1 ? "s" : ""}
                    </p>
                  </div>
                </div>
                <span className="font-bold text-sm">{formatCurrency(client.totalRevenue)}</span>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
