"use client";

import { useRouter } from "next/navigation";
import { ChevronRight, AlertTriangle } from "lucide-react";
import { EmptyState } from "@/components/data/empty-state";
import { formatQuantity, formatUnitCostDisplay } from "@/lib/format";
import { MEASURE_UNIT_SHORT } from "@/types/inventory";
import { cn } from "@/lib/utils";
import type { InventoryMaterial } from "@/types/inventory";

export function InventoryTable({ materials }: { materials: InventoryMaterial[] }) {
  const router = useRouter();

  if (materials.length === 0) {
    return <EmptyState title="Nenhum material encontrado" />;
  }

  return (
    <div className="overflow-hidden rounded-xl border border-border bg-card">
      <div className="grid grid-cols-[1fr_160px_180px_80px_100px_40px] border-b border-border bg-muted/40 px-4 py-2 text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">
        <div>Nome</div>
        <div>Quantidade</div>
        <div>Custo unit.</div>
        <div>Unidade</div>
        <div>Status</div>
        <div />
      </div>
      <ul className="divide-y divide-border">
        {materials.map((m) => {
          const isNegative = m.quantity < 0;
          return (
            <li
              key={m.id}
              className="grid cursor-pointer grid-cols-[1fr_160px_180px_80px_100px_40px] items-center px-4 py-3 text-sm transition-colors hover:bg-accent"
              onClick={() => router.push(`/inventory/${m.id}`)}
            >
              <div className="truncate font-medium">{m.name}</div>
              <div className={cn("flex items-center gap-1 font-mono text-xs", isNegative && "text-destructive")}>
                {isNegative && <AlertTriangle size={12} />}
                {formatQuantity(m.quantity, m.measureUnit)}
              </div>
              <div className="font-mono text-xs text-foreground-soft">
                {formatUnitCostDisplay(m.unitCost, m.measureUnit)}
              </div>
              <div className="text-xs text-muted-foreground">{MEASURE_UNIT_SHORT[m.measureUnit]}</div>
              <div className="flex items-center gap-1.5 text-xs">
                <span className={cn("h-1.5 w-1.5 rounded-full", m.status ? "bg-green-500" : "bg-muted-foreground")} />
                {m.status ? "Ativo" : "Inativo"}
              </div>
              <div className="flex justify-end text-muted-foreground">
                <ChevronRight size={14} />
              </div>
            </li>
          );
        })}
      </ul>
    </div>
  );
}
