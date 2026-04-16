"use client";

import { use, useState } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import {
  useOrder,
  useUpdateOrder,
  useDeleteOrder,
  useOrdersDropdownData,
  useCancelOrderItem,
  useDeleteReference,
  useMarkOrderAsPaid,
  useUnmarkOrderAsPaid,
} from "@/hooks/useOrders";
import { getRoleFromToken } from "@/lib/auth/session";
import { createOrdersApi, uploadToPresignedUrl } from "@/lib/api/orders";
import { useToken } from "@/hooks/useToken";
import { OrderStatusBadge } from "@/components/orders/OrderStatusBadge";
import { OrderItemForm } from "@/components/orders/OrderItemForm";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Separator } from "@/components/ui/separator";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import {
  ArrowLeft,
  Trash2,
  Loader2,
  ImagePlus,
  X,
  Ban,
} from "lucide-react";
import { formatCurrency, formatDateTime } from "@/lib/format";
import {
  Order,
  OrderItem,
  OrderItemInput,
  OrderStatus,
  ALL_ORDER_STATUSES,
  ORDER_STATUS_LABEL,
  ORDER_STATUS_INT,
} from "@/types/orders";
import { ProductDropdownItem } from "@/types/products";

// ─── inner types ────────────────────────────────────────────────────────────

type EditableItem = Omit<OrderItem, "totalPaid" | "totalValue" | "baseUnitPrice"> & {
  quantity: number;
  paidUnitPrice: number;
  massa: string;
  sabor: string;
  observation: string;
};

// ─── helpers ────────────────────────────────────────────────────────────────

function toEditable(item: OrderItem): EditableItem {
  return {
    productId: item.productId,
    productName: item.productName,
    productSize: item.productSize,
    quantity: item.quantity,
    paidUnitPrice: item.paidUnitPrice,
    massa: item.massa ?? "",
    sabor: item.sabor ?? "",
    observation: item.observation ?? "",
    itemCanceled: item.itemCanceled,
  };
}

function isPickup(delivery: string | null): boolean {
  return !delivery || delivery === "pickup";
}

// ─── sub-component: single existing item row ─────────────────────────────────

function ExistingItemRow({
  item,
  onUpdate,
  onCancel,
}: {
  item: EditableItem;
  onUpdate: (patch: Partial<EditableItem>) => void;
  onCancel: () => void;
}) {
  const [priceInput, setPriceInput] = useState(
    (item.paidUnitPrice / 100).toFixed(2).replace(".", ",")
  );

  function commitPrice() {
    const n = parseFloat(priceInput.replace(",", "."));
    if (!isNaN(n) && n > 0) onUpdate({ paidUnitPrice: Math.round(n * 100) });
  }

  return (
    <li
      className={`space-y-3 rounded-lg border p-3 text-sm ${
        item.itemCanceled ? "opacity-50 bg-muted/40" : "bg-white"
      }`}
    >
      <div className="flex items-start justify-between gap-2">
        <p className="font-medium">
          {item.productName}
          {item.productSize ? ` (${item.productSize})` : ""}
          {item.itemCanceled && (
            <span className="ml-2 text-xs text-destructive font-normal">cancelado</span>
          )}
        </p>
        {!item.itemCanceled && (
          <Button
            type="button"
            size="icon"
            variant="ghost"
            className="h-6 w-6 shrink-0 text-muted-foreground hover:text-destructive"
            onClick={onCancel}
            title="Cancelar item"
          >
            <Ban className="h-4 w-4" />
          </Button>
        )}
      </div>

      {!item.itemCanceled && (
        <div className="grid grid-cols-2 gap-2">
          <div className="space-y-1">
            <Label className="text-xs">Quantidade</Label>
            <Input
              type="number"
              min="1"
              value={item.quantity}
              onChange={(e) => {
                const n = parseInt(e.target.value, 10);
                if (!isNaN(n) && n > 0) onUpdate({ quantity: n });
              }}
            />
          </div>

          <div className="space-y-1">
            <Label className="text-xs">Preço unitário (R$)</Label>
            <Input
              type="text"
              inputMode="decimal"
              value={priceInput}
              onChange={(e) => setPriceInput(e.target.value)}
              onBlur={commitPrice}
            />
          </div>

          <div className="space-y-1">
            <Label className="text-xs">Massa</Label>
            <Input
              value={item.massa}
              onChange={(e) => onUpdate({ massa: e.target.value })}
              placeholder="ex: integral"
            />
          </div>

          <div className="space-y-1">
            <Label className="text-xs">Sabor</Label>
            <Input
              value={item.sabor}
              onChange={(e) => onUpdate({ sabor: e.target.value })}
              placeholder="ex: chocolate"
            />
          </div>

          <div className="col-span-2 space-y-1">
            <Label className="text-xs">Observação</Label>
            <Textarea
              rows={2}
              value={item.observation}
              onChange={(e) => onUpdate({ observation: e.target.value })}
              placeholder="ex: sem açúcar"
            />
          </div>
        </div>
      )}
    </li>
  );
}

// ─── inner form (receives guaranteed non-null order) ─────────────────────────

function EditOrderForm({
  order,
  id,
  products,
}: {
  order: Order;
  id: string;
  products: ProductDropdownItem[];
}) {
  const router = useRouter();
  const token = useToken();

  const updateOrder = useUpdateOrder(id);
  const deleteOrder = useDeleteOrder();
  const cancelItem = useCancelOrderItem(id);
  const deleteRef = useDeleteReference(id);
  const markAsPaid = useMarkOrderAsPaid(id);
  const unmarkAsPaid = useUnmarkOrderAsPaid(id);
  const isAdmin = getRoleFromToken(token) === "Administrator";
  const [unpayReason, setUnpayReason] = useState("");

  // ── form state initialised from the loaded order ──
  const [status, setStatus] = useState<OrderStatus>(order.status);
  const [deliveryDate, setDeliveryDate] = useState(order.deliveryDate.slice(0, 16));
  const [isDelivery, setIsDelivery] = useState(!isPickup(order.delivery));
  const [address, setAddress] = useState(
    !isPickup(order.delivery) ? (order.delivery ?? "") : ""
  );
  const [existingItems, setExistingItems] = useState<EditableItem[]>(
    order.items.map(toEditable)
  );
  const [newItems, setNewItems] = useState<OrderItemInput[]>([]);
  const [newImages, setNewImages] = useState<File[]>([]);
  const [isSaving, setIsSaving] = useState(false);

  function updateItem(productId: string, patch: Partial<EditableItem>) {
    setExistingItems((prev) =>
      prev.map((i) => (i.productId === productId ? { ...i, ...patch } : i))
    );
  }

  async function handleCancelItem(productId: string) {
    await cancelItem.mutateAsync(productId);
    setExistingItems((prev) =>
      prev.map((i) => (i.productId === productId ? { ...i, itemCanceled: true } : i))
    );
  }

  async function handleDeleteRef(objectKey: string) {
    await deleteRef.mutateAsync(objectKey);
  }

  function handleImageChange(e: React.ChangeEvent<HTMLInputElement>) {
    const files = Array.from(e.target.files ?? []);
    const remaining = 3 - order.references.length;
    setNewImages((prev) => [...prev, ...files].slice(0, remaining));
    e.target.value = "";
  }

  async function handleSave() {
    if (!token) return;
    setIsSaving(true);
    try {
      const api = createOrdersApi(token);

      // upload new reference images first
      const objectKeys: string[] = [];
      for (const file of newImages) {
        const { uploadUrl, objectKey } = await api.getPresignedUrl({
          fileName: file.name,
          contentType: file.type,
        });
        await uploadToPresignedUrl(uploadUrl, file, file.type);
        objectKeys.push(objectKey);
      }

      const allItems = [
        ...existingItems
          .filter((i) => !i.itemCanceled)
          .map((i) => ({
            productId: i.productId,
            quantity: i.quantity,
            paidUnitPrice: i.paidUnitPrice,
            observation: i.observation || undefined,
            massa: i.massa || undefined,
            sabor: i.sabor || undefined,
          })),
        ...newItems.map((i) => ({
          productId: i.productId,
          quantity: i.quantity,
          paidUnitPrice: i.unitPrice,
          observation: i.observation,
          massa: i.massa,
          sabor: i.sabor,
        })),
      ];

      await updateOrder.mutateAsync({
        status: ORDER_STATUS_INT[status],
        deliveryDate: new Date(deliveryDate).toISOString(),
        delivery: isDelivery ? address : null,
        items: allItems.length ? allItems : undefined,
        references: objectKeys.length ? objectKeys : undefined,
      });

      setNewItems([]);
      setNewImages([]);
      toast.success("Pedido salvo.");
    } finally {
      setIsSaving(false);
    }
  }

  const activeReferences = order.references; // mutated in real-time via deleteRef → React Query

  return (
    <div className="max-w-2xl mx-auto px-4 py-6 space-y-6">
      {/* Header */}
      <div className="flex items-center gap-3">
        <Button variant="ghost" size="icon" onClick={() => router.back()}>
          <ArrowLeft className="h-5 w-5" />
        </Button>
        <div className="flex-1 min-w-0">
          <h1 className="text-lg font-bold truncate">
            #{order.id.slice(0, 8)} · {order.clientName}
          </h1>
          <p className="text-xs text-muted-foreground mt-0.5">
            Entrega: {formatDateTime(order.deliveryDate)}
          </p>
        </div>
        <AlertDialog>
          <AlertDialogTrigger
            render={
              <Button size="icon" variant="ghost" className="text-destructive shrink-0" />
            }
          >
            <Trash2 className="h-5 w-5" />
          </AlertDialogTrigger>
          <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogTitle>Excluir pedido?</AlertDialogTitle>
              <AlertDialogDescription>Esta ação não pode ser desfeita.</AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogCancel>Cancelar</AlertDialogCancel>
              <AlertDialogAction
                className="bg-destructive hover:bg-destructive/90"
                onClick={() => deleteOrder.mutate(id)}
              >
                Excluir
              </AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>
      </div>

      {/* Info */}
      <div className="space-y-4 rounded-xl border p-4">
        <h2 className="font-semibold text-sm text-muted-foreground uppercase tracking-wide">
          Informações
        </h2>

        <div className="space-y-1">
          <Label>Status</Label>
          <Select
            value={status}
            onValueChange={(v) => setStatus((v ?? order.status) as OrderStatus)}
          >
            <SelectTrigger>
              <SelectValue>
                <OrderStatusBadge status={status} />
              </SelectValue>
            </SelectTrigger>
            <SelectContent>
              {ALL_ORDER_STATUSES.map((s) => (
                <SelectItem key={s} value={s}>
                  {ORDER_STATUS_LABEL[s]}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <div className="space-y-1">
          <Label>Data de entrega</Label>
          <Input
            type="datetime-local"
            value={deliveryDate}
            onChange={(e) => setDeliveryDate(e.target.value)}
          />
        </div>

        <div className="space-y-1">
          <Label>Tipo de entrega</Label>
          <Select
            value={isDelivery ? "delivery" : "pickup"}
            onValueChange={(v) => setIsDelivery((v ?? "pickup") === "delivery")}
          >
            <SelectTrigger>
              <SelectValue>{isDelivery ? "Entrega" : "Retirada"}</SelectValue>
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="pickup">Retirada</SelectItem>
              <SelectItem value="delivery">Entrega</SelectItem>
            </SelectContent>
          </Select>
        </div>

        {isDelivery && (
          <div className="space-y-1">
            <Label>Endereço de entrega</Label>
            <Input
              value={address}
              onChange={(e) => setAddress(e.target.value)}
              placeholder="Rua, número, complemento"
            />
          </div>
        )}
      </div>

      {/* Existing items */}
      <div className="space-y-3 rounded-xl border p-4">
        <h2 className="font-semibold text-sm text-muted-foreground uppercase tracking-wide">
          Itens do pedido
        </h2>
        <ul className="space-y-3">
          {existingItems.map((item) => (
            <ExistingItemRow
              key={item.productId}
              item={item}
              onUpdate={(patch) => updateItem(item.productId, patch)}
              onCancel={() => handleCancelItem(item.productId)}
            />
          ))}
        </ul>
        <Separator />
        <div className="flex justify-between font-bold text-sm">
          <span>Total pago</span>
          <span>{formatCurrency(order.totalPaid)}</span>
        </div>
      </div>

      {/* Add new items */}
      <div className="space-y-4 rounded-xl border p-4">
        <h2 className="font-semibold text-sm text-muted-foreground uppercase tracking-wide">
          Adicionar itens
        </h2>
        <OrderItemForm
          products={products}
          items={newItems}
          onAdd={(item) => setNewItems((prev) => [...prev, item])}
          onRemove={(i) => setNewItems((prev) => prev.filter((_, idx) => idx !== i))}
        />
      </div>

      {/* Reference images */}
      <div className="space-y-3 rounded-xl border p-4">
        <h2 className="font-semibold text-sm text-muted-foreground uppercase tracking-wide">
          Imagens de referência
        </h2>
        <div className="flex flex-wrap gap-2">
          {activeReferences.map((ref) => (
            <div key={ref} className="relative w-20 h-20">
              <img
                src={ref.startsWith("http") ? ref : `${process.env.NEXT_PUBLIC_API_URL}/${ref}`}
                alt="ref"
                className="w-20 h-20 object-cover rounded-lg border"
              />
              <button
                type="button"
                onClick={() => handleDeleteRef(ref)}
                className="absolute -top-1.5 -right-1.5 bg-destructive text-white rounded-full p-0.5"
              >
                <X className="h-3 w-3" />
              </button>
            </div>
          ))}
          {newImages.map((file, i) => (
            <div key={`new-${i}`} className="relative w-20 h-20">
              <img
                src={URL.createObjectURL(file)}
                alt="ref"
                className="w-20 h-20 object-cover rounded-lg border opacity-60"
              />
              <button
                type="button"
                onClick={() => setNewImages((prev) => prev.filter((_, idx) => idx !== i))}
                className="absolute -top-1.5 -right-1.5 bg-destructive text-white rounded-full p-0.5"
              >
                <X className="h-3 w-3" />
              </button>
            </div>
          ))}
          {activeReferences.length + newImages.length < 3 && (
            <label className="flex flex-col items-center justify-center w-20 h-20 rounded-lg border-2 border-dashed text-muted-foreground cursor-pointer hover:border-primary transition-colors">
              <ImagePlus className="h-5 w-5" />
              <span className="text-xs mt-1">Adicionar</span>
              <input
                type="file"
                accept="image/jpeg,image/png,image/webp"
                multiple
                className="hidden"
                onChange={handleImageChange}
              />
            </label>
          )}
        </div>
      </div>

      {/* Save */}
      <Button
        className="w-full"
        style={{ backgroundColor: "#581629" }}
        onClick={handleSave}
        disabled={isSaving}
      >
        {isSaving ? <Loader2 className="h-4 w-4 animate-spin" /> : "Salvar alterações"}
      </Button>

      {/* Pay / Unpay (admin only) */}
      {isAdmin && order.status !== "Canceled" && (
        <div className="flex flex-col gap-2 pt-4 border-t">
          {!order.paidAt ? (
            <Button
              variant="default"
              className="bg-emerald-600 hover:bg-emerald-700 text-white"
              onClick={() => markAsPaid.mutate()}
              disabled={markAsPaid.isPending || order.totalPaid <= 0}
            >
              Marcar como pago
            </Button>
          ) : (
            <>
              <p className="text-sm text-muted-foreground">
                Pago em {formatDateTime(order.paidAt)} por {order.paidByUserName}
              </p>
              <AlertDialog>
                <AlertDialogTrigger asChild>
                  <Button variant="outline" className="text-red-600 border-red-300 hover:bg-red-50">
                    Estornar pagamento
                  </Button>
                </AlertDialogTrigger>
                <AlertDialogContent>
                  <AlertDialogHeader>
                    <AlertDialogTitle>Estornar pagamento</AlertDialogTitle>
                    <AlertDialogDescription>
                      Informe o motivo do estorno (mínimo 5 caracteres).
                    </AlertDialogDescription>
                  </AlertDialogHeader>
                  <Textarea
                    value={unpayReason}
                    onChange={(e) => setUnpayReason(e.target.value)}
                    placeholder="Motivo do estorno..."
                    className="mt-2"
                  />
                  <AlertDialogFooter>
                    <AlertDialogCancel>Cancelar</AlertDialogCancel>
                    <AlertDialogAction
                      onClick={() => unmarkAsPaid.mutate(unpayReason)}
                      disabled={unpayReason.length < 5 || unmarkAsPaid.isPending}
                    >
                      Confirmar estorno
                    </AlertDialogAction>
                  </AlertDialogFooter>
                </AlertDialogContent>
              </AlertDialog>
            </>
          )}
        </div>
      )}
    </div>
  );
}

// ─── page shell ──────────────────────────────────────────────────────────────

export default function EditOrderPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = use(params);
  const { data: order, isLoading } = useOrder(id);
  const { products } = useOrdersDropdownData();

  if (isLoading || !order) {
    return (
      <div className="flex justify-center py-16">
        <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
      </div>
    );
  }

  return (
    <EditOrderForm
      order={order}
      id={id}
      products={products.data ?? []}
    />
  );
}
