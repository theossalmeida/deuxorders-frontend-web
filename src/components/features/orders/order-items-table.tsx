import { cn } from "@/lib/utils";
import { formatCents } from "@/lib/format";
import type { OrderItem } from "@/types/orders";

export function OrderItemsTable({ items }: { items: OrderItem[] }) {
  const subtotalCents = items
    .filter((i) => !i.itemCanceled)
    .reduce((a, i) => a + i.totalValueCents, 0);

  return (
    <div className="overflow-hidden rounded-xl border border-border bg-card">
      <div className="grid grid-cols-[56px_1fr_70px_110px] border-b border-border bg-muted/40 px-4 py-2 text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">
        <div />
        <div>Produto</div>
        <div className="text-center">Qtd</div>
        <div className="text-right">Subtotal</div>
      </div>
      <ul className="divide-y divide-border">
        {items.map((item, i) => (
          <li
            key={i}
            className={cn(
              "grid grid-cols-[56px_1fr_70px_110px] items-center px-4 py-3",
              item.itemCanceled && "opacity-40",
            )}
          >
            <div className="h-10 w-10 rounded-md bg-muted" />
            <div className="min-w-0">
              <div className="truncate text-sm font-medium">{item.productName}</div>
              <div className="mt-0.5 font-mono text-[11px] text-muted-foreground">
                {formatCents(item.paidUnitPriceCents)} · un
                {item.itemCanceled && (
                  <span className="ml-2 rounded bg-destructive/10 px-1.5 py-0.5 text-[9px] font-semibold uppercase text-destructive">
                    Cancelado
                  </span>
                )}
              </div>
            </div>
            <div className="text-center font-mono text-sm">{item.quantity}×</div>
            <div className="text-right font-mono text-sm font-semibold">
              {formatCents(item.totalValueCents)}
            </div>
          </li>
        ))}
      </ul>
      <div className="grid grid-cols-[1fr_110px] border-t border-border bg-muted/40 px-4 py-3">
        <div className="text-sm font-semibold">Total</div>
        <div className="text-right font-mono text-base font-semibold tracking-tight">
          {formatCents(subtotalCents)}
        </div>
      </div>
    </div>
  );
}
