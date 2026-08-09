"use client";

import { useState } from "react";
import { AppHeader } from "@/components/shell/app-header";
import { MobileTopBar } from "@/components/shell/mobile-top-bar";
import { SkeletonList } from "@/components/ui/skeleton-list";
import { CrmToolbar } from "@/components/features/crm/crm-toolbar";
import { CrmTable } from "@/components/features/crm/crm-table";
import { CrmMobileList } from "@/components/features/crm/crm-mobile-list";
import { useCrmList } from "@/hooks/useCrm";

export default function CrmPage() {
  const [search, setSearch] = useState("");

  const { data, isLoading } = useCrmList({ search: search || undefined });
  const clients = data?.items ?? [];

  return (
    <>
      <div className="hidden md:block">
        <AppHeader title="CRM" subtitle={`${data?.totalCount ?? 0} clientes com pedidos`} />
      </div>
      <MobileTopBar title="CRM" />

      <div className="space-y-3 px-4 pt-3 md:px-7 md:pt-5">
        <CrmToolbar search={search} onSearchChange={setSearch} />

        {isLoading ? (
          <SkeletonList variant="clients" count={8} />
        ) : (
          <>
            <div className="hidden md:block">
              <CrmTable clients={clients} />
            </div>
            <div className="md:hidden">
              <CrmMobileList clients={clients} />
            </div>
          </>
        )}
      </div>
    </>
  );
}
