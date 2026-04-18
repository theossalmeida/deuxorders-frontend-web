"use client";

import { use } from "react";
import { useRouter } from "next/navigation";
import { ArrowLeft } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { CashEntryRow } from "@/components/features/cash/cash-entry-row";
import { useCashEntry } from "@/hooks/useCashFlow";

export default function CashEntryDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  const router = useRouter();
  const { data: entry, isLoading } = useCashEntry(id);

  return (
    <>
      <div className="sticky top-0 z-20 flex items-center gap-3 bg-background px-4 pt-14 pb-3">
        <button type="button" onClick={() => router.back()}>
          <ArrowLeft size={18} />
        </button>
        <span className="font-semibold">Lançamento</span>
      </div>

      <div className="px-4 pt-4 pb-8">
        {isLoading ? (
          <Skeleton className="h-16 rounded-xl" />
        ) : entry ? (
          <div className="rounded-xl border border-border bg-card">
            <CashEntryRow entry={entry} />
          </div>
        ) : (
          <p className="text-sm text-muted-foreground">Lançamento não encontrado.</p>
        )}
        <Button variant="outline" size="sm" className="mt-4" onClick={() => router.back()}>
          Voltar
        </Button>
      </div>
    </>
  );
}
