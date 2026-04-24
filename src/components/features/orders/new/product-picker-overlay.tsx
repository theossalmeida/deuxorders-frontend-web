"use client";

import { useMemo, useState } from "react";
import { ArrowLeft, Plus, Search } from "lucide-react";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { formatCents } from "@/lib/format";
import type { ProductDropdownItem } from "@/types/products";

type ProductGroup = {
  key: string;
  name: string;
  variants: ProductDropdownItem[];
};

export function ProductPickerOverlay({
  products,
  search,
  onSearchChange,
  onClose,
  onSelect,
}: {
  products: ProductDropdownItem[];
  search: string;
  onSearchChange: (value: string) => void;
  onClose: () => void;
  onSelect: (product: ProductDropdownItem) => void;
}) {
  const [selectedByGroup, setSelectedByGroup] = useState<Record<string, string>>({});

  const groups = useMemo(() => {
    const byName = new Map<string, ProductGroup>();

    for (const product of products) {
      const key = product.name.trim().toLocaleLowerCase("pt-BR");
      const group = byName.get(key);

      if (group) {
        group.variants.push(product);
      } else {
        byName.set(key, {
          key,
          name: product.name,
          variants: [product],
        });
      }
    }

    const term = search.trim().toLocaleLowerCase("pt-BR");

    return Array.from(byName.values())
      .map((group) => ({
        ...group,
        variants: group.variants.sort((a, b) =>
          (a.size ?? "").localeCompare(b.size ?? "", "pt-BR", { numeric: true }),
        ),
      }))
      .filter((group) => {
        if (!term) return true;
        return (
          group.name.toLocaleLowerCase("pt-BR").includes(term) ||
          group.variants.some((variant) =>
            (variant.size ?? "").toLocaleLowerCase("pt-BR").includes(term),
          )
        );
      })
      .sort((a, b) => a.name.localeCompare(b.name, "pt-BR"));
  }, [products, search]);

  function selectedVariant(group: ProductGroup) {
    const selectedId = selectedByGroup[group.key];
    return group.variants.find((variant) => variant.id === selectedId) ?? group.variants[0];
  }

  return (
    <div className="fixed inset-0 z-50 flex flex-col bg-background">
      <div className="flex items-center gap-3 border-b border-border px-4 py-3">
        <button type="button" onClick={onClose} aria-label="Voltar">
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
            value={search}
            onChange={(event) => onSearchChange(event.target.value)}
            placeholder="Buscar produto"
            className="pl-9"
            autoFocus
          />
        </div>
      </div>
      <ul className="flex-1 divide-y divide-border overflow-y-auto">
        {groups.map((group) => {
          const selected = selectedVariant(group);

          return (
            <li key={group.key} className="px-4 py-3">
              <div className="flex items-start gap-3">
                <div className="min-w-0 flex-1">
                  <div className="truncate text-sm font-medium">{group.name}</div>
                  <div className="mt-1 flex flex-wrap items-center gap-2">
                    <Select
                      value={selected.id}
                      onValueChange={(productId) => {
                        if (!productId) return;
                        setSelectedByGroup((current) => ({
                          ...current,
                          [group.key]: productId,
                        }));
                      }}
                    >
                      <SelectTrigger className="h-8 min-w-28">
                        <SelectValue>
                          {selected.size?.trim() || "Padrão"}
                        </SelectValue>
                      </SelectTrigger>
                      <SelectContent>
                        {group.variants.map((variant) => (
                          <SelectItem key={variant.id} value={variant.id}>
                            {variant.size?.trim() || "Padrão"}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <span className="font-mono text-sm font-semibold">
                      {formatCents(selected.priceCents)}
                    </span>
                  </div>
                </div>
                <button
                  type="button"
                  onClick={() => onSelect(selected)}
                  className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-foreground text-background"
                  aria-label={`Adicionar ${group.name}`}
                >
                  <Plus size={15} />
                </button>
              </div>
            </li>
          );
        })}
      </ul>
    </div>
  );
}
