import { cn } from "@/lib/utils";
import type { OrderStatus } from "@/types/orders";
import { STATUS_META } from "@/lib/order-status";

type Props = {
  status: OrderStatus;
  size?: "sm" | "md";
  className?: string;
};

export function StatusChip({ status, size = "sm", className }: Props) {
  const meta = STATUS_META[status];
  return (
    <span
      className={cn(
        "inline-flex items-center gap-1.5 rounded-md font-medium",
        meta.bg,
        meta.fg,
        size === "sm" ? "px-2 py-0.5 text-[11px]" : "px-2.5 py-1 text-xs",
        className,
      )}
    >
      <span className={cn("h-1.5 w-1.5 rounded-full", meta.dot)} aria-hidden />
      {meta.label}
    </span>
  );
}
