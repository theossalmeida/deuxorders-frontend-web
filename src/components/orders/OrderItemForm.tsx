"use client";

import { useState } from "react";
import { ProductDropdownItem } from "@/types/products";
import { OrderItemInput } from "@/types/orders";
import { formatCurrency } from "@/lib/format";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Plus, Trash2 } from "lucide-react";

interface Props {
  products: ProductDropdownItem[];
  items: OrderItemInput[];
  onAdd: (item: OrderItemInput) => void;
  onRemove: (index: number) => void;
}

function requiresMassaSabor(product: ProductDropdownItem | undefined): boolean {
  return false; // backend doesn't expose category here; keep optional
}

export function OrderItemForm({ products, items, onAdd, onRemove }: Props) {
  const [productId, setProductId] = useState("");
  const [quantity, setQuantity] = useState("1");
  const [unitPrice, setUnitPrice] = useState("");
  const [massa, setMassa] = useState("");
  const [sabor, setSabor] = useState("");
  const [observation, setObservation] = useState("");

  const selectedProduct = products.find((p) => p.id === productId);

  function handleAdd() {
    const cleanPrice = unitPrice.replace(",", ".");
    const q = parseInt(quantity, 10);
    const price = parseFloat(cleanPrice);
    if (!productId || isNaN(q) || q <= 0 || isNaN(price) || price <= 0) return;

    onAdd({
      productId,
      quantity: q,
      unitPrice: Math.round(price * 100),
      observation: observation || undefined,
      massa: massa || undefined,
      sabor: sabor || undefined,
    });

    setProductId("");
    setQuantity("1");
    setUnitPrice("");
    setMassa("");
    setSabor("");
    setObservation("");
  }

  return (
    <div className="space-y-4">
      <div className="space-y-3 rounded-lg border p-4 bg-muted/30">
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <div className="sm:col-span-2 space-y-1">
            <Label>Produto</Label>
            <Select value={productId} onValueChange={(v) => setProductId(v ?? "")}>
              <SelectTrigger>
                <SelectValue placeholder="Selecione um produto" />
              </SelectTrigger>
              <SelectContent>
                {products.map((p) => (
                  <SelectItem key={p.id} value={p.id}>
                    {p.name} — {formatCurrency(p.price)}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-1">
            <Label>Quantidade</Label>
            <Input
              type="number"
              min="1"
              value={quantity}
              onChange={(e) => setQuantity(e.target.value)}
            />
          </div>

          <div className="space-y-1">
            <Label>Preço unitário (R$)</Label>
            <Input
              type="text"
              inputMode="decimal"
              placeholder={selectedProduct ? String(selectedProduct.price / 100) : "0,00"}
              value={unitPrice}
              onChange={(e) => setUnitPrice(e.target.value)}
            />
          </div>

          <div className="space-y-1">
            <Label>Massa (opcional)</Label>
            <Input
              value={massa}
              onChange={(e) => setMassa(e.target.value)}
              placeholder="ex: integral"
            />
          </div>

          <div className="space-y-1">
            <Label>Sabor (opcional)</Label>
            <Input
              value={sabor}
              onChange={(e) => setSabor(e.target.value)}
              placeholder="ex: chocolate"
            />
          </div>

          <div className="sm:col-span-2 space-y-1">
            <Label>Observação (opcional)</Label>
            <Textarea
              value={observation}
              onChange={(e) => setObservation(e.target.value)}
              placeholder="ex: sem açúcar"
              rows={2}
            />
          </div>
        </div>

        <Button
          type="button"
          variant="outline"
          size="sm"
          onClick={handleAdd}
          disabled={!productId || !unitPrice || !quantity}
        >
          <Plus className="h-4 w-4 mr-1" />
          Adicionar item
        </Button>
      </div>

      {items.length > 0 && (
        <ul className="space-y-2">
          {items.map((item, i) => {
            const product = products.find((p) => p.id === item.productId);
            return (
              <li
                key={i}
                className="flex items-start justify-between rounded-lg border px-3 py-2 bg-white text-sm"
              >
                <div className="space-y-0.5">
                  <p className="font-medium">{product?.name ?? item.productId}</p>
                  <p className="text-muted-foreground text-xs">
                    {item.quantity}x {formatCurrency(item.unitPrice)} ={" "}
                    {formatCurrency(item.quantity * item.unitPrice)}
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
                <button
                  type="button"
                  onClick={() => onRemove(i)}
                  className="text-muted-foreground hover:text-destructive p-1"
                >
                  <Trash2 className="h-4 w-4" />
                </button>
              </li>
            );
          })}
        </ul>
      )}
    </div>
  );
}
