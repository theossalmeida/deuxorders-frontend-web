import { Check } from "lucide-react";
import { cn } from "@/lib/utils";
import { STATUS_META } from "@/lib/order-status";
import type { OrderStatus } from "@/types/orders";

const PIPELINE: OrderStatus[] = ["Received", "Preparing", "WaitingPickupOrDelivery", "Completed"];

export function OrderStatusPipeline({
  current,
  size = "md",
}: {
  current: OrderStatus;
  size?: "sm" | "md";
}) {
  const currentIdx = PIPELINE.indexOf(current);
  const dot = size === "sm" ? 18 : 22;

  return (
    <div className="flex items-start gap-1">
      {PIPELINE.map((s, i) => {
        const reached = i <= currentIdx;
        const meta = STATUS_META[s];
        return (
          <div key={s} className="contents">
            <div className="flex flex-1 flex-col items-center gap-1.5">
              <div
                className={cn(
                  "flex items-center justify-center rounded-full",
                  reached ? `${meta.bg} ${meta.fg}` : "bg-muted text-muted-foreground",
                )}
                style={{ width: dot, height: dot }}
              >
                {reached ? <Check size={size === "sm" ? 11 : 13} /> : null}
              </div>
              <div
                className={cn(
                  "text-center text-[10px] font-medium leading-tight",
                  reached ? "text-foreground" : "text-muted-foreground",
                )}
              >
                {meta.label}
              </div>
            </div>
            {i < PIPELINE.length - 1 && (
              <div
                className={cn("mt-[11px] h-0.5 flex-1", reached ? meta.dot : "bg-border")}
                style={size === "md" ? { marginTop: 11 } : { marginTop: 9 }}
              />
            )}
          </div>
        );
      })}
    </div>
  );
}
