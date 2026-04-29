"use client";

import { useState, useMemo } from "react";
import { useRouter } from "next/navigation";
import { Download, FileText, Loader2, Plus, Table2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { AppHeader } from "@/components/shell/app-header";
import { MobileTopBar } from "@/components/shell/mobile-top-bar";
import { SkeletonList } from "@/components/ui/skeleton-list";
import { OrdersToolbar } from "@/components/features/orders/orders-toolbar";
import { OrdersTable } from "@/components/features/orders/orders-table";
import { OrdersMobileList } from "@/components/features/orders/orders-mobile-list";
import { useExportOrders, useOrders } from "@/hooks/useOrders";
import { localISODate } from "@/lib/format";
import type { OrderStatus } from "@/types/orders";

export default function OrdersPage() {
  const router = useRouter();
  const [status, setStatus] = useState<OrderStatus | "all">("all");
  const [search, setSearch] = useState("");
  const [dateFrom, setDateFrom] = useState(() => localISODate(new Date()));
  const [dateTo, setDateTo] = useState(() => {
    const d = new Date();
    d.setDate(d.getDate() + 6);
    return localISODate(d);
  });

  const { data, isLoading } = useOrders({
    status: status !== "all" ? status : undefined,
    from: dateFrom || undefined,
    to: dateTo || undefined,
    search: search || undefined,
  });
  const exportFilters = useMemo(
    () => ({
      startDate: dateFrom || undefined,
      endDate: dateTo || undefined,
      status: status !== "all" ? status : undefined,
    }),
    [dateFrom, dateTo, status],
  );
  const exportOrders = useExportOrders(exportFilters);
  const orders = useMemo(() => data?.items ?? [], [data]);

  const counts = useMemo(
    () =>
      orders.reduce<Record<string, number>>((acc, o) => {
        acc[o.status] = (acc[o.status] ?? 0) + 1;
        return acc;
      }, {}),
    [orders],
  );

  const hasFilters = status !== "all" || search !== "" || !!dateFrom || !!dateTo;
  const clearFilters = () => {
    setStatus("all");
    setSearch("");
    setDateFrom(localISODate(new Date()));
    const d = new Date();
    d.setDate(d.getDate() + 6);
    setDateTo(localISODate(d));
  };

  return (
    <>
      <div className="hidden md:block">
        <AppHeader
          title="Pedidos"
          subtitle={`${orders.length} pedidos`}
          actions={
            <>
              <ExportButton
                isPending={exportOrders.isPending}
                onExport={(format) => exportOrders.mutate(format)}
              />
              <Button size="sm" className="gap-1.5" onClick={() => router.push("/orders/new")}>
                <Plus size={14} /> Novo pedido
              </Button>
            </>
          }
        />
      </div>

      <MobileTopBar
        title="Pedidos"
        right={
          <div className="flex items-center gap-1.5">
            <ExportButton
              compact
              isPending={exportOrders.isPending}
              onExport={(format) => exportOrders.mutate(format)}
            />
            <Button size="sm" className="h-9 gap-1.5" onClick={() => router.push("/orders/new")}>
              <Plus size={14} /> Novo
            </Button>
          </div>
        }
      />

      <div className="space-y-3 px-4 pt-3 md:px-7 md:pt-5">
        <OrdersToolbar
          search={search}
          onSearchChange={setSearch}
          status={status}
          onStatusChange={setStatus}
          counts={counts}
          dateFrom={dateFrom}
          onDateFromChange={setDateFrom}
          dateTo={dateTo}
          onDateToChange={setDateTo}
        />

        {isLoading ? (
          <SkeletonList variant="orders" count={6} />
        ) : (
          <>
            <div className="hidden md:block">
              <OrdersTable orders={orders} onClearFilters={clearFilters} hasFilters={hasFilters} />
            </div>
            <div className="md:hidden">
              <OrdersMobileList
                orders={orders}
                onClearFilters={clearFilters}
                hasFilters={hasFilters}
              />
            </div>
          </>
        )}
      </div>
    </>
  );
}

function ExportButton({
  compact = false,
  isPending,
  onExport,
}: {
  compact?: boolean;
  isPending: boolean;
  onExport: (format: "csv" | "pdf") => void;
}) {
  return (
    <DropdownMenu>
      <DropdownMenuTrigger
        render={
          <Button
            variant="outline"
            size={compact ? "icon" : "sm"}
            className={compact ? "h-9 w-9" : "gap-1.5"}
            disabled={isPending}
            aria-label="Exportar pedidos"
          >
            {isPending ? <Loader2 size={14} className="animate-spin" /> : <Download size={14} />}
            {!compact && "Exportar"}
          </Button>
        }
      />
      <DropdownMenuContent align="end" className="w-40">
        <DropdownMenuItem onClick={() => onExport("csv")}>
          <Table2 size={14} />
          CSV
        </DropdownMenuItem>
        <DropdownMenuItem onClick={() => onExport("pdf")}>
          <FileText size={14} />
          PDF
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
