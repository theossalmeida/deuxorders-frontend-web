import { cn } from "@/lib/utils";
import { OrderStatus, ORDER_STATUS_COLOR, ORDER_STATUS_LABEL } from "@/types/orders";

interface Props {
  status: OrderStatus;
  className?: string;
}

export function OrderStatusBadge({ status, className }: Props) {
  return (
    <span
      className={cn(
        "inline-flex items-center rounded-md px-2 py-0.5 text-xs font-semibold",
        ORDER_STATUS_COLOR[status],
        className
      )}
    >
      {ORDER_STATUS_LABEL[status]}
    </span>
  );
}
