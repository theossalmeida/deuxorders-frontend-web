"use client";

import { useState } from "react";
import { Plus } from "lucide-react";
import { ClientForm } from "@/components/clients/ClientForm";
import { Button } from "@/components/ui/button";
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet";
import { useCreateClient } from "@/hooks/useClients";

type Props = {
  triggerLabel?: string;
  compact?: boolean;
};

export function NewClientSheet({ triggerLabel = "Novo cliente", compact = false }: Props) {
  const [open, setOpen] = useState(false);
  const createClient = useCreateClient();

  async function handleSubmit(data: { name: string; mobile: string }) {
    await createClient.mutateAsync(data);
    setOpen(false);
  }

  return (
    <Sheet open={open} onOpenChange={setOpen}>
      <Button
        type="button"
        size={compact ? "icon" : "sm"}
        className={compact ? "h-9 w-9" : "gap-1.5"}
        onClick={() => setOpen(true)}
        aria-haspopup="dialog"
        aria-label={triggerLabel}
      >
        <Plus size={compact ? 16 : 14} aria-hidden />
        {compact ? null : triggerLabel}
      </Button>

      <SheetContent className="sm:max-w-md">
        <SheetHeader className="px-0 pt-2">
          <SheetTitle>Novo cliente</SheetTitle>
          <SheetDescription>Crie um cadastro para usar em pedidos e histórico.</SheetDescription>
        </SheetHeader>

        <div className="mt-6">
          <ClientForm
            onSubmit={handleSubmit}
            isLoading={createClient.isPending}
          />
        </div>
      </SheetContent>
    </Sheet>
  );
}
