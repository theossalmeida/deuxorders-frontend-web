import Link from "next/link";
import { CashEntryRow } from "./cash-entry-row";
import { EmptyState } from "@/components/data/empty-state";
import type { CashFlowEntry } from "@/types/cash";

type Props = { data?: CashFlowEntry[] };

export function CashEntriesList({ data }: Props) {
  return (
    <div className="rounded-xl border border-border bg-card">
      <div className="flex items-center justify-between border-b border-border px-4 py-3">
        <div className="text-[13px] font-semibold">Últimos lançamentos</div>
        <Link href="/cash/entries" className="text-[11px] font-semibold text-brand">
          Ver tudo →
        </Link>
      </div>
      {data && data.length > 0 ? (
        <ul className="divide-y divide-border">
          {data.slice(0, 6).map((e) => (
            <li key={e.id}>
              <CashEntryRow entry={e} />
            </li>
          ))}
        </ul>
      ) : (
        <div className="py-6">
          <EmptyState title="Sem lançamentos" />
        </div>
      )}
    </div>
  );
}
