"use client";

import { useState, useMemo } from "react";
import { useRouter } from "next/navigation";
import { Plus, Download } from "lucide-react";
import { Button } from "@/components/ui/button";
import { AppHeader } from "@/components/shell/app-header";
import { MobileTopBar } from "@/components/shell/mobile-top-bar";
import { SkeletonList } from "@/components/ui/skeleton-list";
import { OrdersToolbar } from "@/components/features/orders/orders-toolbar";
import { OrdersTable } from "@/components/features/orders/orders-table";
import { OrdersMobileList } from "@/components/features/orders/orders-mobile-list";
import { useOrders } from "@/hooks/useOrders";
import { localISODate } from "@/lib/format";
import type { Order, OrderStatus } from "@/types/orders";

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
  });
  const orders: Order[] = data?.items ?? [];

  const filtered = useMemo(
    () =>
      search === ""
        ? orders
        : orders.filter(
            (o) =>
              o.clientName.toLowerCase().includes(search.toLowerCase()) ||
              o.id.toLowerCase().includes(search.toLowerCase()),
          ),
    [orders, search],
  );

  const counts = useMemo(
    () =>
      orders.reduce<Record<string, number>>((acc, o) => {
        acc[o.status] = (acc[o.status] ?? 0) + 1;
        return acc;
      }, {}),
    [orders],
  );

  const hasFilters = status !== "all" || search !== "";
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
              <Button variant="outline" size="sm" className="gap-1.5">
                <Download size={14} /> Exportar
              </Button>
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
          <Button size="sm" className="h-9 gap-1.5" onClick={() => router.push("/orders/new")}>
            <Plus size={14} /> Novo
          </Button>
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
              <OrdersTable orders={filtered} onClearFilters={clearFilters} hasFilters={hasFilters} />
            </div>
            <div className="md:hidden">
              <OrdersMobileList
                orders={filtered}
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
