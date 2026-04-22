"use client";

import { useState } from "react";
import { BookOpen, Plus, Pencil } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { RecipeEditorSheet } from "@/components/features/products/recipe-editor-sheet";
import { useProductRecipe } from "@/hooks/useProducts";
import { formatQuantity } from "@/lib/format";
import type { Product } from "@/types/products";

type Props = {
  product: Product;
};

export function ProductRecipeCard({ product }: Props) {
  const [editorOpen, setEditorOpen] = useState(false);
  const { data: recipe, isLoading } = useProductRecipe(product.id);

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
              <Pencil size={12} /> Editar
            </Button>
          ) : null}
        </div>

        {isLoading ? (
          <div className="space-y-2">
            <Skeleton className="h-8 rounded-lg" />
            <Skeleton className="h-8 rounded-lg" />
          </div>
        ) : recipe?.hasRecipe ? (
          <div className="overflow-hidden rounded-lg border border-border">
            <div className="grid grid-cols-[1fr_auto] border-b border-border bg-muted/40 px-3 py-1.5 text-[9px] font-semibold uppercase tracking-wider text-muted-foreground">
              <div>Material</div>
              <div>Por unidade</div>
            </div>
            <ul className="divide-y divide-border">
              {recipe.items.map((item) => (
                <li key={item.materialId} className="grid grid-cols-[1fr_auto] items-center px-3 py-2 text-xs">
                  <div className="font-medium">{item.materialName}</div>
                  <div className="font-mono text-muted-foreground">{formatQuantity(item.quantity, item.measureUnit)}</div>
                </li>
              ))}
            </ul>
          </div>
        ) : (
          <div className="flex flex-col items-center justify-center rounded-lg border border-dashed border-border py-6 text-center">
            <BookOpen size={20} className="mb-2 text-muted-foreground" />
            <p className="text-xs text-muted-foreground">Este produto não possui receita.</p>
            <Button type="button" variant="outline" size="sm" className="mt-3 gap-1.5" onClick={() => setEditorOpen(true)}>
              <Plus size={12} /> Adicionar receita
            </Button>
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
    </>
  );
}
