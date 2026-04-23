"use client";

import { use, useState, useMemo } from "react";
import { useRouter } from "next/navigation";
import { ArrowLeft, Search } from "lucide-react";
import { Button } from "@/components/ui/button";
import { AppHeader } from "@/components/shell/app-header";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { ItemsBuilder, type OrderItemDraft } from "@/components/features/orders/new/items-builder";
import { DeliverySection, type DeliveryMode } from "@/components/features/orders/new/delivery-section";
import { EditReferenceManager } from "@/components/features/orders/edit-reference-manager";
import { Input } from "@/components/ui/input";
import { formatCents } from "@/lib/format";
import { STATUS_META } from "@/lib/order-status";
import { createOrdersApi, uploadToPresignedUrl } from "@/lib/api/orders";
import { useOrder, useUpdateOrder, useOrdersDropdownData } from "@/hooks/useOrders";
import { useToken } from "@/hooks/useToken";
import {
  ORDER_STATUS_INT,
  ALL_ORDER_STATUSES,
  type OrderStatus,
} from "@/types/orders";

export default function EditOrderPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  const router = useRouter();
  const token = useToken();
  const { data: order, isLoading } = useOrder(id);
  const updateOrder = useUpdateOrder(id);
  const { products } = useOrdersDropdownData();

  // Local form state — initialized from order data
  const [status, setStatus] = useState<OrderStatus | null>(null);
  const [items, setItems] = useState<OrderItemDraft[] | null>(null);
  const [deliveryMode, setDeliveryMode] = useState<DeliveryMode | null>(null);
  const [address, setAddress] = useState<string | null>(null);
  const [date, setDate] = useState<string | null>(null);
  const [showProductPicker, setShowProductPicker] = useState(false);
  const [productSearch, setProductSearch] = useState("");
  const [keptReferences, setKeptReferences] = useState<string[] | null>(null);
  const [newImageFiles, setNewImageFiles] = useState<File[]>([]);
  const [isSaving, setIsSaving] = useState(false);

  // Derive current values (form state or order defaults)
  const currentStatus = status ?? order?.status ?? "Pending";
  const currentItems: OrderItemDraft[] =
    items ??
    (order?.items
      .filter((i) => !i.itemCanceled)
      .map((i) => ({
        productId: i.productId,
        name: i.productName,
        unitPriceCents: i.paidUnitPriceCents,
        qty: i.quantity,
        observation: i.observation ?? undefined,
        massa: i.massa ?? undefined,
        sabor: i.sabor ?? undefined,
      })) ??
      []);
  const currentDeliveryMode: DeliveryMode =
    deliveryMode ??
    (order?.delivery && order.delivery !== "pickup" ? "entrega" : "retirada");
  const currentAddress =
    address ??
    (order?.delivery && order.delivery !== "pickup" ? order.delivery : "");
  const currentDate =
    date ?? (order?.deliveryDate ? order.deliveryDate.slice(0, 16) : "");
  const currentReferences = keptReferences ?? (order?.references ?? []);

  const subtotalCents = currentItems.reduce(
    (a, i) => a + i.unitPriceCents * i.qty,
    0,
  );

  const filteredProducts = useMemo(
    () =>
      (products.data ?? []).filter((p) =>
        p.name.toLowerCase().includes(productSearch.toLowerCase()),
      ),
    [products.data, productSearch],
  );

  function addProduct(p: { id: string; name: string; priceCents: number; category: string | null }) {
    const base = currentItems;
    const existing = base.findIndex((i) => i.productId === p.id);
    if (existing >= 0) {
      const next = [...base];
      next[existing] = { ...next[existing], qty: next[existing].qty + 1 };
      setItems(next);
    } else {
      setItems([
        ...base,
        {
          productId: p.id,
          name: p.name,
          unitPriceCents: p.priceCents,
          category: p.category ?? undefined,
          qty: 1,
        },
      ]);
    }
    setShowProductPicker(false);
    setProductSearch("");
  }

  async function handleSave() {
    if (!order || !token) return;
    setIsSaving(true);

    try {
      const api = createOrdersApi(token);
      const uploadedKeys: string[] = [];
      for (const file of newImageFiles) {
        const { uploadUrl, objectKey } = await api.getPresignedUrl({
          fileName: file.name,
          contentType: file.type,
        });
        await uploadToPresignedUrl(uploadUrl, file, file.type);
        uploadedKeys.push(objectKey);
      }

      const allReferences = [...currentReferences, ...uploadedKeys];

      updateOrder.mutate(
        {
          status: ORDER_STATUS_INT[currentStatus],
          deliveryDate: new Date(currentDate).toISOString(),
          delivery:
            currentDeliveryMode === "entrega"
              ? currentAddress || "Entrega"
              : "pickup",
          items: currentItems.map((i) => ({
            productId: i.productId,
            quantity: i.qty,
            paidUnitPriceCents: i.unitPriceCents,
            observation: i.observation,
            massa: i.massa,
            sabor: i.sabor,
          })),
          references: allReferences.length ? allReferences : undefined,
        },
        { onSuccess: () => router.push(`/orders/${id}`) },
      );
    } finally {
      setIsSaving(false);
    }
  }

  if (isLoading || !order) {
    return (
      <div className="space-y-4 px-4 pt-4 md:px-7">
        <div className="h-12 animate-pulse rounded-xl bg-muted" />
        <div className="h-40 animate-pulse rounded-xl bg-muted" />
        <div className="h-60 animate-pulse rounded-xl bg-muted" />
      </div>
    );
  }

  return (
    <>
      {/* Desktop header */}
      <div className="hidden md:block">
        <AppHeader
          title="Editar pedido"
          subtitle={`${order.clientName} · ${order.id}`}
          actions={
            <>
              <Button
                variant="outline"
                size="sm"
                onClick={() => router.push(`/orders/${id}`)}
              >
                Cancelar
              </Button>
              <Button
                size="sm"
                onClick={handleSave}
                disabled={isSaving || updateOrder.isPending}
              >
                {isSaving || updateOrder.isPending ? "Salvando..." : "Salvar"}
              </Button>
            </>
          }
        />
      </div>

      {/* Mobile top bar */}
      <div className="sticky top-0 z-20 flex items-center justify-between bg-background px-4 pt-14 pb-3 md:hidden">
        <button
          type="button"
          onClick={() => router.push(`/orders/${id}`)}
          className="flex items-center gap-1.5 text-sm font-medium text-muted-foreground"
        >
          <ArrowLeft size={16} /> Cancelar
        </button>
        <span className="text-sm font-semibold">Editar pedido</span>
        <div className="w-16" />
      </div>

      {/* Product picker overlay */}
      {showProductPicker && (
        <div className="fixed inset-0 z-50 flex flex-col bg-background">
          <div className="flex items-center gap-3 border-b border-border px-4 py-3">
            <button
              type="button"
              onClick={() => setShowProductPicker(false)}
            >
              <ArrowLeft size={18} />
            </button>
            <span className="font-semibold">Escolher produto</span>
          </div>
          <div className="p-4">
            <div className="relative">
              <Search
                size={15}
                className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground"
              />
              <Input
                value={productSearch}
                onChange={(e) => setProductSearch(e.target.value)}
                placeholder="Buscar produto"
                className="pl-9"
                autoFocus
              />
            </div>
          </div>
          <ul className="flex-1 divide-y divide-border overflow-y-auto">
            {filteredProducts.map((p) => (
              <li key={p.id}>
                <button
                  type="button"
                  onClick={() => addProduct(p)}
                  className="flex w-full items-center justify-between px-4 py-3 text-left hover:bg-accent"
                >
                  <span className="text-sm font-medium">{p.name}</span>
                  <span className="font-mono text-sm font-semibold">
                    {formatCents(p.priceCents)}
                  </span>
                </button>
              </li>
            ))}
          </ul>
        </div>
      )}

      {/* Main content */}
      <div className="px-4 pt-4 pb-28 md:grid md:grid-cols-[1fr_380px] md:gap-4 md:px-7 md:pb-6 md:pt-5">
        <div className="space-y-4">
          {/* Status section */}
          <div className="rounded-xl border border-border bg-card p-4">
            <div className="mb-3 text-xs font-semibold uppercase tracking-wider text-muted-foreground">
              Status
            </div>
            <Select value={currentStatus} onValueChange={(v) => setStatus(v as OrderStatus)}>
              <SelectTrigger className="w-full">
                <SelectValue>
                  {() => {
                    const meta = STATUS_META[currentStatus];
                    return (
                      <span className="flex items-center gap-2">
                        <span
                          className={`h-2 w-2 rounded-full ${meta.dot}`}
                          aria-hidden
                        />
                        {meta.label}
                      </span>
                    );
                  }}
                </SelectValue>
              </SelectTrigger>
              <SelectContent>
                {ALL_ORDER_STATUSES.map((s) => {
                  const meta = STATUS_META[s];
                  return (
                    <SelectItem key={s} value={s}>
                      <span className="flex items-center gap-2">
                        <span
                          className={`h-2 w-2 rounded-full ${meta.dot}`}
                          aria-hidden
                        />
                        {meta.label}
                      </span>
                    </SelectItem>
                  );
                })}
              </SelectContent>
            </Select>
          </div>

          {/* Items section */}
          <div className="rounded-xl border border-border bg-card p-4">
            <div className="mb-3 text-xs font-semibold uppercase tracking-wider text-muted-foreground">
              Itens
            </div>
            <ItemsBuilder
              items={currentItems}
              onChange={setItems}
              onAddClick={() => setShowProductPicker(true)}
            />
          </div>

          {/* Delivery section */}
          <div className="rounded-xl border border-border bg-card p-4">
            <div className="mb-3 text-xs font-semibold uppercase tracking-wider text-muted-foreground">
              Entrega
            </div>
            <DeliverySection
              mode={currentDeliveryMode}
              onModeChange={setDeliveryMode}
              address={currentAddress}
              onAddressChange={setAddress}
              date={currentDate}
              onDateChange={setDate}
            />
          </div>

          {/* References section */}
          <div className="rounded-xl border border-border bg-card p-4">
            <div className="mb-3 text-xs font-semibold uppercase tracking-wider text-muted-foreground">
              Referências
            </div>
            <EditReferenceManager
              existingKeys={currentReferences}
              onRemoveExisting={(key) =>
                setKeptReferences(currentReferences.filter((k) => k !== key))
              }
              newFiles={newImageFiles}
              onNewFilesChange={setNewImageFiles}
            />
          </div>

          {/* Summary on mobile */}
          <div className="md:hidden">
            <SummaryCard
              subtotalCents={subtotalCents}
              deliveryMode={currentDeliveryMode}
              isPending={isSaving || updateOrder.isPending}
              onSave={handleSave}
            />
          </div>
        </div>

        {/* Desktop summary sidebar */}
        <div className="hidden md:block">
          <div className="sticky top-4">
            <SummaryCard
              subtotalCents={subtotalCents}
              deliveryMode={currentDeliveryMode}
              isPending={isSaving || updateOrder.isPending}
              onSave={handleSave}
            />
          </div>
        </div>
      </div>

      {/* Mobile sticky footer */}
      <div className="fixed bottom-0 left-0 right-0 z-30 border-t border-border bg-background/90 px-4 py-3 backdrop-blur-sm md:hidden">
        <div className="flex gap-3">
          <Button
            variant="outline"
            className="flex-1"
            onClick={() => router.push(`/orders/${id}`)}
          >
            Cancelar
          </Button>
          <Button
            className="flex-[2]"
            disabled={isSaving || updateOrder.isPending}
            onClick={handleSave}
          >
            {isSaving || updateOrder.isPending ? "Salvando..." : "Salvar alterações"}
          </Button>
        </div>
      </div>
    </>
  );
}

function SummaryCard({
  subtotalCents,
  deliveryMode,
  isPending,
  onSave,
}: {
  subtotalCents: number;
  deliveryMode: DeliveryMode;
  isPending: boolean;
  onSave: () => void;
}) {
  return (
    <div className="rounded-xl border border-border bg-card p-4 md:p-5">
      <div className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
        Resumo
      </div>
      <div className="mt-3 space-y-2 text-sm">
        <div className="flex justify-between">
          <span className="text-muted-foreground">Subtotal</span>
          <span className="font-mono font-semibold">
            {formatCents(subtotalCents)}
          </span>
        </div>
        <div className="flex justify-between">
          <span className="text-muted-foreground">Entrega</span>
          <span className="font-mono text-muted-foreground">
            {deliveryMode === "entrega" ? "—" : "Retirada"}
          </span>
        </div>
        <div className="flex justify-between border-t border-border pt-2">
          <span className="font-semibold">Total</span>
          <span className="font-mono text-base font-semibold tracking-tight">
            {formatCents(subtotalCents)}
          </span>
        </div>
      </div>
      <Button
        className="mt-4 w-full"
        disabled={isPending}
        onClick={onSave}
      >
        {isPending ? "Salvando..." : "Salvar alterações"}
      </Button>
    </div>
  );
}
