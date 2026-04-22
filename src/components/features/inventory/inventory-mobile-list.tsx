import Link from "next/link";
import { ChevronRight, AlertTriangle } from "lucide-react";
import { EmptyState } from "@/components/data/empty-state";
import { formatQuantity, formatUnitCostDisplay } from "@/lib/format";
import { cn } from "@/lib/utils";
import type { InventoryMaterial } from "@/types/inventory";

export function InventoryMobileList({ materials }: { materials: InventoryMaterial[] }) {
  if (materials.length === 0) {
    return <EmptyState title="Nenhum material encontrado" />;
  }

  return (
    <ul className="divide-y divide-border overflow-hidden rounded-xl border border-border bg-card">
      {materials.map((m) => {
        const isNegative = m.quantity < 0;
        return (
          <li key={m.id}>
            <Link
              href={`/inventory/${m.id}`}
              className="flex items-center gap-3 px-3.5 py-3 active:bg-accent"
            >
              <div className="min-w-0 flex-1">
                <div className="flex items-center gap-1.5">
                  <div className="truncate text-sm font-medium">{m.name}</div>
                  {!m.status ? (
                    <span className="rounded bg-muted px-1.5 py-px text-[9px] font-semibold uppercase tracking-wider text-muted-foreground">
                      Inativo
                    </span>
                  ) : null}
                </div>
                <div className={cn("mt-0.5 flex items-center gap-1 font-mono text-[11px]", isNegative ? "text-destructive" : "text-muted-foreground")}>
                  {isNegative && <AlertTriangle size={10} />}
                  {formatQuantity(m.quantity, m.measureUnit)}
                  <span className="text-muted-foreground/60">·</span>
                  <span className="text-muted-foreground">{formatUnitCostDisplay(m.unitCost, m.measureUnit)}</span>
                </div>
              </div>
              <ChevronRight size={14} className="text-muted-foreground" />
            </Link>
          </li>
        );
      })}
    </ul>
  );
}
