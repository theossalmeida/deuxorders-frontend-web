import Link from "next/link";
import { Truck, ShoppingBag } from "lucide-react";
import { StatusChip } from "@/components/data/status-chip";
import { formatBRL, formatTime } from "@/lib/format";
import type { Order } from "@/types/orders";

export function OrderCard({ order }: { order: Order }) {
  const isDelivery = order.delivery && order.delivery !== "pickup";
  return (
    <Link href={`/orders/${order.id}`} className="block p-3.5 active:bg-accent">
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0">
          <div className="truncate text-sm font-semibold">{order.clientName}</div>
          <div className="mt-0.5 font-mono text-[11px] text-muted-foreground">
            {order.id} · {formatTime(order.deliveryDate)}
          </div>
        </div>
        <div className="font-mono text-sm font-semibold">{formatBRL(order.totalValue)}</div>
      </div>
      <div className="mt-2 flex flex-wrap items-center gap-2">
        <StatusChip status={order.status} />
        <span className="inline-flex items-center gap-1 text-[11px] text-muted-foreground">
          {isDelivery ? <Truck size={12} /> : <ShoppingBag size={12} />}
          {isDelivery ? "Entrega" : "Retirada"}
        </span>
        <span className="text-[11px] text-muted-foreground">· {order.items.length} itens</span>
      </div>
    </Link>
  );
}
