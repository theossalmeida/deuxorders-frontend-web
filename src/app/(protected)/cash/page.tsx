"use client";

import { useState } from "react";
import Link from "next/link";
import { useCashEntries } from "@/hooks/useCashFlow";
import { CashFlowFilters } from "@/components/cash/CashFlowFilters";
import { CashFlowTable } from "@/components/cash/CashFlowTable";
import { CashFlowCard } from "@/components/cash/CashFlowCard";
import { Button } from "@/components/ui/button";
import { SlidersHorizontal, Plus, Loader2 } from "lucide-react";
import type { CashFlowFilters as Filters } from "@/types/cash";

export default function CashListPage() {
  const [filters, setFilters] = useState<Filters>({ page: 1, size: 50 });
  const [showFilters, setShowFilters] = useState(false);

  const { data, isLoading } = useCashEntries(filters);

  const totalPages = data ? Math.ceil(data.totalCount / (filters.size ?? 50)) : 1;
  const currentPage = filters.page ?? 1;

  return (
    <div className="max-w-6xl mx-auto px-4 py-6 space-y-4">
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
          <Button size="sm" asChild style={{ backgroundColor: "#581629" }}>
            <Link href="/cash/new">
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
        <div className="flex justify-center py-16">
          <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
        </div>
      ) : !data || data.items.length === 0 ? (
        <p className="text-sm text-muted-foreground py-12 text-center">Nenhum lançamento encontrado.</p>
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
    </div>
  );
}
