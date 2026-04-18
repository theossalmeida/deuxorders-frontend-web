"use client";

import { useState, useMemo } from "react";
import { Plus } from "lucide-react";
import { Button } from "@/components/ui/button";
import { AppHeader } from "@/components/shell/app-header";
import { MobileTopBar } from "@/components/shell/mobile-top-bar";
import { SkeletonList } from "@/components/ui/skeleton-list";
import { ClientsToolbar } from "@/components/features/clients/clients-toolbar";
import { ClientsTable } from "@/components/features/clients/clients-table";
import { ClientsMobileList } from "@/components/features/clients/clients-mobile-list";
import { useClients } from "@/hooks/useClients";

export default function ClientsPage() {
  const [search, setSearch] = useState("");
  const [showInactive, setShowInactive] = useState(false);

  const { data: clients = [], isLoading } = useClients({ size: 500 });

  const filtered = useMemo(
    () =>
      clients.filter(
        (c) =>
          (showInactive || c.isActive) &&
          (search === "" ||
            c.name.toLowerCase().includes(search.toLowerCase()) ||
            c.mobile.includes(search)),
      ),
    [clients, search, showInactive],
  );

  return (
    <>
      <div className="hidden md:block">
        <AppHeader
          title="Clientes"
          subtitle={`${clients.length} clientes`}
          actions={
            <Button size="sm" className="gap-1.5">
              <Plus size={14} /> Novo cliente
            </Button>
          }
        />
      </div>
      <MobileTopBar
        title="Clientes"
        right={
          <Button size="icon" className="h-9 w-9">
            <Plus size={16} />
          </Button>
        }
      />

      <div className="space-y-3 px-4 pt-3 md:px-7 md:pt-5">
        <ClientsToolbar
          search={search}
          onSearchChange={setSearch}
          showInactive={showInactive}
          onShowInactiveChange={setShowInactive}
        />

        {isLoading ? (
          <SkeletonList variant="clients" count={8} />
        ) : (
          <>
            <div className="hidden md:block">
              <ClientsTable clients={filtered} />
            </div>
            <div className="md:hidden">
              <ClientsMobileList clients={filtered} />
            </div>
          </>
        )}
      </div>
    </>
  );
}
