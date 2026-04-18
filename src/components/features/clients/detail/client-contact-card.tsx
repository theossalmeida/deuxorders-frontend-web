import { Phone } from "lucide-react";
import { ClientAvatar } from "../client-avatar";
import type { Client } from "@/types/clients";

export function ClientContactCard({ client }: { client: Client }) {
  return (
    <div className="rounded-xl border border-border bg-card p-4">
      <div className="flex items-center gap-4">
        <ClientAvatar name={client.name} size="lg" />
        <div>
          <div className="text-[15px] font-semibold">{client.name}</div>
          <div className="mt-1 flex items-center gap-1.5">
            <span
              className="h-1.5 w-1.5 rounded-full"
              style={{ background: client.isActive ? "var(--ok)" : "var(--muted-foreground)" }}
            />
            <span
              className="text-xs font-medium"
              style={{ color: client.isActive ? "var(--ok)" : "var(--muted-foreground)" }}
            >
              {client.isActive ? "Cliente ativo" : "Cliente inativo"}
            </span>
          </div>
        </div>
      </div>
      <div className="mt-4 space-y-2.5">
        <div className="flex items-center gap-2.5">
          <Phone size={13} className="text-muted-foreground" />
          <div>
            <div className="text-[9.5px] font-semibold uppercase tracking-wider text-muted-foreground">
              Telefone
            </div>
            <div className="font-mono text-sm">{client.mobile}</div>
          </div>
        </div>
      </div>
    </div>
  );
}
