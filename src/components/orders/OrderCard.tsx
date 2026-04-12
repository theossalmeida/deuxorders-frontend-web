import Link from "next/link";
import { Order, OrderStatus } from "@/types/orders";
import { OrderStatusBadge } from "./OrderStatusBadge";
import { formatCurrency, formatDateTime } from "@/lib/format";
import { ChevronRight, MapPin, Package } from "lucide-react";

const STATUS_BORDER: Record<OrderStatus, string> = {
  Received: "border-l-blue-400",
  Pending: "border-l-amber-400",
  Preparing: "border-l-orange-400",
  WaitingPickupOrDelivery: "border-l-violet-400",
  Completed: "border-l-emerald-400",
  Canceled: "border-l-red-300",
};

interface Props {
  order: Order;
}

export function OrderCard({ order }: Props) {
  const isPickup = !order.delivery || order.delivery === "pickup";

  return (
    <Link
      href={`/orders/${order.id}`}
      className={`flex items-center gap-4 rounded-2xl bg-white border-l-4 ${STATUS_BORDER[order.status]} shadow-sm hover:shadow-md hover:-translate-y-px transition-all duration-150 px-4 py-3.5`}
    >
      <div className="flex-1 min-w-0 space-y-1.5">
        <div className="flex items-center gap-2">
          <span className="text-sm font-bold truncate">{order.clientName}</span>
          <span className="text-xs text-muted-foreground font-mono shrink-0">#{order.id.slice(0, 8)}</span>
        </div>
        <div className="flex items-center gap-2 flex-wrap">
          <OrderStatusBadge status={order.status} />
          <span className="flex items-center gap-1 text-xs text-muted-foreground">
            <Package className="h-3 w-3" />
            {formatDateTime(order.deliveryDate)}
          </span>
          {!isPickup && (
            <span className="flex items-center gap-1 text-xs text-muted-foreground">
              <MapPin className="h-3 w-3" />
              Entrega
            </span>
          )}
        </div>
      </div>
      <div className="flex items-center gap-2 shrink-0">
        <span className="text-sm font-bold">{formatCurrency(order.totalPaid)}</span>
        <ChevronRight className="h-4 w-4 text-muted-foreground/50" />
      </div>
    </Link>
  );
}
