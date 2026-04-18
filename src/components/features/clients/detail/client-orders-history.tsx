import Link from "next/link";
import { StatusChip } from "@/components/data/status-chip";
import { EmptyState } from "@/components/data/empty-state";
import { formatBRL, formatDate } from "@/lib/format";
import type { Order } from "@/types/orders";

type Props = { orders?: Order[]; isGapPlaceholder?: boolean };

export function ClientOrdersHistory({ orders, isGapPlaceholder }: Props) {
  return (
    <div className="rounded-xl border border-border bg-card">
      <div className="flex items-center justify-between border-b border-border px-4 py-3">
        <div className="text-[13px] font-semibold">
          Histórico de pedidos
          {orders && (
            <span className="ml-1.5 text-muted-foreground">· {orders.length}</span>
          )}
        </div>
      </div>

      {isGapPlaceholder || !orders ? (
        <div className="px-4 py-6">
          <EmptyState
            title="Histórico indisponível"
            description="O histórico de pedidos por cliente será exibido quando o backend expor esse endpoint."
          />
        </div>
      ) : orders.length === 0 ? (
        <div className="px-4 py-6">
          <EmptyState title="Sem pedidos" />
        </div>
      ) : (
        <>
          <div className="grid grid-cols-[110px_1fr_170px_100px] border-b border-border bg-muted/40 px-4 py-2 text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">
            <div>Nº</div>
            <div>Data</div>
            <div>Status</div>
            <div className="text-right">Total</div>
          </div>
          <ul className="divide-y divide-border">
            {orders.map((o) => (
              <li key={o.id}>
                <Link
                  href={`/orders/${o.id}`}
                  className="grid grid-cols-[110px_1fr_170px_100px] items-center px-4 py-3 text-sm transition-colors hover:bg-accent"
                >
                  <span className="truncate font-mono text-[11px] text-muted-foreground">
                    {o.id}
                  </span>
                  <span className="text-xs text-muted-foreground">{formatDate(o.deliveryDate)}</span>
                  <StatusChip status={o.status} />
                  <span className="text-right font-mono text-xs font-semibold">
                    {formatBRL(o.totalValue)}
                  </span>
                </Link>
              </li>
            ))}
          </ul>
        </>
      )}
    </div>
  );
}
