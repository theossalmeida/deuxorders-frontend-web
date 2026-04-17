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
  AlertDialogFooter,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { DestructiveDialogHeader } from "@/components/ui/destructive-dialog-header";
import { Plus, Search, Pencil, Trash2, Phone, X, Users } from "lucide-react";
import { Client } from "@/types/clients";
import { SkeletonList } from "@/components/ui/skeleton-list";
import { EmptyState } from "@/components/ui/empty-state";

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
            <SheetTrigger render={<Button size="icon" className="bg-brand hover:bg-brand-hover text-brand-foreground" />}>
              <Plus className="h-4 w-4" />
            </SheetTrigger>
            <SheetContent>
              <SheetHeader>
                <SheetTitle>Novo Cliente</SheetTitle>
              </SheetHeader>
              <div className="mt-4">
                <ClientForm onSubmit={handleCreate} isLoading={createClient.isPending} />
              </div>
            </SheetContent>
          </Sheet>
        </div>
      </div>

      <div className="flex-1 overflow-y-auto px-4 py-4 space-y-3">
        {isLoading && <SkeletonList variant="clients" />}

        {!isLoading && filtered.length === 0 && (
          <EmptyState
            icon={Users}
            title="Nenhum cliente encontrado"
            hint={search ? "Tente limpar a busca." : "Crie o primeiro cliente pelo botão +."}
            action={
              search ? (
                <Button variant="outline" size="sm" onClick={() => setSearch("")}>
                  Limpar busca
                </Button>
              ) : undefined
            }
          />
        )}

        {filtered.map((client) => (
          <div
            key={client.id}
            className="flex items-center gap-3 rounded-xl border bg-white px-4 py-3 shadow-sm"
          >
            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-brand text-brand-foreground font-bold text-sm">
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
                  <div className="mt-4">
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
                  <DestructiveDialogHeader
                    title="Excluir cliente?"
                    description="Clientes com pedidos existentes não podem ser excluídos."
                  />
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
