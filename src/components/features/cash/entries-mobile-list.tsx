import { cn } from "@/lib/utils";
import { localDateKey, formatDate, formatCents } from "@/lib/format";
import { CashEntryRow } from "./cash-entry-row";
import { EmptyState } from "@/components/data/empty-state";
import type { CashFlowEntry } from "@/types/cash";

export function EntriesMobileList({ entries }: { entries: CashFlowEntry[] }) {
  if (entries.length === 0) {
    return <EmptyState title="Sem lançamentos" />;
  }

  const groups = groupByDay(entries);

  return (
    <div className="space-y-4 pb-4">
      {groups.map((g) => {
        const net = g.items.reduce(
          (a, e) => a + (e.type === "Inflow" ? e.amountCents : -e.amountCents),
          0,
        );
        return (
          <div key={g.key}>
            <div className="flex items-center justify-between px-1 pb-2">
              <div className="text-[10.5px] font-semibold uppercase tracking-wider text-muted-foreground">
                {formatDate(g.key)}
              </div>
              <div className={cn("font-mono text-[11px] font-semibold", net >= 0 ? "text-ok" : "text-destructive")}>
                {net >= 0 ? "+" : "−"}
                {formatCents(Math.abs(net))}
              </div>
            </div>
            <ul className="divide-y divide-border overflow-hidden rounded-xl border border-border bg-card">
              {g.items.map((e) => (
                <li key={e.id}>
                  <CashEntryRow entry={e} />
                </li>
              ))}
            </ul>
          </div>
        );
      })}
    </div>
  );
}

function groupByDay(entries: CashFlowEntry[]) {
  const map = new Map<string, CashFlowEntry[]>();
  for (const e of entries) {
    const key = localDateKey(e.billingDate);
    if (!map.has(key)) map.set(key, []);
    map.get(key)!.push(e);
  }
  return [...map.entries()]
    .sort(([a], [b]) => b.localeCompare(a))
    .map(([key, items]) => ({ key, items }));
}
