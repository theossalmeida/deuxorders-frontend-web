import { ArrowDownRight, ArrowUpRight, MoreHorizontal } from "lucide-react";
import { cn } from "@/lib/utils";
import { formatCents, formatDate } from "@/lib/format";
import { CASH_CATEGORY_LABEL, type CashFlowEntry, type CashFlowSource } from "@/types/cash";
import { EmptyState } from "@/components/data/empty-state";

const isAuto = (src: CashFlowSource) => src === "OrderPayment" || src === "OrderReversal";

export function EntriesTable({ entries }: { entries: CashFlowEntry[] }) {
  if (entries.length === 0) {
    return <EmptyState title="Sem lançamentos" description="Nenhum lançamento encontrado." />;
  }

  return (
    <div className="overflow-hidden rounded-xl border border-border bg-card">
      <div
        className="grid border-b border-border bg-muted/40 px-4 py-2.5 text-[10.5px] font-semibold uppercase tracking-wider text-muted-foreground"
        style={{ gridTemplateColumns: "90px 1fr 160px 110px 140px 40px" }}
      >
        <div>Data</div>
        <div>Descrição</div>
        <div>Categoria</div>
        <div>Origem</div>
        <div className="text-right">Valor</div>
        <div />
      </div>
      {entries.map((e) => {
        const inflow = e.type === "Inflow";
        const Icon = inflow ? ArrowDownRight : ArrowUpRight;
        return (
          <div
            key={e.id}
            className="grid items-center border-b border-border px-4 py-3 last:border-0 hover:bg-muted/30"
            style={{ gridTemplateColumns: "90px 1fr 160px 110px 140px 40px" }}
          >
            <div className="font-mono text-[11.5px] text-muted-foreground">
              {formatDate(e.billingDate)}
            </div>
            <div className="flex min-w-0 items-center gap-2.5">
              <div
                className={cn(
                  "flex h-7 w-7 shrink-0 items-center justify-center rounded-full",
                  inflow ? "bg-ok/10 text-ok" : "bg-destructive/10 text-destructive",
                )}
              >
                <Icon size={13} strokeWidth={1.8} />
              </div>
              <div className="truncate text-sm">{e.counterparty}</div>
            </div>
            <div>
              <span className="inline-block rounded-full bg-muted px-2 py-0.5 text-[11px] font-medium text-foreground">
                {CASH_CATEGORY_LABEL[e.category]}
              </span>
            </div>
            <div className="font-mono text-[11px] text-muted-foreground">
              {isAuto(e.source) ? "automática" : "manual"}
            </div>
            <div
              className={cn(
                "text-right font-mono text-sm font-semibold",
                inflow ? "text-ok" : "text-foreground",
              )}
            >
              {inflow ? "+" : "−"}
              {formatCents(e.amountCents)}
            </div>
            <button
              type="button"
              className="text-muted-foreground hover:text-foreground"
              aria-label="Ações"
            >
              <MoreHorizontal size={16} />
            </button>
          </div>
        );
      })}
    </div>
  );
}
