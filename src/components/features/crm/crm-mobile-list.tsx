"use client";

import { useRouter } from "next/navigation";
import { MessageCircle } from "lucide-react";
import { ClientAvatar } from "@/components/features/clients/client-avatar";
import { EmptyState } from "@/components/data/empty-state";
import { formatCents, formatDate } from "@/lib/format";
import type { CrmClientSummary } from "@/types/crm";

export function CrmMobileList({ clients }: { clients: CrmClientSummary[] }) {
  const router = useRouter();

  if (clients.length === 0) {
    return <EmptyState title="Nenhum cliente encontrado" />;
  }

  return (
    <ul className="space-y-2.5 pb-4">
      {clients.map((c) => (
        <li
          key={c.clientId}
          onClick={() => router.push(`/clients/${c.clientId}`)}
          className="cursor-pointer rounded-xl border border-border bg-card px-3.5 py-3 active:bg-accent"
        >
          <div className="flex items-center gap-3">
            <ClientAvatar name={c.name} />
            <div className="min-w-0 flex-1">
              <div className="truncate text-sm font-medium">{c.name}</div>
              <div className="mt-0.5 flex items-center gap-2 font-mono text-xs text-foreground-soft">
                <span>{c.mobile || "—"}</span>
                {c.mobile && (
                  <a
                    href={`https://wa.me/${c.mobile.replace(/\D/g, "")}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center p-1 text-muted-foreground transition-colors duration-200 hover:text-green-500"
                    onClick={(e) => e.stopPropagation()}
                    title="Chamar no WhatsApp"
                  >
                    <MessageCircle size={14} className="stroke-[2.5]" />
                  </a>
                )}
              </div>
            </div>
            <div className="shrink-0 text-right">
              <div className="text-sm font-semibold">{formatCents(c.totalSpendCents)}</div>
              <div className="text-[11px] text-muted-foreground">{c.orderCount} pedidos</div>
            </div>
          </div>

          <div className="mt-2.5 flex items-center justify-between border-t border-border pt-2 text-[11px] text-muted-foreground">
            <span className="truncate">
              {c.lastOrderInfo.products.length > 0
                ? c.lastOrderInfo.products.join(", ")
                : "Sem itens"}
            </span>
            <span className="shrink-0 pl-2 font-mono">{formatDate(c.lastOrderDate)}</span>
          </div>
        </li>
      ))}
    </ul>
  );
}
