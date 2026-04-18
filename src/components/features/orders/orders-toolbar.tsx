"use client";

import { Search, SlidersHorizontal } from "lucide-react";
import { Input } from "@/components/ui/input";
import { cn } from "@/lib/utils";
import { STATUS_META } from "@/lib/order-status";
import { ALL_ORDER_STATUSES, type OrderStatus } from "@/types/orders";

type Props = {
  search: string;
  onSearchChange: (v: string) => void;
  status: OrderStatus | "all";
  onStatusChange: (s: OrderStatus | "all") => void;
  counts: Record<string, number>;
};

export function OrdersToolbar({ search, onSearchChange, status, onStatusChange, counts }: Props) {
  const total = Object.values(counts).reduce((a, n) => a + n, 0);

  return (
    <div className="space-y-2.5">
      <div className="flex items-center gap-2">
        <div className="relative flex-1">
          <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
          <Input
            value={search}
            onChange={(e) => onSearchChange(e.target.value)}
            placeholder="Buscar por cliente ou nº"
            className="h-9 bg-card pl-9"
          />
        </div>
        <button
          type="button"
          className="flex h-9 w-9 items-center justify-center rounded-lg border border-border bg-card text-muted-foreground md:hidden"
        >
          <SlidersHorizontal size={16} />
        </button>
      </div>

      <div className="flex gap-1.5 overflow-x-auto pb-1">
        <Chip label="Todos" count={total} active={status === "all"} onClick={() => onStatusChange("all")} />
        {ALL_ORDER_STATUSES.map((s) => (
          <Chip
            key={s}
            label={STATUS_META[s].label}
            count={counts[s] ?? 0}
            active={status === s}
            onClick={() => onStatusChange(s)}
          />
        ))}
      </div>
    </div>
  );
}

function Chip({
  label,
  count,
  active,
  onClick,
}: {
  label: string;
  count: number;
  active: boolean;
  onClick: () => void;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={cn(
        "inline-flex items-center gap-1.5 whitespace-nowrap rounded-lg px-3 py-1.5 text-xs font-medium transition-colors",
        active
          ? "bg-foreground text-background"
          : "border border-border bg-card text-foreground-soft hover:bg-accent",
      )}
    >
      {label}
      <span className={cn("font-mono", active ? "opacity-70" : "opacity-50")}>{count}</span>
    </button>
  );
}
