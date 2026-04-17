import { STATUS_META } from "@/lib/order-status";
import type { OrderStatus } from "@/types/orders";

type Row = { status: OrderStatus; count: number };

type Props = { data: Row[]; title?: string };

export function PipelineList({ data, title = "Pipeline de pedidos" }: Props) {
  const max = Math.max(...data.map((r) => r.count), 1);

  return (
    <div className="rounded-xl border border-border bg-card p-4">
      <div className="text-xs font-semibold">{title}</div>
      <ul className="mt-3 divide-y divide-border">
        {data.map((r) => {
          const meta = STATUS_META[r.status];
          return (
            <li key={r.status} className="py-2">
              <div className="mb-1.5 flex items-center justify-between text-xs">
                <span className="flex items-center gap-1.5">
                  <span className={`h-1.5 w-1.5 rounded-full ${meta.dot}`} aria-hidden />
                  <span className="font-medium">{meta.label}</span>
                </span>
                <span className="font-mono font-semibold">{r.count}</span>
              </div>
              <div className="h-1 rounded-full bg-muted">
                <div
                  className={`h-full rounded-full ${meta.dot}`}
                  style={{ width: `${(r.count / max) * 100}%` }}
                />
              </div>
            </li>
          );
        })}
      </ul>
    </div>
  );
}
