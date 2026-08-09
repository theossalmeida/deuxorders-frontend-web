"use client";

import { useMemo, useState } from "react";
import { AppHeader } from "@/components/shell/app-header";
import { MobileTopBar } from "@/components/shell/mobile-top-bar";
import { SkeletonList } from "@/components/ui/skeleton-list";
import { CrmToolbar } from "@/components/features/crm/crm-toolbar";
import { CrmFilterTabs } from "@/components/features/crm/crm-filter-tabs";
import { CrmTable } from "@/components/features/crm/crm-table";
import { CrmMobileList } from "@/components/features/crm/crm-mobile-list";
import { CrmPagination } from "@/components/features/crm/crm-pagination";
import { useCrmList } from "@/hooks/useCrm";
import { getTierDateBounds, type CrmTier } from "@/lib/crm";

const PAGE_SIZE = 20;

export default function CrmPage() {
  const [search, setSearch] = useState("");
  const [tier, setTier] = useState<CrmTier | "all">("all");
  const [page, setPage] = useState(1);

  // Computed once per tier selection — getTierDateBounds() defaults to `now = new Date()`,
  // so calling it unmemoized on every render would produce a new queryKey each time and
  // refetch in an infinite loop.
  const bounds = useMemo(() => (tier === "all" ? {} : getTierDateBounds(tier)), [tier]);

  const { data, isLoading } = useCrmList({
    search: search || undefined,
    page,
    size: PAGE_SIZE,
    ...bounds,
  });
  const clients = data?.items ?? [];

  function handleSearchChange(v: string) {
    setSearch(v);
    setPage(1);
  }

  function handleTierChange(v: CrmTier | "all") {
    setTier(v);
    setPage(1);
  }

  return (
    <>
      <div className="hidden md:block">
        <AppHeader title="CRM" subtitle={`${data?.totalCount ?? 0} clientes com pedidos`} />
      </div>
      <MobileTopBar title="CRM" />

      <div className="space-y-3 px-4 pt-3 md:px-7 md:pt-5">
        <CrmToolbar search={search} onSearchChange={handleSearchChange} />
        <CrmFilterTabs value={tier} onChange={handleTierChange} />

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
            <CrmPagination
              page={data?.pageNumber ?? page}
              pageSize={data?.pageSize ?? PAGE_SIZE}
              totalCount={data?.totalCount ?? 0}
              onPageChange={setPage}
            />
          </>
        )}
      </div>
    </>
  );
}
