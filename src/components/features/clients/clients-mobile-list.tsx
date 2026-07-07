import { useRouter } from "next/navigation";
import { ChevronRight, MessageCircle } from "lucide-react";
import { ClientAvatar } from "./client-avatar";
import { EmptyState } from "@/components/data/empty-state";
import { EditClientSheet } from "./edit-client-sheet";
import type { Client } from "@/types/clients";

export function ClientsMobileList({ clients }: { clients: Client[] }) {
  const router = useRouter();

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
                {/* Mudamos de <Link> para <div> com onClick programático */}
                <div
                  onClick={() => router.push(`/clients/${c.id}`)}
                  className="flex cursor-pointer items-center gap-3 px-3.5 py-3 active:bg-accent"
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
                    
                    <div className="font-mono text-xs text-foreground-soft flex items-center gap-2 mt-0.5">
                      <span>{c.mobile || "—"}</span>
                      {c.mobile && (
                        <a 
                          href={`https://wa.me/${c.mobile.replace(/\D/g, "")}`}
                          target="_blank" 
                          rel="noopener noreferrer"
                          className="inline-flex items-center text-muted-foreground hover:text-green-500 transition-colors duration-200 p-1"
                          onClick={(e) => e.stopPropagation()} // Agora o stopPropagation funcionará perfeitamente
                          title="Chamar no WhatsApp"
                        >
                          <MessageCircle size={14} className="stroke-[2.5]" />
                        </a>
                      )}
                    </div>
                  </div>
                  <div className="flex items-center gap-0.5 text-muted-foreground" onClick={(e) => e.stopPropagation()}>
                    <EditClientSheet client={c} compact />
                    <ChevronRight size={14} />
                  </div>
                </div>
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