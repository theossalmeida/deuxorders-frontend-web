"use client";

import { Minus, Plus, X } from "lucide-react";
import { toneFor } from "@/lib/category-tone";
import { formatCents } from "@/lib/format";
import { cn } from "@/lib/utils";

export type OrderItemDraft = {
  productId: string;
  name: string;
  category?: string;
  unitPriceCents: number;
  qty: number;
};

export function ItemsBuilder({
  items,
  onChange,
  onAddClick,
  size = "md",
}: {
  items: OrderItemDraft[];
  onChange: (items: OrderItemDraft[]) => void;
  onAddClick: () => void;
  size?: "sm" | "md";
}) {
  const btn = size === "sm" ? "h-[22px] w-[22px]" : "h-[26px] w-[26px]";

  function updateQty(i: number, delta: number) {
    const next = [...items];
    next[i] = { ...next[i], qty: Math.max(1, next[i].qty + delta) };
    onChange(next);
  }

  function remove(i: number) {
    onChange(items.filter((_, idx) => idx !== i));
  }

  return (
    <div className="space-y-2">
      {items.map((it, i) => {
        const tone = toneFor(it.category);
        return (
          <div
            key={it.productId}
            className="flex items-center gap-3 rounded-lg border border-border bg-card p-3"
          >
            <div
              className="h-10 w-10 shrink-0 rounded-md"
              style={{
                background: `repeating-linear-gradient(135deg, ${tone}22, ${tone}22 4px, ${tone}11 4px, ${tone}11 8px)`,
              }}
            />
            <div className="min-w-0 flex-1">
              <div className="truncate text-sm font-medium">{it.name}</div>
              <div className="mt-0.5 font-mono text-[11px] text-muted-foreground">
                {formatCents(it.unitPriceCents)} · un
              </div>
            </div>
            <div className="flex items-center gap-1.5">
              <button
                type="button"
                onClick={() => updateQty(i, -1)}
                className={cn("flex items-center justify-center rounded-md bg-muted text-foreground", btn)}
                aria-label="Diminuir quantidade"
              >
                <Minus size={12} />
              </button>
              <span className="min-w-[18px] text-center font-mono text-sm font-semibold">
                {it.qty}
              </span>
              <button
                type="button"
                onClick={() => updateQty(i, 1)}
                className={cn("flex items-center justify-center rounded-md bg-foreground text-background", btn)}
                aria-label="Aumentar quantidade"
              >
                <Plus size={12} />
              </button>
            </div>
            <div className="min-w-[70px] text-right font-mono text-sm font-semibold">
              {formatCents(it.unitPriceCents * it.qty)}
            </div>
            <button
              type="button"
              onClick={() => remove(i)}
              className="text-muted-foreground hover:text-destructive"
              aria-label="Remover item"
            >
              <X size={14} />
            </button>
          </div>
        );
      })}

      <button
        type="button"
        onClick={onAddClick}
        className="flex w-full items-center justify-center gap-2 rounded-lg border border-dashed border-border bg-card/50 p-3 text-sm text-muted-foreground transition hover:text-foreground"
      >
        <Plus size={14} />
        Adicionar item do catálogo
      </button>
    </div>
  );
}
