import Link from "next/link";
import { StatusChip } from "@/components/data/status-chip";
import { EmptyState } from "@/components/data/empty-state";
import { formatCents, formatDate } from "@/lib/format";
import type { ClientOrder } from "@/types/clients";

export function ClientOrdersHistory({ orders }: { orders: ClientOrder[] }) {
  return (
    <div className="rounded-xl border border-border bg-card">
      <div className="flex items-center justify-between border-b border-border px-4 py-3">
        <div className="text-[13px] font-semibold">
          Histórico de pedidos
          <span className="ml-1.5 text-muted-foreground">· {orders.length}</span>
        </div>
      </div>

      {orders.length === 0 ? (
        <div className="px-4 py-6">
          <EmptyState title="Sem pedidos" />
        </div>
      ) : (
        <>
          <div className="grid grid-cols-3 border-b border-border bg-muted/40 px-4 py-2 text-[10px] font-semibold uppercase tracking-wider text-muted-foreground md:grid-cols-[110px_1fr_170px_100px]">
            <div className="hidden md:block">Nº</div>
            <div className="text-center">Data</div>
            <div className="text-center">Status</div>
            <div className="text-center">Total</div>
          </div>
          <ul className="divide-y divide-border">
            {orders.map((o) => (
              <li key={o.id}>
                <Link
                  href={`/orders/${o.id}`}
                  className="grid grid-cols-3 items-center px-4 py-3 text-sm transition-colors hover:bg-accent md:grid-cols-[110px_1fr_170px_100px]"
                >
                  <span className="hidden truncate font-mono text-[11px] text-muted-foreground md:block">
                    {o.id}
                  </span>
                  <span className="text-center text-xs text-muted-foreground">{formatDate(o.deliveryDate)}</span>
                  <div className="flex justify-center"><StatusChip status={o.status} /></div>
                  <span className="text-center font-mono text-xs font-semibold">
                    {formatCents(o.totalValueCents)}
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
