import Link from "next/link";
import { ChevronRight, Truck, ShoppingBag } from "lucide-react";
import { StatusChip } from "@/components/data/status-chip";
import { EmptyState } from "@/components/data/empty-state";
import { formatCents, formatDate, formatTime } from "@/lib/format";
import type { Order } from "@/types/orders";

type Props = { orders: Order[]; onClearFilters?: () => void; hasFilters?: boolean };

export function OrdersTable({ orders, onClearFilters, hasFilters }: Props) {
  if (orders.length === 0) {
    return hasFilters ? (
      <EmptyState
        title="Nenhum pedido encontrado"
        description="Tente ajustar os filtros."
        action={
          onClearFilters ? (
            <button
              type="button"
              onClick={onClearFilters}
              className="text-xs font-semibold text-brand hover:underline"
            >
              Limpar filtros
            </button>
          ) : undefined
        }
      />
    ) : (
      <EmptyState title="Sem pedidos ainda" description="Crie o primeiro pedido para começar." />
    );
  }

  return (
    <div className="overflow-hidden rounded-xl border border-border bg-card">
      <div className="grid grid-cols-[110px_1fr_220px_170px_120px_40px] border-b border-border bg-muted/40 px-4 py-2 text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">
        <div>Nº</div>
        <div>Cliente</div>
        <div>Entrega</div>
        <div>Status</div>
        <div>Total</div>
        <div />
      </div>
      <ul className="divide-y divide-border">
        {orders.map((o) => {
          const isDelivery = o.delivery && o.delivery !== "pickup";
          return (
            <li key={o.id}>
              <Link
                href={`/orders/${o.id}`}
                className="grid grid-cols-[110px_1fr_220px_170px_120px_40px] items-center px-4 py-3 text-sm transition-colors hover:bg-accent"
              >
                <span className="truncate font-mono text-[11px] text-muted-foreground">{o.id}</span>
                <span className="truncate font-medium">{o.clientName}</span>
                <span className="flex items-center gap-1.5 text-xs text-foreground-soft">
                  {isDelivery ? <Truck size={12} /> : <ShoppingBag size={12} />}
                  {formatDate(o.deliveryDate)} · {formatTime(o.deliveryDate)}
                </span>
                <span>
                  <StatusChip status={o.status} />
                </span>
                <span className="font-mono font-semibold">{formatCents(o.totalValueCents)}</span>
                <span className="flex justify-end text-muted-foreground">
                  <ChevronRight size={14} />
                </span>
              </Link>
            </li>
          );
        })}
      </ul>
    </div>
  );
}
