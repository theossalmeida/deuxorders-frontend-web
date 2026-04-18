"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Plus, Download } from "lucide-react";
import { Button } from "@/components/ui/button";
import { AppHeader } from "@/components/shell/app-header";
import { MobileTopBar } from "@/components/shell/mobile-top-bar";
import { PageFilters, periodToRange, type PeriodKey } from "@/components/data/page-filters";
import { CashHeroBalance } from "@/components/features/cash/cash-hero-balance";
import { CashFlowChart } from "@/components/features/cash/cash-flow-chart";
import { CashCategorySection } from "@/components/features/cash/cash-category-section";
import { CashEntriesList } from "@/components/features/cash/cash-entries-list";
import { useCashSummary, useCashEntries } from "@/hooks/useCashFlow";

export default function CashPage() {
  const router = useRouter();
  const [period, setPeriod] = useState<PeriodKey>("month");
  const { startDate, endDate } = periodToRange(period);

  const { data: summary } = useCashSummary({ from: startDate, to: endDate });
  const { data: entriesPage } = useCashEntries({ from: startDate, to: endDate, size: 10 });

  const monthLabel = new Date().toLocaleDateString("pt-BR", { month: "long", year: "numeric" });

  return (
    <>
      <div className="hidden md:block">
        <AppHeader
          title="Caixa"
          subtitle={`Financeiro · ${monthLabel}`}
          actions={
            <>
              <Button variant="outline" size="sm" className="gap-1.5">
                <Download size={14} /> Exportar
              </Button>
              <Button size="sm" className="gap-1.5" onClick={() => router.push("/cash/entries/new")}>
                <Plus size={14} /> Novo lançamento
              </Button>
            </>
          }
        />
      </div>

      <MobileTopBar
        title="Caixa"
        eyebrow="Financeiro"
        right={
          <Button size="icon" className="h-9 w-9" onClick={() => router.push("/cash/entries/new")}>
            <Plus size={16} />
          </Button>
        }
      />

      <div className="space-y-3 px-4 pt-3 md:space-y-4 md:px-7 md:pt-5">
        <PageFilters value={period} onChange={setPeriod} />

        <div className="grid gap-3 md:grid-cols-[1.1fr_1fr]">
          <CashHeroBalance
            netCents={summary?.netBalanceCents}
            inflowCents={summary?.totalInflowCents}
            outflowCents={summary?.totalOutflowCents}
            entriesCount={summary?.totalCount}
            periodLabel={monthLabel}
          />
          <CashFlowChart />
        </div>

        <div className="grid gap-3 md:grid-cols-2">
          <CashCategorySection summary={summary} />
          <CashEntriesList data={entriesPage?.items} />
        </div>
      </div>
    </>
  );
}
