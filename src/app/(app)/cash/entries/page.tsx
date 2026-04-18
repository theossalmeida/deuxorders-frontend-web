"use client";

import { useState, useMemo } from "react";
import { useRouter } from "next/navigation";
import { Plus, Download } from "lucide-react";
import { Button } from "@/components/ui/button";
import { AppHeader } from "@/components/shell/app-header";
import { MobileTopBar } from "@/components/shell/mobile-top-bar";
import { EntriesToolbar } from "@/components/features/cash/entries-toolbar";
import { EntriesSummaryBand } from "@/components/features/cash/entries-summary-band";
import { EntriesTable } from "@/components/features/cash/entries-table";
import { EntriesMobileList } from "@/components/features/cash/entries-mobile-list";
import { SkeletonList } from "@/components/ui/skeleton-list";
import { useCashEntries, useCashSummary } from "@/hooks/useCashFlow";
import type { CashFlowType } from "@/types/cash";

export default function CashEntriesPage() {
  const router = useRouter();
  const [search, setSearch] = useState("");
  const [type, setType] = useState<CashFlowType | "all">("all");

  const { data: entriesPage, isLoading } = useCashEntries({ size: 200 });
  const { data: summary } = useCashSummary({});

  const entries = entriesPage?.items ?? [];

  const filtered = useMemo(
    () =>
      entries.filter(
        (e) =>
          (type === "all" || e.type === type) &&
          (search === "" || e.counterparty.toLowerCase().includes(search.toLowerCase())),
      ),
    [entries, type, search],
  );

  return (
    <>
      <div className="hidden md:block">
        <AppHeader
          title="Lançamentos"
          subtitle={`Financeiro · ${entries.length} registros`}
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
        title="Lançamentos"
        eyebrow="Financeiro"
        right={
          <Button size="icon" className="h-9 w-9" onClick={() => router.push("/cash/entries/new")}>
            <Plus size={16} />
          </Button>
        }
      />

      <div className="space-y-3 px-4 pt-3 md:px-7 md:pt-5">
        <EntriesToolbar
          search={search}
          onSearchChange={setSearch}
          type={type}
          onTypeChange={setType}
        />

        <div className="hidden md:block">
          <EntriesSummaryBand summary={summary} />
        </div>

        {isLoading ? (
          <SkeletonList variant="rows" count={8} />
        ) : (
          <>
            <div className="hidden md:block">
              <EntriesTable entries={filtered} />
            </div>
            <div className="md:hidden">
              <EntriesMobileList entries={filtered} />
            </div>
          </>
        )}
      </div>
    </>
  );
}
