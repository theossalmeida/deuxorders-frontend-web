"use client";

import { use, useState, useMemo } from "react";
import { useRouter } from "next/navigation";
import { ArrowLeft } from "lucide-react";
import { toast } from "sonner";
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
import { ProductPickerOverlay } from "@/components/features/orders/new/product-picker-overlay";
import { DeliverySection, type DeliveryMode } from "@/components/features/orders/new/delivery-section";
import { EditReferenceManager } from "@/components/features/orders/edit-reference-manager";
import { apiDatetimeLocal, formatCents } from "@/lib/format";
import { extractReferenceObjectKey } from "@/lib/image-ref";
import { STATUS_META } from "@/lib/order-status";
import { getOrderItemRecipeIssue } from "@/lib/recipe-options";
import { createOrdersApi, uploadToPresignedUrl } from "@/lib/api/orders";
import { useOrder, useUpdateOrder, useDeleteReference, useOrdersDropdownData } from "@/hooks/useOrders";
import { useToken } from "@/hooks/useToken";
import {
  ORDER_STATUS_INT,
  ALL_ORDER_STATUSES,
  type OrderStatus,
} from "@/types/orders";
import type { ProductDropdownItem } from "@/types/products";

export default function EditOrderPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  const router = useRouter();
  const token = useToken();
  const { data: order, isLoading } = useOrder(id);
  const updateOrder = useUpdateOrder(id);
  const deleteReference = useDeleteReference(id);
  const { products } = useOrdersDropdownData();

  // Local form state — initialized from order data
  const [status, setStatus] = useState<OrderStatus | null>(null);
  const [items, setItems] = useState<OrderItemDraft[] | null>(null);
  const [deliveryMode, setDeliveryMode] = useState<DeliveryMode | null>(null);
  const [address, setAddress] = useState<string | null>(null);
  const [date, setDate] = useState<string | null>(null);
  const [showProductPicker, setShowProductPicker] = useState(false);
  const [productSearch, setProductSearch] = useState("");
  const [newImageFiles, setNewImageFiles] = useState<File[]>([]);

  const productMetaMap = useMemo(() => {
    const map = new Map<string, { category?: string; size?: string | null }>();
    for (const p of products.data ?? []) {
      map.set(p.id, {
        category: p.category ?? undefined,
        size: p.size,
      });
    }
    return map;
  }, [products.data]);

  // Derive current values (form state or order defaults)
  const currentStatus = status ?? order?.status ?? "Pending";
  const currentItems: OrderItemDraft[] =
    items ??
    (order?.items
      .filter((i) => !i.itemCanceled)
      .map((i) => ({
        productId: i.productId,
        name: i.productName,
        size: i.productSize ?? productMetaMap.get(i.productId)?.size,
        unitPriceCents: i.paidUnitPriceCents,
        qty: i.quantity,
        observation: i.observation ?? undefined,
        massa: i.massa ?? undefined,
        sabor: i.sabor ?? undefined,
        category: productMetaMap.get(i.productId)?.category,
      })) ??
      []);
  const currentDeliveryMode: DeliveryMode =
    deliveryMode ??
    (order?.delivery && order.delivery !== "pickup" ? "entrega" : "retirada");
  const currentAddress =
    address ??
    (order?.delivery && order.delivery !== "pickup" ? order.delivery : "");
  const currentDate =
    date ?? (order?.deliveryDate ? apiDatetimeLocal(order.deliveryDate) : "");
  const currentReferences = order?.references ?? [];

  const subtotalCents = currentItems.reduce(
    (a, i) => a + i.unitPriceCents * i.qty,
    0,
  );

  function addProduct(p: ProductDropdownItem) {
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
          size: p.size,
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

    try {
      const recipeIssue = currentItems.map(getOrderItemRecipeIssue).find(Boolean);
      if (recipeIssue) {
        toast.error(recipeIssue);
        return;
      }

      const api = createOrdersApi(token);
      const uploadedKeys = await Promise.all(
        newImageFiles.map(async (file) => {
          const { uploadUrl, objectKey } = await api.getPresignedUrl({
            fileName: file.name,
            contentType: file.type,
            orderId: id,
          });
          await uploadToPresignedUrl(uploadUrl, file, file.type);
          return objectKey;
        }),
      );

      await updateOrder.mutateAsync({
        status: ORDER_STATUS_INT[currentStatus],
        deliveryDate: currentDate,
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
        references: uploadedKeys.length ? uploadedKeys : undefined,
      });
      router.push(`/orders/${id}`);
    } catch {
      // errors are shown by onError in useUpdateOrder
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
                disabled={updateOrder.isPending}
              >
                {updateOrder.isPending ? "Salvando..." : "Salvar"}
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
        <ProductPickerOverlay
          products={products.data ?? []}
          search={productSearch}
          onSearchChange={setProductSearch}
          onClose={() => setShowProductPicker(false)}
          onSelect={addProduct}
        />
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
                deleteReference.mutate(extractReferenceObjectKey(key))
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
              isPending={updateOrder.isPending}
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
              isPending={updateOrder.isPending}
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
            disabled={updateOrder.isPending}
            onClick={handleSave}
          >
            {updateOrder.isPending ? "Salvando..." : "Salvar alterações"}
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
