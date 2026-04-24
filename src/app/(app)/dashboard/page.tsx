"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Download, Plus } from "lucide-react";
import { AppHeader } from "@/components/shell/app-header";
import { MobileTopBar } from "@/components/shell/mobile-top-bar";
import { PageFilters, periodToRange, type PeriodKey } from "@/components/data/page-filters";
import { localISODate } from "@/lib/format";
import { EmptyState } from "@/components/data/empty-state";
import { DashboardKpis } from "@/components/features/dashboard/dashboard-kpis";
import { RevenueSection } from "@/components/features/dashboard/revenue-section";
import { PipelineSection } from "@/components/features/dashboard/pipeline-section";
import { TopProductsSection } from "@/components/features/dashboard/top-products-section";
import { TopClientsSection } from "@/components/features/dashboard/top-clients-section";
import { useDashboardAll } from "@/hooks/useDashboard";

export default function DashboardPage() {
  const router = useRouter();
  const [period, setPeriod] = useState<PeriodKey>("7d");
  const today = localISODate(new Date());
  const [customRange, setCustomRange] = useState({ start: today, end: today });

  const { startDate, endDate } =
    period === "custom"
      ? { startDate: customRange.start, endDate: customRange.end }
      : periodToRange(period);

  const { summary, revenue, topProducts, topClients } = useDashboardAll({
    startDate,
    endDate,
  });

  const isLoading =
    summary.isLoading || revenue.isLoading || topProducts.isLoading || topClients.isLoading;
  const hasError =
    summary.isError || revenue.isError || topProducts.isError || topClients.isError;

  const isEmpty = !isLoading && !hasError && (summary.data?.totalOrders ?? 0) === 0;

  return (
    <>
      <div className="hidden md:block">
        <AppHeader
          title="Painel"
          subtitle="Visão geral do negócio"
          actions={
            <>
              <PageFilters
                value={period}
                onChange={setPeriod}
                customStart={customRange.start}
                customEnd={customRange.end}
                onCustomChange={(s, e) => setCustomRange({ start: s, end: e })}
              />
              <Button variant="outline" size="sm" className="gap-1.5">
                <Download size={14} /> Exportar
              </Button>
              <Button size="sm" className="gap-1.5" onClick={() => router.push("/orders/new")}>
                <Plus size={14} /> Novo pedido
              </Button>
            </>
          }
        />
      </div>

      <MobileTopBar
        title="Painel"
        eyebrow={new Date().toLocaleDateString("pt-BR", {
          weekday: "short",
          day: "numeric",
          month: "short",
        })}
        right={
          <Button
            variant="outline"
            size="icon"
            className="h-9 w-9"
            onClick={() => router.push("/orders/new")}
          >
            <Plus size={16} />
          </Button>
        }
      />

      <div className="sticky top-[92px] z-10 bg-background px-4 pb-3 md:hidden">
        <PageFilters
          value={period}
          onChange={setPeriod}
          customStart={customRange.start}
          customEnd={customRange.end}
          onCustomChange={(s, e) => setCustomRange({ start: s, end: e })}
        />
      </div>

      <div className="space-y-3 px-4 pt-4 md:space-y-4 md:px-7 md:pt-5">
        {hasError ? (
          <EmptyState
            title="Erro ao carregar"
            description="Não foi possível buscar os dados do painel."
            action={
              <Button
                size="sm"
                onClick={() => {
                  summary.refetch();
                  revenue.refetch();
                  topProducts.refetch();
                  topClients.refetch();
                }}
              >
                Tentar novamente
              </Button>
            }
          />
        ) : isEmpty ? (
          <EmptyState
            title="Sem pedidos ainda"
            description="Crie o primeiro pedido para começar a ver os dados aqui."
            action={
              <Button size="sm" onClick={() => router.push("/orders/new")}>
                <Plus size={14} className="mr-1.5" /> Novo pedido
              </Button>
            }
          />
        ) : (
          <>
            <DashboardKpis data={summary.data} isLoading={isLoading} />
            <div className="grid gap-3 md:grid-cols-[1.6fr_1fr]">
              <RevenueSection data={revenue.data} isLoading={isLoading} />
              <PipelineSection summary={summary.data} isLoading={isLoading} />
            </div>
            <div className="grid gap-3 md:grid-cols-2">
              <TopProductsSection data={topProducts.data} isLoading={isLoading} />
              <TopClientsSection data={topClients.data} isLoading={isLoading} />
            </div>
          </>
        )}
      </div>
    </>
  );
}
