"use client";

import { use, useState } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import {
  useOrder,
  useUpdateOrder,
  useCompleteOrder,
  useCancelOrder,
  useDeleteOrder,
  useOrdersDropdownData,
} from "@/hooks/useOrders";
import { createOrdersApi, uploadToPresignedUrl } from "@/lib/api/orders";
import { useToken } from "@/hooks/useToken";
import { OrderStatusBadge } from "@/components/orders/OrderStatusBadge";
import { OrderItemForm } from "@/components/orders/OrderItemForm";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";
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
  CheckCircle,
  XCircle,
  Trash2,
  Loader2,
  ImagePlus,
  X,
} from "lucide-react";
import { formatCurrency, formatDate } from "@/lib/format";
import { OrderItemInput, ORDER_STATUS_INT } from "@/types/orders";

export default function EditOrderPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  const router = useRouter();
  const token = useToken();

  const { data: order, isLoading } = useOrder(id);
  const { products } = useOrdersDropdownData();
  const updateOrder = useUpdateOrder(id);
  const completeOrder = useCompleteOrder();
  const cancelOrder = useCancelOrder();
  const deleteOrder = useDeleteOrder();

  const [deliveryDate, setDeliveryDate] = useState("");
  const [newItems, setNewItems] = useState<OrderItemInput[]>([]);
  const [newImages, setNewImages] = useState<File[]>([]);
  const [isSaving, setIsSaving] = useState(false);

  if (isLoading || !order) {
    return (
      <div className="flex justify-center py-16">
        <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
      </div>
    );
  }

  const canEdit = true;
  const totalCents = order.items.reduce(
    (s, i) => s + (i.itemCanceled ? 0 : i.paidUnitPrice * i.quantity),
    0
  );

  async function handleSave() {
    if (!token) return;
    setIsSaving(true);
    try {
      const api = createOrdersApi(token);
      const objectKeys: string[] = [];
      for (const file of newImages) {
        const { uploadUrl, objectKey } = await api.getPresignedUrl({
          fileName: file.name,
          contentType: file.type,
        });
        await uploadToPresignedUrl(uploadUrl, file, file.type);
        objectKeys.push(objectKey);
      }

      await updateOrder.mutateAsync({
        deliveryDate: deliveryDate
          ? new Date(deliveryDate + "T12:00:00Z").toISOString()
          : undefined,
        items: newItems.length
          ? newItems.map((i) => ({
              productId: i.productId,
              quantity: i.quantity,
              paidUnitPrice: i.unitPrice,
              observation: i.observation,
              massa: i.massa,
              sabor: i.sabor,
            }))
          : undefined,
        references: objectKeys.length ? objectKeys : undefined,
      });

      setNewItems([]);
      setNewImages([]);
    } finally {
      setIsSaving(false);
    }
  }

  function handleImageChange(e: React.ChangeEvent<HTMLInputElement>) {
    const files = Array.from(e.target.files ?? []);
    setNewImages((prev) => [...prev, ...files].slice(0, 3 - (order?.references.length ?? 0)));
    e.target.value = "";
  }

  return (
    <div className="max-w-2xl mx-auto px-4 py-6 space-y-6">
      <div className="flex items-center gap-3">
        <Button variant="ghost" size="icon" onClick={() => router.back()}>
          <ArrowLeft className="h-5 w-5" />
        </Button>
        <div className="flex-1 min-w-0">
          <h1 className="text-lg font-bold truncate">
            #{order.id.slice(0, 8)} · {order.clientName}
          </h1>
          <div className="flex items-center gap-2 mt-0.5">
            <OrderStatusBadge status={order.status} />
            <span className="text-xs text-muted-foreground">
              Entrega: {formatDate(order.deliveryDate)}
            </span>
          </div>
        </div>
      </div>

      {/* Actions */}
      <div className="flex flex-wrap gap-2">
        {order.status !== "Completed" && order.status !== "Canceled" && (
          <Button
            size="sm"
            className="bg-green-600 hover:bg-green-700 text-white"
            onClick={() => completeOrder.mutate(id)}
            disabled={completeOrder.isPending}
          >
            <CheckCircle className="h-4 w-4 mr-1" />
            Concluir
          </Button>
        )}
        {order.status !== "Canceled" && order.status !== "Completed" && (
          <Button
            size="sm"
            variant="destructive"
            onClick={() => cancelOrder.mutate(id)}
            disabled={cancelOrder.isPending}
          >
            <XCircle className="h-4 w-4 mr-1" />
            Cancelar pedido
          </Button>
        )}
        <AlertDialog>
          <AlertDialogTrigger render={<Button size="sm" variant="outline" className="text-destructive border-destructive" />}>
            <Trash2 className="h-4 w-4 mr-1" />
            Excluir
          </AlertDialogTrigger>
          <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogTitle>Excluir pedido?</AlertDialogTitle>
              <AlertDialogDescription>
                Esta ação não pode ser desfeita.
              </AlertDialogDescription>
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

      {/* Items list */}
      <div className="space-y-3 rounded-xl border p-4">
        <h2 className="font-semibold text-sm text-muted-foreground uppercase tracking-wide">
          Itens
        </h2>
        <ul className="space-y-2">
          {order.items.map((item) => (
            <li
              key={item.productId}
              className={`flex justify-between text-sm rounded-lg border px-3 py-2 ${
                item.itemCanceled ? "opacity-50 line-through" : "bg-white"
              }`}
            >
              <div>
                <p className="font-medium">
                  {item.productName}
                  {item.productSize ? ` (${item.productSize})` : ""}
                </p>
                <p className="text-xs text-muted-foreground">
                  {item.quantity}x {formatCurrency(item.paidUnitPrice)}
                </p>
                {item.massa && (
                  <p className="text-xs text-muted-foreground">Massa: {item.massa}</p>
                )}
                {item.sabor && (
                  <p className="text-xs text-muted-foreground">Sabor: {item.sabor}</p>
                )}
                {item.observation && (
                  <p className="text-xs text-muted-foreground italic">Obs: {item.observation}</p>
                )}
              </div>
              <span className="font-semibold text-right shrink-0">
                {formatCurrency(item.totalPaid)}
              </span>
            </li>
          ))}
        </ul>
        <Separator />
        <div className="flex justify-between font-bold">
          <span>Total pago</span>
          <span>{formatCurrency(order.totalPaid)}</span>
        </div>
      </div>

      {/* References */}
      {order.references.length > 0 && (
        <div className="space-y-3 rounded-xl border p-4">
          <h2 className="font-semibold text-sm text-muted-foreground uppercase tracking-wide">
            Imagens de referência
          </h2>
          <div className="flex flex-wrap gap-2">
            {order.references.map((ref) => (
              <img
                key={ref}
                src={ref.startsWith("http") ? ref : `${process.env.NEXT_PUBLIC_API_URL}/${ref}`}
                alt="ref"
                className="w-24 h-24 object-cover rounded-lg border"
              />
            ))}
          </div>
        </div>
      )}

      {/* Edit section — only when Received */}
      {canEdit && (
        <>
          <div className="space-y-4 rounded-xl border p-4">
            <h2 className="font-semibold text-sm text-muted-foreground uppercase tracking-wide">
              Editar data de entrega
            </h2>
            <div className="space-y-1">
              <Label>Nova data de entrega</Label>
              <Input
                type="date"
                value={deliveryDate}
                onChange={(e) => setDeliveryDate(e.target.value)}
              />
            </div>
          </div>

          <div className="space-y-4 rounded-xl border p-4">
            <h2 className="font-semibold text-sm text-muted-foreground uppercase tracking-wide">
              Adicionar itens
            </h2>
            <OrderItemForm
              products={products.data ?? []}
              items={newItems}
              onAdd={(item) => setNewItems((prev) => [...prev, item])}
              onRemove={(i) => setNewItems((prev) => prev.filter((_, idx) => idx !== i))}
            />
          </div>

          {order.references.length < 3 && (
            <div className="space-y-3 rounded-xl border p-4">
              <h2 className="font-semibold text-sm text-muted-foreground uppercase tracking-wide">
                Adicionar imagens de referência
              </h2>
              <div className="flex flex-wrap gap-2">
                {newImages.map((file, i) => (
                  <div key={i} className="relative w-20 h-20">
                    <img
                      src={URL.createObjectURL(file)}
                      alt="ref"
                      className="w-20 h-20 object-cover rounded-lg border"
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
                {newImages.length < 3 - order.references.length && (
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
          )}

          <Button
            className="w-full"
            style={{ backgroundColor: "#581629" }}
            onClick={handleSave}
            disabled={isSaving || (!deliveryDate && newItems.length === 0 && newImages.length === 0)}
          >
            {isSaving ? <Loader2 className="h-4 w-4 animate-spin" /> : "Salvar alterações"}
          </Button>
        </>
      )}
    </div>
  );
}
