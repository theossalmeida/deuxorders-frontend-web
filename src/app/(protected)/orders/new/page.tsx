"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { toast } from "sonner";
import { Loader2, ArrowLeft, ImagePlus, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { OrderItemForm } from "@/components/orders/OrderItemForm";
import { formatCurrency } from "@/lib/format";
import { useCreateOrder, useOrdersDropdownData } from "@/hooks/useOrders";
import { OrderItemInput } from "@/types/orders";

const schema = z.object({
  clientId: z.string().min(1, "Selecione um cliente"),
  deliveryDate: z.string().min(1, "Data de entrega obrigatória"),
});

type FormData = z.infer<typeof schema>;

export default function NewOrderPage() {
  const router = useRouter();
  const { clients, products } = useOrdersDropdownData();
  const createOrder = useCreateOrder();

  const [items, setItems] = useState<OrderItemInput[]>([]);
  const [images, setImages] = useState<File[]>([]);
  const [isDelivery, setIsDelivery] = useState(false);
  const [address, setAddress] = useState("");

  const {
    register,
    handleSubmit,
    setValue,
    watch,
    formState: { errors, isSubmitting },
  } = useForm<FormData>({ resolver: zodResolver(schema) });

  const clientId = watch("clientId") ?? "";
  const totalCents = items.reduce((s, i) => s + i.unitPrice * i.quantity, 0);

  function handleImageChange(e: React.ChangeEvent<HTMLInputElement>) {
    const files = Array.from(e.target.files ?? []);
    setImages((prev) => [...prev, ...files].slice(0, 3));
    e.target.value = "";
  }

  async function onSubmit(data: FormData) {
    if (items.length === 0) {
      toast.error("Adicione ao menos um item ao pedido.");
      return;
    }
    if (isDelivery && !address.trim()) {
      toast.error("Informe o endereço de entrega.");
      return;
    }
    await createOrder.mutateAsync({
      input: {
        clientId: data.clientId,
        deliveryDate: new Date(data.deliveryDate + "T12:00:00Z").toISOString(),
        items,
        delivery: isDelivery ? address.trim() : undefined,
      },
      imageFiles: images,
    });
  }

  return (
    <div className="max-w-2xl mx-auto px-4 py-6">
      <div className="flex items-center gap-3 mb-6">
        <Button variant="ghost" size="icon" onClick={() => router.back()}>
          <ArrowLeft className="h-5 w-5" />
        </Button>
        <h1 className="text-xl font-bold">Novo Pedido</h1>
      </div>

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
        <div className="space-y-4 rounded-xl border p-4">
          <h2 className="font-semibold text-sm text-muted-foreground uppercase tracking-wide">
            Informações
          </h2>

          <div className="space-y-1">
            <Label>Cliente</Label>
            <Select
              value={clientId}
              onValueChange={(v) => setValue("clientId", v ?? "", { shouldValidate: true })}
            >
              <SelectTrigger>
                <SelectValue placeholder="Selecione um cliente" />
              </SelectTrigger>
              <SelectContent>
                {(clients.data ?? []).map((c) => (
                  <SelectItem key={c.id} value={c.id}>
                    {c.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            {errors.clientId && (
              <p className="text-xs text-destructive">{errors.clientId.message}</p>
            )}
          </div>

          <div className="space-y-1">
            <Label>Data de entrega</Label>
            <Input type="date" {...register("deliveryDate")} />
            {errors.deliveryDate && (
              <p className="text-xs text-destructive">{errors.deliveryDate.message}</p>
            )}
          </div>

          <div className="space-y-1">
            <Label>Tipo de entrega</Label>
            <Select
              value={isDelivery ? "delivery" : "pickup"}
              onValueChange={(v) => setIsDelivery((v ?? "pickup") === "delivery")}
            >
              <SelectTrigger>
                <SelectValue />
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

        <div className="space-y-4 rounded-xl border p-4">
          <h2 className="font-semibold text-sm text-muted-foreground uppercase tracking-wide">
            Itens do Pedido
          </h2>
          <OrderItemForm
            products={products.data ?? []}
            items={items}
            onAdd={(item) => setItems((prev) => [...prev, item])}
            onRemove={(i) => setItems((prev) => prev.filter((_, idx) => idx !== i))}
          />
        </div>

        <div className="space-y-4 rounded-xl border p-4">
          <h2 className="font-semibold text-sm text-muted-foreground uppercase tracking-wide">
            Imagens de referência (máx. 3)
          </h2>
          <div className="flex flex-wrap gap-2">
            {images.map((file, i) => (
              <div key={i} className="relative w-20 h-20">
                <img
                  src={URL.createObjectURL(file)}
                  alt="ref"
                  className="w-20 h-20 object-cover rounded-lg border"
                />
                <button
                  type="button"
                  onClick={() => setImages((prev) => prev.filter((_, idx) => idx !== i))}
                  className="absolute -top-1.5 -right-1.5 bg-destructive text-white rounded-full p-0.5"
                >
                  <X className="h-3 w-3" />
                </button>
              </div>
            ))}
            {images.length < 3 && (
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

        {items.length > 0 && (
          <div className="flex items-center justify-between rounded-xl border px-4 py-3 bg-muted/50">
            <span className="font-semibold">Total do pedido</span>
            <span className="text-lg font-bold">{formatCurrency(totalCents)}</span>
          </div>
        )}

        <div className="flex gap-3">
          <Button
            type="button"
            variant="outline"
            className="flex-1"
            onClick={() => router.back()}
          >
            Cancelar
          </Button>
          <Button
            type="submit"
            className="flex-1"
            style={{ backgroundColor: "#581629" }}
            disabled={isSubmitting || createOrder.isPending}
          >
            {isSubmitting || createOrder.isPending ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : (
              "Salvar Pedido"
            )}
          </Button>
        </div>
      </form>
    </div>
  );
}
