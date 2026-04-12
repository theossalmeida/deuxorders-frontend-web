"use client";

import { useState } from "react";
import {
  useClients,
  useCreateClient,
  useUpdateClient,
  useToggleClientStatus,
  useDeleteClient,
} from "@/hooks/useClients";
import { ClientForm } from "@/components/clients/ClientForm";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { Loader2, Plus, Search, Pencil, Trash2, Phone, X } from "lucide-react";
import { Client } from "@/types/clients";

export default function ClientsPage() {
  const [search, setSearch] = useState("");
  const [showActive, setShowActive] = useState(true);
  const [isCreating, setIsCreating] = useState(false);
  const [editClient, setEditClient] = useState<Client | null>(null);

  const { data: clients, isLoading } = useClients({ status: showActive });
  const createClient = useCreateClient();
  const updateClient = useUpdateClient(editClient?.id ?? "");
  const toggleStatus = useToggleClientStatus();
  const deleteClient = useDeleteClient();

  const filtered = (clients ?? []).filter(
    (c) => !search || c.name.toLowerCase().includes(search.toLowerCase())
  );

  async function handleCreate(data: { name: string; mobile: string }) {
    await createClient.mutateAsync(data);
    setIsCreating(false);
  }

  async function handleUpdate(data: { name: string; mobile: string }) {
    if (!editClient) return;
    await updateClient.mutateAsync(data);
    setEditClient(null);
  }

  return (
    <div className="flex flex-col h-full">
      <div className="sticky top-0 z-10 bg-background border-b px-4 py-3 space-y-3">
        <div className="flex items-center gap-2">
          <div className="relative flex-1">
            <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Buscar cliente..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="pl-8"
            />
            {search && (
              <button className="absolute right-2.5 top-2.5" onClick={() => setSearch("")}>
                <X className="h-4 w-4 text-muted-foreground" />
              </button>
            )}
          </div>

          <div className="flex items-center gap-2">
            <Switch
              id="active-clients"
              checked={showActive}
              onCheckedChange={setShowActive}
            />
            <Label htmlFor="active-clients" className="text-sm">
              {showActive ? "Ativos" : "Inativos"}
            </Label>
          </div>

          <Sheet open={isCreating} onOpenChange={setIsCreating}>
            <SheetTrigger render={<Button size="icon" style={{ backgroundColor: "#581629" }} />}>
              <Plus className="h-4 w-4" />
            </SheetTrigger>
            <SheetContent>
              <SheetHeader>
                <SheetTitle>Novo Cliente</SheetTitle>
              </SheetHeader>
              <div className="mt-6">
                <ClientForm onSubmit={handleCreate} isLoading={createClient.isPending} />
              </div>
            </SheetContent>
          </Sheet>
        </div>
      </div>

      <div className="flex-1 overflow-y-auto px-4 py-4 space-y-3">
        {isLoading && (
          <div className="flex justify-center py-16">
            <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
          </div>
        )}

        {!isLoading && filtered.length === 0 && (
          <div className="text-center py-16 text-muted-foreground">
            Nenhum cliente encontrado.
          </div>
        )}

        {filtered.map((client) => (
          <div
            key={client.id}
            className="flex items-center gap-3 rounded-xl border bg-white px-4 py-3 shadow-sm"
          >
            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full text-white font-bold text-sm"
              style={{ backgroundColor: "#581629" }}>
              {client.name.charAt(0).toUpperCase()}
            </div>

            <div className="flex-1 min-w-0">
              <p className="font-semibold truncate">{client.name}</p>
              <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
                <Phone className="h-3 w-3" />
                {client.mobile}
              </div>
            </div>

            <div className="flex items-center gap-1">
              <Switch
                checked={client.isActive}
                onCheckedChange={(checked) =>
                  toggleStatus.mutate({ id: client.id, active: checked })
                }
              />

              <Sheet
                open={editClient?.id === client.id}
                onOpenChange={(open) => !open && setEditClient(null)}
              >
                <SheetTrigger render={<Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => setEditClient(client)} />}>
                  <Pencil className="h-3.5 w-3.5" />
                </SheetTrigger>
                <SheetContent>
                  <SheetHeader>
                    <SheetTitle>Editar Cliente</SheetTitle>
                  </SheetHeader>
                  <div className="mt-6">
                    <ClientForm
                      client={client}
                      onSubmit={handleUpdate}
                      isLoading={updateClient.isPending}
                    />
                  </div>
                </SheetContent>
              </Sheet>

              <AlertDialog>
                <AlertDialogTrigger render={<Button variant="ghost" size="icon" className="h-8 w-8 text-destructive" />}>
                  <Trash2 className="h-3.5 w-3.5" />
                </AlertDialogTrigger>
                <AlertDialogContent>
                  <AlertDialogHeader>
                    <AlertDialogTitle>Excluir cliente?</AlertDialogTitle>
                    <AlertDialogDescription>
                      Clientes com pedidos existentes não podem ser excluídos.
                    </AlertDialogDescription>
                  </AlertDialogHeader>
                  <AlertDialogFooter>
                    <AlertDialogCancel>Cancelar</AlertDialogCancel>
                    <AlertDialogAction
                      className="bg-destructive hover:bg-destructive/90"
                      onClick={() => deleteClient.mutate(client.id)}
                    >
                      Excluir
                    </AlertDialogAction>
                  </AlertDialogFooter>
                </AlertDialogContent>
              </AlertDialog>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
