"use client";

import { useState, useMemo } from "react";
import Link from "next/link";
import { useOrders } from "@/hooks/useOrders";
import { OrderCard } from "@/components/orders/OrderCard";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Loader2, Plus, Search, SlidersHorizontal, X } from "lucide-react";
import { ALL_ORDER_STATUSES, ORDER_STATUS_LABEL, OrderStatus } from "@/types/orders";
import { cn } from "@/lib/utils";

const PAGE_SIZE = 100;

export default function OrdersPage() {
  const [search, setSearch] = useState("");
  const [status, setStatus] = useState<OrderStatus | "all">("all");
  const [startDate, setStartDate] = useState<string>(() => {
    return new Date().toISOString().slice(0, 10);
  });
  const [endDate, setEndDate] = useState<string>(() => {
    const d = new Date();
    d.setDate(d.getDate() + 6);
    return d.toISOString().slice(0, 10);
  });
  const [showFilters, setShowFilters] = useState(false);

  const { data, isLoading, isError, refetch } = useOrders({
    size: PAGE_SIZE,
    // Push status to the server so a non-"all" filter isn't limited to the
    // first 100 rows the server chose to return.
    status: status === "all" ? undefined : status,
  });

  // Date range and search still filter client-side — backend doesn't accept
  // from/to/search yet. Add those params when the API supports them.
  const filtered = useMemo(() => {
    if (!data?.items) return [];
    const q = search.toLowerCase();
    return data.items
      .filter((o) => {
        const matchSearch =
          !q ||
          o.clientName.toLowerCase().includes(q) ||
          o.id.toLowerCase().includes(q);
        const deliveryDay = o.deliveryDate.slice(0, 10);
        const matchDate = deliveryDay >= startDate && deliveryDay <= endDate;
        return matchSearch && matchDate;
      })
      .sort(
        (a, b) =>
          new Date(a.deliveryDate).getTime() - new Date(b.deliveryDate).getTime()
      );
  }, [data, search, startDate, endDate]);

  return (
    <div className="flex flex-col h-full">
      <div className="sticky top-0 z-10 bg-background border-b px-4 py-3 space-y-3">
        <div className="flex items-center gap-2">
          <div className="relative flex-1">
            <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Buscar por cliente ou ID..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="pl-8"
            />
            {search && (
              <button
                className="absolute right-2.5 top-2.5"
                onClick={() => setSearch("")}
              >
                <X className="h-4 w-4 text-muted-foreground" />
              </button>
            )}
          </div>

          <Button
            variant="outline"
            size="icon"
            onClick={() => setShowFilters((v) => !v)}
            className={cn(showFilters && "bg-muted")}
          >
            <SlidersHorizontal className="h-4 w-4" />
          </Button>

          <Button size="icon" style={{ backgroundColor: "#581629" }}>
            <Link href="/orders/new" className="flex items-center justify-center w-full h-full">
              <Plus className="h-4 w-4" />
            </Link>
          </Button>
        </div>

        {showFilters && (
          <div className="flex flex-col sm:flex-row gap-2">
            <Select
              value={status}
              onValueChange={(v) => setStatus((v ?? "all") as OrderStatus | "all")}
            >
              <SelectTrigger className="w-full sm:w-52">
                <SelectValue placeholder="Filtrar status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Todos os status</SelectItem>
                {ALL_ORDER_STATUSES.map((s) => (
                  <SelectItem key={s} value={s}>
                    {ORDER_STATUS_LABEL[s]}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>

            <div className="flex gap-2 flex-1">
              <div className="flex-1">
                <Input
                  type="date"
                  value={startDate}
                  onChange={(e) => setStartDate(e.target.value)}
                />
              </div>
              <div className="flex-1">
                <Input
                  type="date"
                  value={endDate}
                  onChange={(e) => setEndDate(e.target.value)}
                />
              </div>
            </div>
          </div>
        )}
      </div>

      <div className="flex-1 overflow-y-auto px-4 py-4 space-y-3">
        {isLoading && (
          <div className="flex justify-center py-16">
            <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
          </div>
        )}

        {isError && (
          <div className="text-center py-16 space-y-2">
            <p className="text-muted-foreground">Erro ao carregar pedidos.</p>
            <Button variant="outline" size="sm" onClick={() => refetch()}>
              Tentar novamente
            </Button>
          </div>
        )}

        {!isLoading && !isError && filtered.length === 0 && (
          <div className="text-center py-16 text-muted-foreground">
            Nenhum pedido encontrado.
          </div>
        )}

        {filtered.map((order) => (
          <OrderCard key={order.id} order={order} />
        ))}
      </div>
    </div>
  );
}
