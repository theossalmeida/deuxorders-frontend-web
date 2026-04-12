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
      <div className="flex items-center justify-between">
        <h1 className="text-xl font-bold">Dashboard</h1>
        <div className="flex gap-2">
          <Button
            variant="outline"
            size="sm"
            disabled={isExporting}
            onClick={() => handleExport("csv")}
          >
            {isExporting ? (
              <Loader2 className="h-3.5 w-3.5 animate-spin" />
            ) : (
              <Download className="h-3.5 w-3.5 mr-1" />
            )}
            CSV
          </Button>
          <Button
            variant="outline"
            size="sm"
            disabled={isExporting}
            onClick={() => handleExport("pdf")}
          >
            {isExporting ? (
              <Loader2 className="h-3.5 w-3.5 animate-spin" />
            ) : (
              <Download className="h-3.5 w-3.5 mr-1" />
            )}
            PDF
          </Button>
        </div>
      </div>

      {/* Filters */}
      <div className="flex flex-wrap gap-2 items-end">
        {(["today", "week", "month", "custom"] as Preset[]).map((p) => (
          <button
            key={p}
            onClick={() => setPreset(p)}
            className={`rounded-full px-3 py-1 text-sm font-medium border transition-colors ${
              preset === p
                ? "text-white border-transparent"
                : "border-border text-muted-foreground hover:border-primary"
            }`}
            style={preset === p ? { backgroundColor: "#581629" } : undefined}
          >
            {p === "today" ? "Hoje" : p === "week" ? "7 dias" : p === "month" ? "Mês" : "Período"}
          </button>
        ))}

        {preset === "custom" && (
          <>
            <Input
              type="date"
              value={customStart}
              onChange={(e) => setCustomStart(e.target.value)}
              className="w-36"
            />
            <Input
              type="date"
              value={customEnd}
              onChange={(e) => setCustomEnd(e.target.value)}
              className="w-36"
            />
          </>
        )}

        <Select
          value={statusFilter}
          onValueChange={(v) => setStatusFilter((v ?? "all") as OrderStatus | "all")}
        >
          <SelectTrigger className="w-44">
            <SelectValue placeholder="Status" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Todos os status</SelectItem>
            {ALL_ORDER_STATUSES.map((s) => (
              <SelectItem key={s} value={s}>
                {ORDER_STATUS_LABEL[s]}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {isLoading && (
        <div className="flex justify-center py-16">
          <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
        </div>
      )}

      {!isLoading && summary.data && (
        <SummaryCards summary={summary.data} />
      )}

      {!isLoading && revenue.data && (
        <div className="rounded-xl border bg-white p-4 shadow-sm">
          <h2 className="text-sm font-semibold mb-4">Receita ao longo do tempo</h2>
          <RevenueChart data={revenue.data.dataPoints} />
        </div>
      )}

      {!isLoading && topProducts.data && (
        <div className="rounded-xl border bg-white p-4 shadow-sm">
          <h2 className="text-sm font-semibold mb-4">Top produtos</h2>
          <TopProductsChart data={topProducts.data} />
        </div>
      )}

      {!isLoading && topClients.data && topClients.data.length > 0 && (
        <div className="rounded-xl border bg-white p-4 shadow-sm">
          <h2 className="text-sm font-semibold mb-4">Top clientes</h2>
          <div className="space-y-2">
            {topClients.data.slice(0, 5).map((client, i) => (
              <div key={client.clientId} className="flex items-center justify-between py-1.5">
                <div className="flex items-center gap-3">
                  <span className="text-xs font-bold text-muted-foreground w-4">
                    #{i + 1}
                  </span>
                  <div
                    className="flex h-8 w-8 items-center justify-center rounded-full text-white text-xs font-bold shrink-0"
                    style={{ backgroundColor: "#581629" }}
                  >
                    {client.clientName.charAt(0).toUpperCase()}
                  </div>
                  <div>
                    <p className="text-sm font-medium">{client.clientName}</p>
                    <p className="text-xs text-muted-foreground">
                      {client.orderCount} pedido{client.orderCount !== 1 ? "s" : ""}
                    </p>
                  </div>
                </div>
                <span className="font-semibold text-sm">
                  {formatCurrency(client.totalRevenue)}
                </span>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
