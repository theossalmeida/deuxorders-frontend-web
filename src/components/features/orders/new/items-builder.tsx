"use client";

import { useState } from "react";
import { ChevronDown, ChevronUp, Minus, Plus, X } from "lucide-react";
import { Input } from "@/components/ui/input";
import { toneFor } from "@/lib/category-tone";
import { formatCents } from "@/lib/format";
import { isCakeCategory } from "@/lib/product-categories";
import { cn } from "@/lib/utils";

export type OrderItemDraft = {
  productId: string;
  name: string;
  category?: string;
  unitPriceCents: number;
  qty: number;
  observation?: string;
  massa?: string;
  sabor?: string;
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
  const [expandedIdx, setExpandedIdx] = useState<number | null>(null);

  function updateQty(i: number, delta: number) {
    const next = [...items];
    next[i] = { ...next[i], qty: Math.max(1, next[i].qty + delta) };
    onChange(next);
  }

  function updateField(i: number, field: "observation" | "massa" | "sabor", value: string) {
    const next = [...items];
    next[i] = { ...next[i], [field]: value || undefined };
    onChange(next);
  }

  function remove(i: number) {
    onChange(items.filter((_, idx) => idx !== i));
    if (expandedIdx === i) setExpandedIdx(null);
    else if (expandedIdx !== null && expandedIdx > i) setExpandedIdx(expandedIdx - 1);
  }

  function toggleExpand(i: number) {
    setExpandedIdx(expandedIdx === i ? null : i);
  }

  return (
    <div className="space-y-2">
      {items.map((it, i) => {
        const tone = toneFor(it.category);
        const expanded = expandedIdx === i;
        const isCake = isCakeCategory(it.category) || !!it.massa || !!it.sabor;
        const hasDetails = !!it.observation || !!it.massa || !!it.sabor;

        return (
          <div
            key={`${it.productId}-${i}`}
            className="rounded-lg border border-border bg-card p-3"
          >
            {/* Row 1: swatch + name + chevron + remove */}
            <div className="flex items-center gap-3">
              <div
                className="h-10 w-10 shrink-0 rounded-md"
                style={{
                  background: `repeating-linear-gradient(135deg, ${tone}22, ${tone}22 4px, ${tone}11 4px, ${tone}11 8px)`,
                }}
              />
              <div className="min-w-0 flex-1">
                <div className="truncate text-sm font-medium">{it.name}</div>
              </div>
              <button
                type="button"
                onClick={() => toggleExpand(i)}
                className={cn(
                  "shrink-0 text-muted-foreground hover:text-foreground",
                  hasDetails && !expanded && "text-brand",
                )}
                aria-label={expanded ? "Recolher detalhes" : "Expandir detalhes"}
              >
                {expanded ? <ChevronUp size={14} /> : <ChevronDown size={14} />}
              </button>
              <button
                type="button"
                onClick={() => remove(i)}
                className="shrink-0 text-muted-foreground hover:text-destructive"
                aria-label="Remover item"
              >
                <X size={14} />
              </button>
            </div>

            {/* Row 2: unit price + qty controls + total */}
            <div className="mt-2 flex items-center gap-3 pl-[52px]">
              <div className="min-w-0 flex-1 font-mono text-[11px] text-muted-foreground">
                {formatCents(it.unitPriceCents)} · un
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
            </div>

            {/* Expandable details */}
            {expanded && (
              <div className="mt-2 border-t border-border pt-2 pl-[52px] space-y-2">
                <div>
                  <label className="mb-1 block text-[11px] font-medium text-muted-foreground">
                    Observação
                  </label>
                  <Input
                    value={it.observation ?? ""}
                    onChange={(e) => updateField(i, "observation", e.target.value)}
                    placeholder="Ex: sem glúten, cobertura extra..."
                    className="h-8 text-sm"
                  />
                </div>
                {isCake && (
                  <div className="grid grid-cols-2 gap-2">
                    <div>
                      <label className="mb-1 block text-[11px] font-medium text-muted-foreground">
                        Sabor
                      </label>
                      <Input
                        value={it.sabor ?? ""}
                        onChange={(e) => updateField(i, "sabor", e.target.value)}
                        placeholder="Ex: chocolate, morango..."
                        className="h-8 text-sm"
                      />
                    </div>
                    <div>
                      <label className="mb-1 block text-[11px] font-medium text-muted-foreground">
                        Massa
                      </label>
                      <Input
                        value={it.massa ?? ""}
                        onChange={(e) => updateField(i, "massa", e.target.value)}
                        placeholder="Ex: branca, chocolate..."
                        className="h-8 text-sm"
                      />
                    </div>
                  </div>
                )}
              </div>
            )}
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
