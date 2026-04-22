"use client";

import { useState, useMemo } from "react";
import { AppHeader } from "@/components/shell/app-header";
import { MobileTopBar } from "@/components/shell/mobile-top-bar";
import { SkeletonList } from "@/components/ui/skeleton-list";
import { InventoryToolbar } from "@/components/features/inventory/inventory-toolbar";
import { InventoryTable } from "@/components/features/inventory/inventory-table";
import { InventoryMobileList } from "@/components/features/inventory/inventory-mobile-list";
import { NewMaterialSheet } from "@/components/features/inventory/new-material-sheet";
import { useInventoryMaterials } from "@/hooks/useInventory";

type StatusFilter = "all" | "active" | "inactive";

export default function InventoryPage() {
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState<StatusFilter>("active");

  const apiStatus = statusFilter === "all" ? undefined : statusFilter === "active";

  const { data: materials = [], isLoading } = useInventoryMaterials(
    apiStatus !== undefined ? { status: apiStatus } : undefined
  );

  const filtered = useMemo(
    () =>
      materials.filter(
        (m) => search === "" || m.name.toLowerCase().includes(search.toLowerCase())
      ),
    [materials, search]
  );

  return (
    <>
      <div className="hidden md:block">
        <AppHeader
          title="Materiais"
          subtitle={`Estoque · ${filtered.length} ${filtered.length !== 1 ? "itens" : "item"}`}
          actions={<NewMaterialSheet />}
        />
      </div>
      <MobileTopBar
        title="Materiais"
        right={<NewMaterialSheet compact />}
      />

      <div className="space-y-3 px-4 pt-3 md:px-7 md:pt-5">
        <InventoryToolbar
          search={search}
          onSearchChange={setSearch}
          statusFilter={statusFilter}
          onStatusFilterChange={setStatusFilter}
        />
        {isLoading ? (
          <SkeletonList variant="rows" count={6} />
        ) : (
          <>
            <div className="hidden md:block">
              <InventoryTable materials={filtered} />
            </div>
            <div className="md:hidden">
              <InventoryMobileList materials={filtered} />
            </div>
          </>
        )}
      </div>
    </>
  );
}
