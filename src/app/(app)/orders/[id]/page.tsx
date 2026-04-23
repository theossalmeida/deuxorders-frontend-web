"use client";

import { use } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { ArrowLeft, Truck, ShoppingBag, Pencil, Trash2, Image as ImageIcon } from "lucide-react";
import { Button } from "@/components/ui/button";
import { AppHeader } from "@/components/shell/app-header";
import { Skeleton } from "@/components/ui/skeleton";
import { StatusChip } from "@/components/data/status-chip";
import { OrderStatusPipeline } from "@/components/features/orders/order-status-pipeline";
import { OrderItemsTable } from "@/components/features/orders/order-items-table";
import { formatCents, formatDate, formatTime } from "@/lib/format";
import { STATUS_META } from "@/lib/order-status";
import { useOrder, useUpdateOrder, useCompleteOrder, useDeleteOrder } from "@/hooks/useOrders";
import { buildRefSrc } from "@/lib/image-ref";
import { ORDER_STATUS_INT, type OrderStatus } from "@/types/orders";

const NEXT_STATUS: Partial<Record<OrderStatus, OrderStatus>> = {
  Received: "Preparing",
  Preparing: "WaitingPickupOrDelivery",
};

export default function OrderDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  const router = useRouter();
  const { data: order, isLoading } = useOrder(id);
  const updateOrder = useUpdateOrder(id);
  const completeOrder = useCompleteOrder();
  const deleteOrder = useDeleteOrder();

  function handleDelete() {
    if (!confirm("Excluir este pedido? Esta ação não pode ser desfeita.")) return;
    deleteOrder.mutate(id);
  }

  function handleAdvanceStatus() {
    if (!order) return;
    const next = NEXT_STATUS[order.status];
    if (next) {
      updateOrder.mutate({ status: ORDER_STATUS_INT[next] });
    } else if (order.status === "WaitingPickupOrDelivery") {
      completeOrder.mutate(id);
    }
  }

  const canAdvance =
    order &&
    order.status !== "Completed" &&
    order.status !== "Canceled" &&
    order.status !== "Pending";

  if (isLoading || !order) {
    return (
      <div className="space-y-4 px-4 pt-4 md:px-7">
        <Skeleton className="h-12 rounded-xl" />
        <Skeleton className="h-40 rounded-xl" />
        <Skeleton className="h-60 rounded-xl" />
      </div>
    );
  }

  const isDelivery = order.delivery && order.delivery !== "pickup";

  return (
    <>
      {/* Desktop header */}
      <div className="hidden md:block">
        <AppHeader
          title={order.clientName}
          subtitle={`${order.id} · ${formatDate(order.deliveryDate)}`}
          actions={
            <>
              <Button variant="outline" size="sm" onClick={() => router.back()}>
                Voltar
              </Button>
              <Button
                variant="outline"
                size="sm"
                className="gap-1.5 text-destructive hover:text-destructive"
                onClick={handleDelete}
                disabled={deleteOrder.isPending}
              >
                <Trash2 size={14} /> Excluir
              </Button>
              <Button variant="outline" size="sm" asChild nativeButton={false}>
                <Link href={`/orders/${id}/edit`}>
                  <Pencil size={14} />
                  Editar
                </Link>
              </Button>
              {canAdvance && (
                <Button
                  size="sm"
                  onClick={handleAdvanceStatus}
                  disabled={updateOrder.isPending || completeOrder.isPending}
                >
                  Avançar status
                </Button>
              )}
            </>
          }
        />
      </div>

      {/* Mobile top bar */}
      <div className="sticky top-0 z-20 flex items-center justify-between bg-background px-4 pt-14 pb-3 md:hidden">
        <button
          type="button"
          onClick={() => router.back()}
          className="flex items-center gap-1.5 text-sm font-medium text-muted-foreground"
        >
          <ArrowLeft size={16} />
          Voltar
        </button>
        <div className="text-center">
          <div className="font-mono text-[11px] text-muted-foreground">{order.id}</div>
          <div className="text-sm font-semibold">{order.clientName}</div>
        </div>
        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={handleDelete}
            disabled={deleteOrder.isPending}
            className="text-destructive disabled:opacity-50"
          >
            <Trash2 size={18} />
          </button>
          <Link href={`/orders/${id}/edit`} className="text-muted-foreground">
            <Pencil size={18} />
          </Link>
        </div>
      </div>

      <div className="grid gap-4 px-4 pt-4 pb-28 md:grid-cols-[1.3fr_1fr] md:px-7 md:pb-6 md:pt-5">
        {/* Left column */}
        <div className="space-y-4">
          {/* Status + total card */}
          <div className="rounded-xl border border-border bg-card p-4 md:p-5">
            <div className="flex items-start justify-between">
              <div>
                <div className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                  Total do pedido
                </div>
                <div className="mt-1 font-mono text-2xl font-semibold tracking-tight md:text-3xl">
                  {formatCents(order.totalPaidCents)}
                </div>
              </div>
              <StatusChip status={order.status} size="md" />
            </div>
            <div className="mt-5">
              <OrderStatusPipeline current={order.status} />
            </div>
          </div>

          {/* Items */}
          <OrderItemsTable items={order.items} />
        </div>

        {/* Right column */}
        <div className="space-y-3">
          {/* Delivery card */}
          <div className="rounded-xl border border-border bg-card p-4">
            <div className="mb-3 text-xs font-semibold uppercase tracking-wider text-muted-foreground">
              Entrega
            </div>
            <div className="space-y-2.5 text-sm">
              <div className="flex items-center gap-2.5">
                {isDelivery ? (
                  <Truck size={14} className="text-muted-foreground" />
                ) : (
                  <ShoppingBag size={14} className="text-muted-foreground" />
                )}
                <span className="font-medium">{isDelivery ? "Entrega" : "Retirada"}</span>
              </div>
              <div className="text-muted-foreground">
                {formatDate(order.deliveryDate)} às {formatTime(order.deliveryDate)}
              </div>
              {isDelivery && order.delivery ? (
                <div className="rounded-lg bg-muted px-3 py-2 text-xs text-foreground-soft">
                  {order.delivery}
                </div>
              ) : null}
            </div>
          </div>

          {/* Payment card */}
          <div className="rounded-xl border border-border bg-card p-4">
            <div className="mb-3 text-xs font-semibold uppercase tracking-wider text-muted-foreground">
              Pagamento
            </div>
            <div className="flex items-center justify-between">
              <span className="text-sm font-medium">
                {order.paidAt ? "Pago" : "Aguardando pagamento"}
              </span>
              {order.paidAt ? (
                <span className="inline-flex items-center gap-1 rounded-full bg-ok/10 px-2.5 py-1 text-xs font-semibold text-ok">
                  <span className="h-1.5 w-1.5 rounded-full bg-ok" />
                  Pago
                </span>
              ) : (
                <span className="inline-flex items-center gap-1 rounded-full bg-warn/10 px-2.5 py-1 text-xs font-semibold text-warn">
                  Pendente
                </span>
              )}
            </div>
            {order.paidAt && (
              <div className="mt-2 font-mono text-[11px] text-muted-foreground">
                {formatDate(order.paidAt)}
                {order.paidByUserName ? ` · por ${order.paidByUserName}` : ""}
              </div>
            )}
          </div>

          {/* References card */}
          {order.references.length > 0 && (
            <div className="rounded-xl border border-border bg-card p-4">
              <div className="mb-3 flex items-center gap-1.5 text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                <ImageIcon size={12} />
                Referências
              </div>
              <div className="flex flex-wrap gap-2">
                {order.references.map((key) => (
                  <a
                    key={key}
                    href={buildRefSrc(key)}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="block h-20 w-20 overflow-hidden rounded-lg border border-border transition hover:ring-2 hover:ring-brand"
                  >
                    <img
                      src={buildRefSrc(key)}
                      alt="Referência"
                      className="h-full w-full object-cover"
                    />
                  </a>
                ))}
              </div>
            </div>
          )}

          {/* Client card */}
          <div className="rounded-xl border border-border bg-card p-4">
            <div className="mb-3 text-xs font-semibold uppercase tracking-wider text-muted-foreground">
              Cliente
            </div>
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-brand-soft text-sm font-semibold text-brand">
                {order.clientName[0]}
              </div>
              <div>
                <div className="font-medium">{order.clientName}</div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Mobile sticky footer */}
      {canAdvance && (
        <div className="fixed bottom-0 left-0 right-0 z-30 border-t border-border bg-background/90 px-4 py-3 backdrop-blur-sm md:hidden">
          <div className="flex gap-3">
            <Button variant="outline" className="flex-1" onClick={() => router.back()}>
              Voltar
            </Button>
            <Button
              className="flex-[2]"
              onClick={handleAdvanceStatus}
              disabled={updateOrder.isPending || completeOrder.isPending}
            >
              Avançar status
            </Button>
          </div>
        </div>
      )}
    </>
  );
}
