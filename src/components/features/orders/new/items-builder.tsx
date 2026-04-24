"use client";

import { useState } from "react";
import { ChevronDown, ChevronUp, Minus, Plus, X } from "lucide-react";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { toneFor } from "@/lib/category-tone";
import {
  BRIGADEIRO_FLAVORS,
  CAKE_DOUGHS,
  CAKE_FILLINGS,
  COOKIE_FLAVORS,
  getRecipeKind,
  splitFillings,
} from "@/lib/recipe-options";
import { cn } from "@/lib/utils";

export type OrderItemDraft = {
  productId: string;
  name: string;
  size?: string | null;
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
  const [priceInputs, setPriceInputs] = useState<Record<string, string>>({});

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

  function updateCakeFilling(i: number, filling: string) {
    const current = splitFillings(items[i].sabor);
    const exists = current.includes(filling);
    const nextFillings = exists
      ? current.filter((value) => value !== filling)
      : current.length >= 2
        ? current
        : [...current, filling];

    updateField(i, "sabor", nextFillings.join("|"));
  }

  function updateUnitPrice(i: number, value: string) {
    const parsed = Number.parseFloat(value.replace(",", "."));
    if (!Number.isFinite(parsed)) return;

    const next = [...items];
    next[i] = {
      ...next[i],
      unitPriceCents: Math.max(0, Math.round(parsed * 100)),
    };
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
        const recipeKind = getRecipeKind(it);
        const isCake = recipeKind === "cake";
        const flavorOptions =
          recipeKind === "brigadeiro"
            ? BRIGADEIRO_FLAVORS
            : recipeKind === "cookie"
              ? COOKIE_FLAVORS
              : [];
        const selectedFillings = splitFillings(it.sabor);
        const hasDetails = !!it.observation || !!it.massa || !!it.sabor;
        const itemKey = `${it.productId}-${i}`;

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
                {it.size && (
                  <div className="mt-0.5 text-[11px] text-muted-foreground">
                    {it.size}
                  </div>
                )}
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

            {/* Row 2: unit price + qty controls */}
            <div className="mt-2 grid grid-cols-[minmax(0,1fr)_auto] items-end gap-3 pl-[52px]">
              <div className="min-w-0">
                <label className="mb-1 block text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">
                  Valor un.
                </label>
                <Input
                  type="number"
                  min={0}
                  step="0.01"
                  inputMode="decimal"
                  value={priceInputs[itemKey] ?? (it.unitPriceCents / 100).toFixed(2)}
                  onChange={(event) => {
                    const { value } = event.target;
                    setPriceInputs((current) => ({ ...current, [itemKey]: value }));
                    updateUnitPrice(i, value);
                  }}
                  onBlur={() =>
                    setPriceInputs((current) => {
                      const next = { ...current };
                      delete next[itemKey];
                      return next;
                    })
                  }
                  className="h-8 font-mono text-sm"
                  aria-label={`Valor unitário de ${it.name}`}
                />
              </div>
              <div className="flex items-center gap-1.5 pb-1">
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
                  <div className="space-y-2">
                    <div>
                      <label className="mb-1 block text-[11px] font-medium text-muted-foreground">
                        Massa
                      </label>
                      <Select
                        value={it.massa ?? ""}
                        onValueChange={(value) => {
                          if (value) updateField(i, "massa", value);
                        }}
                      >
                        <SelectTrigger className="h-8 w-full">
                          <SelectValue>
                            {it.massa || "Escolher massa"}
                          </SelectValue>
                        </SelectTrigger>
                        <SelectContent>
                          {CAKE_DOUGHS.map((dough) => (
                            <SelectItem key={dough} value={dough}>
                              {dough}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                    <div>
                      <label className="mb-1 block text-[11px] font-medium text-muted-foreground">
                        Recheios
                      </label>
                      <div className="grid grid-cols-2 gap-1.5">
                        {CAKE_FILLINGS.map((filling) => {
                          const active = selectedFillings.includes(filling);
                          const disabled = !active && selectedFillings.length >= 2;

                          return (
                            <button
                              key={filling}
                              type="button"
                              onClick={() => updateCakeFilling(i, filling)}
                              disabled={disabled}
                              className={cn(
                                "min-h-8 rounded-md border px-2 py-1 text-left text-[11px] transition",
                                active
                                  ? "border-brand bg-brand-soft text-brand"
                                  : "border-border bg-card text-foreground-soft hover:bg-accent",
                                disabled && "cursor-not-allowed opacity-45 hover:bg-card",
                              )}
                            >
                              {filling}
                            </button>
                          );
                        })}
                      </div>
                    </div>
                  </div>
                )}
                {flavorOptions.length > 0 && (
                  <div>
                    <label className="mb-1 block text-[11px] font-medium text-muted-foreground">
                      Sabor
                    </label>
                    <Select
                      value={it.sabor ?? ""}
                      onValueChange={(value) => {
                        if (value) updateField(i, "sabor", value);
                      }}
                    >
                      <SelectTrigger className="h-8 w-full">
                        <SelectValue>
                          {it.sabor || "Escolher sabor"}
                        </SelectValue>
                      </SelectTrigger>
                      <SelectContent>
                        {flavorOptions.map((flavor) => (
                          <SelectItem key={flavor} value={flavor}>
                            {flavor}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
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
