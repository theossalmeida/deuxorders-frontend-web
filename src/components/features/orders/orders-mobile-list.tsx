import { EmptyState } from "@/components/data/empty-state";
import { localDateKey, formatRelativeDay, formatDate } from "@/lib/format";
import { OrderCard } from "./order-card";
import type { Order } from "@/types/orders";

export function OrdersMobileList({
  orders,
  onClearFilters,
  hasFilters,
}: {
  orders: Order[];
  onClearFilters?: () => void;
  hasFilters?: boolean;
}) {
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

  const groups = groupByDay(orders);

  return (
    <div className="space-y-4 pb-4">
      {groups.map((g) => (
        <div key={g.key}>
          <div className="flex items-center justify-between px-1 pb-2">
            <div className="text-[10.5px] font-semibold uppercase tracking-wider text-muted-foreground">
              {formatRelativeDay(g.key)} · {formatDate(g.key)}
            </div>
            <div className="font-mono text-[11px] text-muted-foreground">
              {g.items.length} pedidos
            </div>
          </div>
          <ul className="divide-y divide-border overflow-hidden rounded-xl border border-border bg-card">
            {g.items.map((o) => (
              <li key={o.id}>
                <OrderCard order={o} />
              </li>
            ))}
          </ul>
        </div>
      ))}
    </div>
  );
}

function groupByDay(orders: Order[]) {
  const map = new Map<string, Order[]>();
  for (const o of orders) {
    const key = localDateKey(o.deliveryDate);
    if (!map.has(key)) map.set(key, []);
    map.get(key)!.push(o);
  }
  return [...map.entries()]
    .sort(([a], [b]) => a.localeCompare(b))
    .map(([key, items]) => ({ key, items }));
}
