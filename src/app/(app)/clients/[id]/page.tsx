"use client";

import { use } from "react";
import { useRouter } from "next/navigation";
import { ArrowLeft, Plus } from "lucide-react";
import { Button } from "@/components/ui/button";
import { AppHeader } from "@/components/shell/app-header";
import { Skeleton } from "@/components/ui/skeleton";
import { ClientKpiBand } from "@/components/features/clients/detail/client-kpi-band";
import { ClientContactCard } from "@/components/features/clients/detail/client-contact-card";
import { ClientNotesCard } from "@/components/features/clients/detail/client-notes-card";
import { ClientOrdersHistory } from "@/components/features/clients/detail/client-orders-history";
import { useClient } from "@/hooks/useClients";

export default function ClientDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  const router = useRouter();
  const { data: client, isLoading } = useClient(id);

  if (isLoading) {
    return (
      <div className="space-y-4 px-4 pt-4 md:px-7">
        <Skeleton className="h-12 rounded-xl" />
        <div className="grid grid-cols-2 gap-2.5 md:grid-cols-4">
          {Array.from({ length: 4 }).map((_, i) => (
            <Skeleton key={i} className="h-20 rounded-lg" />
          ))}
        </div>
        <Skeleton className="h-64 rounded-xl" />
      </div>
    );
  }

  if (!client) {
    return (
      <div className="flex flex-col items-center justify-center p-12">
        <p className="text-muted-foreground">Cliente não encontrado.</p>
        <Button variant="outline" size="sm" className="mt-4" onClick={() => router.back()}>
          Voltar
        </Button>
      </div>
    );
  }

  return (
    <>
      <div className="hidden md:block">
        <AppHeader
          title={client.name}
          subtitle={`${client.mobile} · ${client.status ? "cliente ativo" : "cliente inativo"}`}
          actions={
            <>
              <Button variant="outline" size="sm">
                Editar
              </Button>
              <Button size="sm" className="gap-1.5" onClick={() => router.push("/orders/new")}>
                <Plus size={14} /> Novo pedido
              </Button>
            </>
          }
        />
      </div>

      {/* Mobile top bar */}
      <div className="sticky top-0 z-20 flex items-center gap-3 bg-background px-4 pt-14 pb-3 md:hidden">
        <button type="button" onClick={() => router.back()}>
          <ArrowLeft size={18} />
        </button>
        <span className="font-semibold">{client.name}</span>
      </div>

      <div className="space-y-4 px-4 pt-4 pb-8 md:px-7 md:pt-5">
        <ClientKpiBand stats={client.stats} />

        <div className="grid gap-4 md:grid-cols-[1.6fr_1fr]">
          <ClientOrdersHistory orders={client.orders} />

          {/* Right: contact + notes */}
          <div className="space-y-3">
            <ClientContactCard client={client} />
            <ClientNotesCard />
          </div>
        </div>
      </div>
    </>
  );
}
