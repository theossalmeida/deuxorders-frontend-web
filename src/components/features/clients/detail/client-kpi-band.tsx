import { cn } from "@/lib/utils";
import { formatBRL, formatDate } from "@/lib/format";

export type ClientStats = {
  totalOrders: number;
  totalSpent: number;
  lastOrderDate: string | null;
};

export function ClientKpiBand({ stats }: { stats?: ClientStats }) {
  const avg =
    stats && stats.totalOrders ? Math.round(stats.totalSpent / stats.totalOrders) : 0;

  const items = [
    {
      k: "Pedidos",
      v: stats ? String(stats.totalOrders) : "—",
      mono: true,
    },
    {
      k: "Total gasto",
      v: stats ? formatBRL(stats.totalSpent) : "—",
      mono: true,
      strong: true,
    },
    {
      k: "Ticket médio",
      v: stats && stats.totalOrders ? formatBRL(avg) : "—",
      mono: true,
    },
    {
      k: "Último pedido",
      v: stats?.lastOrderDate ? formatDate(stats.lastOrderDate) : "—",
    },
  ];

  return (
    <div className="grid grid-cols-2 gap-2.5 md:grid-cols-4">
      {items.map((item) => (
        <div key={item.k} className="rounded-lg border border-border bg-card px-3.5 py-3">
          <div className="text-[10.5px] font-semibold uppercase tracking-wider text-muted-foreground">
            {item.k}
          </div>
          <div
            className={cn(
              "mt-1 font-semibold tracking-tight",
              item.mono && "font-mono",
              item.strong ? "text-[22px]" : "text-[18px]",
            )}
          >
            {item.v}
          </div>
        </div>
      ))}
    </div>
  );
}
