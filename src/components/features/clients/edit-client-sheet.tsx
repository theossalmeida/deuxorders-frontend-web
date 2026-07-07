"use client";

import { useState } from "react";
import { Pencil } from "lucide-react";
import { ClientForm } from "@/components/clients/ClientForm";
import { Button } from "@/components/ui/button";
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet";
import { useUpdateClient } from "@/hooks/useClients";
import type { Client } from "@/types/clients";

type Props = {
  client: Client;
  compact?: boolean;
};

export function EditClientSheet({ client, compact = false }: Props) {
  const [open, setOpen] = useState(false);
  const updateClient = useUpdateClient(client.id);

  async function handleSubmit(data: { name: string; mobile: string; status?: boolean }) {
    await updateClient.mutateAsync(data);
    setOpen(false);
  }

  return (
    <>
      <Button
        type="button"
        variant={compact ? "ghost" : "outline"}
        size={compact ? "icon" : "sm"}
        className={compact ? "h-7 w-7" : "gap-1.5"}
        onClick={(e) => {
          e.stopPropagation();
          setOpen(true);
        }}
        aria-label="Editar cliente"
      >
        <Pencil size={compact ? 13 : 14} aria-hidden />
        {compact ? null : "Editar"}
      </Button>

      <Sheet open={open} onOpenChange={setOpen}>
        <SheetContent className="sm:max-w-md">
          <SheetHeader className="px-0 pt-2">
            <SheetTitle>Editar cliente</SheetTitle>
            <SheetDescription>Atualize os dados de {client.name}.</SheetDescription>
          </SheetHeader>

          <div className="mt-6">
            <ClientForm
              client={client}
              onSubmit={handleSubmit}
              isLoading={updateClient.isPending}
              showStatus
            />
          </div>
        </SheetContent>
      </Sheet>
    </>
  );
}
