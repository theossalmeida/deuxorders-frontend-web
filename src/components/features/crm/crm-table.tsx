"use client";

import { useRouter } from "next/navigation";
import { ChevronRight, MessageCircle } from "lucide-react";
import { ClientAvatar } from "@/components/features/clients/client-avatar";
import { EmptyState } from "@/components/data/empty-state";
import { formatCents, formatDate } from "@/lib/format";
import { CRM_TIER_META, buildWhatsAppLink, buildWinBackMessage, getCrmTier, isLapsedTier } from "@/lib/crm";
import { cn } from "@/lib/utils";
import type { CrmClientSummary } from "@/types/crm";

export function CrmTable({ clients }: { clients: CrmClientSummary[] }) {
  const router = useRouter();

  if (clients.length === 0) {
    return <EmptyState title="Nenhum cliente encontrado" />;
  }

  return (
    <div className="overflow-hidden rounded-xl border border-border bg-card">
      <div className="grid grid-cols-[50px_1fr_150px_80px_110px_110px_120px_28px] border-b border-border bg-muted/40 px-4 py-2 text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">
        <div />
        <div>Nome</div>
        <div>Telefone</div>
        <div>Pedidos</div>
        <div>Ticket médio</div>
        <div>Total gasto</div>
        <div>Último pedido</div>
        <div />
      </div>
      <ul className="divide-y divide-border">
        {clients.map((c) => {
          const tier = getCrmTier(c.lastOrderDate);
          const meta = CRM_TIER_META[tier];
          const whatsappHref = c.mobile
            ? buildWhatsAppLink(
                c.mobile,
                isLapsedTier(tier) ? buildWinBackMessage(c.lastOrderInfo.products[0]) : undefined,
              )
            : undefined;

          return (
            <li
              key={c.clientId}
              className="grid cursor-pointer grid-cols-[50px_1fr_150px_80px_110px_110px_120px_28px] items-center px-4 py-3 text-sm transition-colors hover:bg-accent"
              onClick={() => router.push(`/clients/${c.clientId}`)}
            >
              <ClientAvatar name={c.name} size="sm" />
              <div className="min-w-0">
                <div className="flex items-center gap-1.5">
                  <div className="truncate font-medium">{c.name}</div>
                  <span className={cn("shrink-0 rounded-full px-1.5 py-px text-[9px] font-semibold", meta.bg, meta.fg)}>
                    {meta.label}
                  </span>
                </div>
                {c.lastOrderInfo.products.length > 0 ? (
                  <div className="truncate text-[11px] text-muted-foreground">
                    {c.lastOrderInfo.products.join(", ")}
                  </div>
                ) : null}
              </div>

              <div className="flex items-center gap-2 font-mono text-xs text-foreground-soft">
                <span>{c.mobile || "—"}</span>
                {whatsappHref && (
                  <a
                    href={whatsappHref}
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

              <div className="font-mono text-xs">{c.orderCount}</div>
              <div className="font-mono text-xs">{formatCents(c.averageSpendCents)}</div>
              <div className="font-mono text-xs font-semibold">{formatCents(c.totalSpendCents)}</div>
              <div className="font-mono text-xs text-foreground-soft">{formatDate(c.lastOrderDate)}</div>
              <div className="flex justify-end text-muted-foreground">
                <ChevronRight size={14} />
              </div>
            </li>
          );
        })}
      </ul>
    </div>
  );
}
