"use client";

import { useState } from "react";
import Link from "next/link";
import { useCashEntries } from "@/hooks/useCashFlow";
import { CashFlowFilters } from "@/components/cash/CashFlowFilters";
import { CashFlowTable } from "@/components/cash/CashFlowTable";
import { CashFlowCard } from "@/components/cash/CashFlowCard";
import { Button } from "@/components/ui/button";
import { SlidersHorizontal, Plus, Receipt } from "lucide-react";
import type { CashFlowFilters as Filters } from "@/types/cash";
import { SkeletonList } from "@/components/ui/skeleton-list";
import { EmptyState } from "@/components/ui/empty-state";
import { PageShell } from "@/components/layout/PageShell";

export default function CashListPage() {
  const [filters, setFilters] = useState<Filters>({ page: 1, size: 50 });
  const [showFilters, setShowFilters] = useState(false);

  const { data, isLoading } = useCashEntries(filters);

  const totalPages = data ? Math.ceil(data.totalCount / (filters.size ?? 50)) : 1;
  const currentPage = filters.page ?? 1;

  return (
    <PageShell variant="list" className="space-y-4">
      {/* Header */}
      <div className="flex items-center justify-between gap-3">
        <h1 className="text-xl font-bold">Lançamentos</h1>
        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={() => setShowFilters((v) => !v)}
          >
            <SlidersHorizontal className="h-4 w-4 mr-1.5" />
            Filtros
          </Button>
          <Button size="sm" asChild className="bg-brand hover:bg-brand-hover text-brand-foreground">
            <Link href="/cash/entries/new">
              <Plus className="h-4 w-4 mr-1.5" />
              Novo lançamento
            </Link>
          </Button>
        </div>
      </div>

      {/* Filters */}
      {showFilters && (
        <CashFlowFilters
          filters={filters}
          onChange={setFilters}
        />
      )}

      {/* Content */}
      {isLoading ? (
        <SkeletonList variant="rows" />
      ) : !data || data.items.length === 0 ? (
        <EmptyState
          icon={Receipt}
          title="Nenhum lançamento encontrado"
          hint="Ajuste o período ou crie um novo lançamento."
        />
      ) : (
        <>
          <div className="hidden md:block">
            <CashFlowTable entries={data.items} />
          </div>
          <div className="md:hidden">
            <CashFlowCard entries={data.items} />
          </div>
        </>
      )}

      {/* Pagination */}
      {data && totalPages > 1 && (
        <div className="flex items-center justify-center gap-3 pt-2">
          <Button
            variant="outline"
            size="sm"
            disabled={currentPage <= 1}
            onClick={() => setFilters((f) => ({ ...f, page: (f.page ?? 1) - 1 }))}
          >
            Anterior
          </Button>
          <span className="text-sm text-muted-foreground">
            Página {currentPage} de {totalPages}
          </span>
          <Button
            variant="outline"
            size="sm"
            disabled={currentPage >= totalPages}
            onClick={() => setFilters((f) => ({ ...f, page: (f.page ?? 1) + 1 }))}
          >
            Próxima
          </Button>
        </div>
      )}
    </PageShell>
  );
}
