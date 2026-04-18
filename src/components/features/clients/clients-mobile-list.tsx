import Link from "next/link";
import { ChevronRight } from "lucide-react";
import { ClientAvatar } from "./client-avatar";
import { EmptyState } from "@/components/data/empty-state";
import type { Client } from "@/types/clients";

export function ClientsMobileList({ clients }: { clients: Client[] }) {
  if (clients.length === 0) {
    return <EmptyState title="Nenhum cliente encontrado" />;
  }

  const groups = groupByInitial(clients);

  return (
    <div className="space-y-4 pb-4">
      {groups.map((g) => (
        <div key={g.letter}>
          <div className="px-1 pb-1.5 text-[12px] font-semibold text-brand">{g.letter}</div>
          <ul className="divide-y divide-border overflow-hidden rounded-xl border border-border bg-card">
            {g.items.map((c) => (
              <li key={c.id}>
                <Link
                  href={`/clients/${c.id}`}
                  className="flex items-center gap-3 px-3.5 py-3 active:bg-accent"
                >
                  <ClientAvatar name={c.name} />
                  <div className="min-w-0 flex-1">
                    <div className="flex items-center gap-1.5">
                      <div className="truncate text-sm font-medium">{c.name}</div>
                      {!c.status ? (
                        <span className="rounded bg-muted px-1.5 py-px text-[9px] font-semibold uppercase tracking-wider text-muted-foreground">
                          Inativo
                        </span>
                      ) : null}
                    </div>
                    <div className="mt-0.5 font-mono text-[11px] text-muted-foreground">
                      {c.mobile}
                    </div>
                  </div>
                  <ChevronRight size={14} className="text-muted-foreground" />
                </Link>
              </li>
            ))}
          </ul>
        </div>
      ))}
    </div>
  );
}

function groupByInitial(clients: Client[]) {
  const map = new Map<string, Client[]>();
  for (const c of [...clients].sort((a, b) => a.name.localeCompare(b.name, "pt-BR"))) {
    const k = c.name[0]?.toUpperCase() ?? "#";
    if (!map.has(k)) map.set(k, []);
    map.get(k)!.push(c);
  }
  return [...map.entries()].map(([letter, items]) => ({ letter, items }));
}
