import Link from "next/link";
import { Order } from "@/types/orders";
import { OrderStatusBadge } from "./OrderStatusBadge";
import { formatCurrency, formatDate } from "@/lib/format";
import { ChevronRight } from "lucide-react";

interface Props {
  order: Order;
}

export function OrderCard({ order }: Props) {
  return (
    <Link
      href={`/orders/${order.id}`}
      className="flex items-center gap-4 rounded-xl bg-white border border-border p-4 shadow-sm hover:shadow-md transition-shadow"
    >
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2 mb-1.5">
          <span className="text-sm font-bold truncate">
            #{order.id.slice(0, 8)} · {order.clientName}
          </span>
        </div>
        <div className="flex items-center gap-2 flex-wrap">
          <OrderStatusBadge status={order.status} />
          <span className="text-xs text-muted-foreground">
            Entrega: {formatDate(order.deliveryDate)}
          </span>
        </div>
      </div>
      <div className="flex items-center gap-2 shrink-0">
        <span className="text-sm font-semibold">{formatCurrency(order.totalPaid)}</span>
        <ChevronRight className="h-4 w-4 text-muted-foreground" />
      </div>
    </Link>
  );
}
