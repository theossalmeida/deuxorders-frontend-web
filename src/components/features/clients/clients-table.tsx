import Link from "next/link";
import { ChevronRight } from "lucide-react";
import { ClientAvatar } from "./client-avatar";
import { EmptyState } from "@/components/data/empty-state";
import type { Client } from "@/types/clients";

export function ClientsTable({ clients }: { clients: Client[] }) {
  if (clients.length === 0) {
    return <EmptyState title="Nenhum cliente encontrado" />;
  }

  return (
    <div className="overflow-hidden rounded-xl border border-border bg-card">
      <div className="grid grid-cols-[50px_1fr_180px_100px_80px_40px] border-b border-border bg-muted/40 px-4 py-2 text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">
        <div />
        <div>Nome</div>
        <div>Telefone</div>
        <div>Pedidos</div>
        <div>Status</div>
        <div />
      </div>
      <ul className="divide-y divide-border">
        {clients.map((c) => (
          <li key={c.id}>
            <Link
              href={`/clients/${c.id}`}
              className="grid grid-cols-[50px_1fr_180px_100px_80px_40px] items-center px-4 py-3 text-sm transition-colors hover:bg-accent"
            >
              <ClientAvatar name={c.name} size="sm" />
              <div className="truncate font-medium">{c.name}</div>
              <div className="font-mono text-xs text-foreground-soft">{c.mobile}</div>
              <div className="font-mono text-xs">—</div>
              <div className="text-xs">
                {c.isActive ? (
                  <span className="inline-flex items-center gap-1 text-ok">
                    <span className="h-1.5 w-1.5 rounded-full bg-ok" />
                    Ativo
                  </span>
                ) : (
                  <span className="text-muted-foreground">Inativo</span>
                )}
              </div>
              <div className="flex justify-end text-muted-foreground">
                <ChevronRight size={14} />
              </div>
            </Link>
          </li>
        ))}
      </ul>
    </div>
  );
}
