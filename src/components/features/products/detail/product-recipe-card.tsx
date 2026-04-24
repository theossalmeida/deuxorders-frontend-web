"use client";

import { useMemo, useState } from "react";
import { BookOpen, Plus, Pencil } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { RecipeEditorSheet } from "@/components/features/products/recipe-editor-sheet";
import {
  useProductRecipe,
  useProductRecipeOptions,
  useSetProductRecipeOption,
} from "@/hooks/useProducts";
import { formatQuantity } from "@/lib/format";
import {
  BRIGADEIRO_FLAVORS,
  CAKE_DOUGHS,
  CAKE_FILLINGS,
  COOKIE_FLAVORS,
  getRecipeKind,
} from "@/lib/recipe-options";
import type { ProductRecipeOptionType, RecipeItem } from "@/types/inventory";
import type { Product } from "@/types/products";

type Props = {
  product: Product;
};

type RecipeOptionGroup = {
  label: string;
  type: ProductRecipeOptionType;
  names: readonly string[];
};

type ActiveOption = {
  type: ProductRecipeOptionType;
  name: string;
  groupLabel: string;
  items: RecipeItem[];
};

export function ProductRecipeCard({ product }: Props) {
  const [editorOpen, setEditorOpen] = useState(false);
  const [activeOption, setActiveOption] = useState<ActiveOption | null>(null);
  const { data: recipe, isLoading } = useProductRecipe(product.id);
  const { data: recipeOptions, isLoading: optionsLoading } = useProductRecipeOptions(product.id);
  const setRecipeOption = useSetProductRecipeOption(product.id);

  const optionGroups = useMemo(() => buildRecipeOptionGroups(product), [product]);

  function findOption(type: ProductRecipeOptionType, name: string) {
    return recipeOptions?.options.find((option) => option.type === type && option.name === name);
  }

  function openOptionEditor(group: RecipeOptionGroup, name: string) {
    const option = findOption(group.type, name);
    setActiveOption({
      type: group.type,
      name,
      groupLabel: group.label,
      items: option?.items ?? [],
    });
  }

  return (
    <>
      <div className="rounded-xl border border-border bg-card p-4">
        <div className="mb-3 flex items-center justify-between">
          <div>
            <div className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">Receita</div>
            <div className="mt-0.5 text-[11px] text-muted-foreground">Ingredientes usados na produção</div>
          </div>
          {recipe?.hasRecipe ? (
            <Button type="button" variant="outline" size="sm" className="gap-1.5" onClick={() => setEditorOpen(true)}>
              <Pencil size={12} /> Editar padrão
            </Button>
          ) : null}
        </div>

        {isLoading ? (
          <div className="space-y-2">
            <Skeleton className="h-8 rounded-lg" />
            <Skeleton className="h-8 rounded-lg" />
          </div>
        ) : recipe?.hasRecipe ? (
          <RecipeItemsList items={recipe.items} />
        ) : (
          <div className="flex flex-col items-center justify-center rounded-lg border border-dashed border-border py-6 text-center">
            <BookOpen size={20} className="mb-2 text-muted-foreground" />
            <p className="text-xs text-muted-foreground">Este produto não possui receita padrão.</p>
            <Button type="button" variant="outline" size="sm" className="mt-3 gap-1.5" onClick={() => setEditorOpen(true)}>
              <Plus size={12} /> Adicionar padrão
            </Button>
          </div>
        )}

        {optionGroups.length > 0 && (
          <div className="mt-4 border-t border-border pt-4">
            <div className="mb-3">
              <div className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">Receitas por opção</div>
              <div className="mt-0.5 text-[11px] text-muted-foreground">Massa, recheios e sabores usados no pedido</div>
            </div>

            {optionsLoading ? (
              <div className="space-y-2">
                <Skeleton className="h-8 rounded-lg" />
                <Skeleton className="h-8 rounded-lg" />
              </div>
            ) : (
              <div className="space-y-3">
                {optionGroups.map((group) => (
                  <div key={`${group.type}-${group.label}`} className="space-y-1.5">
                    <div className="text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">
                      {group.label}
                    </div>
                    <div className="space-y-1.5">
                      {group.names.map((name) => {
                        const option = findOption(group.type, name);
                        const count = option?.items.length ?? 0;

                        return (
                          <button
                            key={`${group.type}-${name}`}
                            type="button"
                            onClick={() => openOptionEditor(group, name)}
                            className="flex w-full items-center justify-between rounded-lg border border-border px-3 py-2 text-left transition hover:bg-accent"
                          >
                            <span className="text-sm font-medium">{name}</span>
                            <span className="flex items-center gap-2 text-[11px] text-muted-foreground">
                              {count > 0 ? `${count} ingrediente${count !== 1 ? "s" : ""}` : "Sem receita"}
                              {count > 0 ? <Pencil size={12} /> : <Plus size={12} />}
                            </span>
                          </button>
                        );
                      })}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}
      </div>

      <RecipeEditorSheet
        productId={product.id}
        productName={product.name}
        currentItems={recipe?.items ?? []}
        open={editorOpen}
        onOpenChange={setEditorOpen}
      />

      {activeOption && (
        <RecipeEditorSheet
          productId={product.id}
          productName={product.name}
          currentItems={activeOption.items}
          open={!!activeOption}
          onOpenChange={(open) => {
            if (!open) setActiveOption(null);
          }}
          title={`Receita — ${activeOption.name}`}
          description={`${activeOption.groupLabel} de ${product.name}.`}
          isSaving={setRecipeOption.isPending}
          onSaveRecipe={async (input) => {
            await setRecipeOption.mutateAsync({
              type: activeOption.type,
              name: activeOption.name,
              items: input.items,
            });
          }}
        />
      )}
    </>
  );
}

function RecipeItemsList({ items }: { items: RecipeItem[] }) {
  return (
    <div className="overflow-hidden rounded-lg border border-border">
      <div className="grid grid-cols-[1fr_auto] border-b border-border bg-muted/40 px-3 py-1.5 text-[9px] font-semibold uppercase tracking-wider text-muted-foreground">
        <div>Material</div>
        <div>Por unidade</div>
      </div>
      <ul className="divide-y divide-border">
        {items.map((item) => (
          <li key={item.materialId} className="grid grid-cols-[1fr_auto] items-center px-3 py-2 text-xs">
            <div className="font-medium">{item.materialName}</div>
            <div className="font-mono text-muted-foreground">{formatQuantity(item.quantity, item.measureUnit)}</div>
          </li>
        ))}
      </ul>
    </div>
  );
}

function buildRecipeOptionGroups(product: Product): RecipeOptionGroup[] {
  const kind = getRecipeKind(product);

  if (kind === "cake") {
    return [
      { label: "Massas", type: "Dough", names: CAKE_DOUGHS },
      { label: "Recheios", type: "Filling", names: CAKE_FILLINGS },
    ];
  }

  if (kind === "brigadeiro") {
    return [{ label: "Sabores", type: "Flavor", names: BRIGADEIRO_FLAVORS }];
  }

  if (kind === "cookie") {
    return [{ label: "Sabores", type: "Flavor", names: COOKIE_FLAVORS }];
  }

  return [];
}
