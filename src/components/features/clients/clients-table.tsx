"use client";

import { useRouter } from "next/navigation";
import { ChevronRight, MessageCircle } from "lucide-react";
import { Switch } from "@/components/ui/switch";
import { ClientAvatar } from "./client-avatar";
import { EmptyState } from "@/components/data/empty-state";
import { useToggleClientStatus } from "@/hooks/useClients";
import type { Client } from "@/types/clients";


export function ClientsTable({ clients }: { clients: Client[] }) {
  const router = useRouter();
  const { mutate: toggleStatus } = useToggleClientStatus();

  if (clients.length === 0) {
    return <EmptyState title="Nenhum cliente encontrado" />;
  }

  return (
    <div className="overflow-hidden rounded-xl border border-border bg-card">
      <div className="grid grid-cols-[50px_1fr_180px_100px_100px_40px] border-b border-border bg-muted/40 px-4 py-2 text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">
        <div />
        <div>Nome</div>
        <div>Telefone</div>
        <div>Pedidos</div>
        <div>Status</div>
        <div />
      </div>
      <ul className="divide-y divide-border">
        {clients.map((c) => (
          <li
            key={c.id}
            className="grid cursor-pointer grid-cols-[50px_1fr_180px_100px_100px_40px] items-center px-4 py-3 text-sm transition-colors hover:bg-accent"
            onClick={() => router.push(`/clients/${c.id}`)}
          >
            <ClientAvatar name={c.name} size="sm" />
            <div className="truncate font-medium">{c.name}</div>
            
            {/* Coluna do Telefone unificada com o Link do WhatsApp */}
            <div className="font-mono text-xs text-foreground-soft flex items-center gap-2">
              <span>{c.mobile || "—"}</span>
              {c.mobile && (
                <a 
                  href={`https://wa.me/${c.mobile.replace(/\D/g, "")}`}
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="inline-flex items-center text-muted-foreground hover:text-green-500 transition-colors duration-200 p-1"
                  onClick={(e) => e.stopPropagation()} // Impede de abrir a rota do cliente ao clicar no ícone
                  title="Chamar no WhatsApp"
                >
                  <MessageCircle size={14} className="stroke-[2.5]" />
                </a>
              )}
            </div>

            <div className="font-mono text-xs">—</div>
            
            <div onClick={(e) => e.stopPropagation()}>
              <Switch
                checked={c.status}
                onCheckedChange={(v) => toggleStatus({ id: c.id, active: v })}
                className="scale-75"
              />
            </div>
            <div className="flex justify-end text-muted-foreground">
              <ChevronRight size={14} />
            </div>
          </li>
        ))}
      </ul>
    </div>
  );
}