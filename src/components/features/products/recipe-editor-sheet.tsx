"use client";

import { useState } from "react";
import { Plus, X, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useInventoryDropdown } from "@/hooks/useInventory";
import { useSetProductRecipe } from "@/hooks/useProducts";
import { MEASURE_UNIT_SHORT, type RecipeItem, type SetRecipeInput } from "@/types/inventory";

type DraftItem = {
  materialId: string;
  quantity: string;
};

type Props = {
  productId: string;
  productName: string;
  currentItems: RecipeItem[];
  open: boolean;
  onOpenChange: (v: boolean) => void;
  title?: string;
  description?: string;
  isSaving?: boolean;
  onSaveRecipe?: (input: SetRecipeInput) => Promise<void>;
};

export function RecipeEditorSheet({
  productId,
  productName,
  currentItems,
  open,
  onOpenChange,
  title,
  description,
  isSaving,
  onSaveRecipe,
}: Props) {
  const { data: dropdown = [] } = useInventoryDropdown();
  const { mutateAsync, isPending } = useSetProductRecipe(productId);
  const pending = isSaving ?? isPending;

  const [items, setItems] = useState<DraftItem[]>([]);

  function handleOpenChange(v: boolean) {
    if (v) {
      setItems(
        currentItems.map((i) => ({
          materialId: i.materialId,
          quantity: String(i.quantity),
        })),
      );
    }
    onOpenChange(v);
  }

  function addItem() {
    setItems((prev) => [...prev, { materialId: "", quantity: "" }]);
  }

  function removeItem(index: number) {
    setItems((prev) => prev.filter((_, i) => i !== index));
  }

  function updateItem(index: number, field: keyof DraftItem, value: string) {
    setItems((prev) => prev.map((item, i) => (i === index ? { ...item, [field]: value } : item)));
  }

  const usedIds = new Set(items.map((i) => i.materialId).filter(Boolean));

  function validate(): string | null {
    const seen = new Set<string>();
    for (const item of items) {
      if (!item.materialId) return "Selecione um material para cada ingrediente.";
      if (!item.quantity || parseFloat(item.quantity) <= 0) return "Quantidade deve ser maior que 0.";
      if (seen.has(item.materialId)) return "Materiais duplicados na receita.";
      seen.add(item.materialId);
    }
    return null;
  }

  async function handleSave() {
    const error = validate();
    if (error) { alert(error); return; }

    const wireItems = items.map((item) => ({
      materialId: item.materialId,
      quantity: Math.round(parseFloat(item.quantity)),
    }));

    await (onSaveRecipe ?? mutateAsync)({ items: wireItems });
    handleOpenChange(false);
  }

  async function handleClear() {
    if (!confirm("Limpar a receita deste produto?")) return;
    await (onSaveRecipe ?? mutateAsync)({ items: [] });
    handleOpenChange(false);
  }

  return (
    <Sheet open={open} onOpenChange={handleOpenChange}>
      <SheetContent className="sm:max-w-lg flex flex-col gap-0 p-0">
        <SheetHeader className="px-6 pt-6 pb-4 border-b border-border">
          <SheetTitle>{title ?? `Receita — ${productName}`}</SheetTitle>
          <SheetDescription>{description ?? "Ingredientes usados na produção de uma unidade."}</SheetDescription>
        </SheetHeader>

        <div className="flex-1 overflow-y-auto px-6 py-4 space-y-3">
          {items.length === 0 ? (
            <div className="flex flex-col items-center justify-center rounded-xl border border-dashed border-border py-10 text-center">
              <p className="text-sm text-muted-foreground">Nenhum ingrediente adicionado.</p>
            </div>
          ) : (
            items.map((item, index) => {
              const mat = dropdown.find((d) => d.id === item.materialId);
              const unitLabel = mat ? MEASURE_UNIT_SHORT[mat.measureUnit] : "";
              return (
                <div key={index} className="grid grid-cols-[1fr_130px_36px] items-end gap-2">
                  <div className="space-y-1">
                    {index === 0 && (
                      <Label className="text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">Material</Label>
                    )}
                    <Select
                      value={item.materialId}
                      onValueChange={(v) => v !== null && updateItem(index, "materialId", v)}
                    >
                      <SelectTrigger className="h-9">
                        <SelectValue placeholder="Selecionar...">
                          {() => mat?.name ?? "Selecionar..."}
                        </SelectValue>
                      </SelectTrigger>
                      <SelectContent>
                        {dropdown.map((d) => (
                          <SelectItem
                            key={d.id}
                            value={d.id}
                            disabled={usedIds.has(d.id) && d.id !== item.materialId}
                          >
                            {d.name} ({MEASURE_UNIT_SHORT[d.measureUnit]})
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-1">
                    {index === 0 && (
                      <Label className="text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">
                        Qtd {unitLabel ? `(${unitLabel})` : ""}
                      </Label>
                    )}
                    <Input
                      type="number"
                      step="1"
                      min="0"
                      value={item.quantity}
                      onChange={(e) => updateItem(index, "quantity", e.target.value)}
                      className="h-9 font-mono"
                    />
                  </div>
                  <Button
                    type="button"
                    variant="ghost"
                    size="icon"
                    className="h-9 w-9 text-muted-foreground hover:text-destructive"
                    onClick={() => removeItem(index)}
                  >
                    <X size={14} />
                  </Button>
                </div>
              );
            })
          )}
          <Button type="button" variant="outline" size="sm" className="gap-1.5 w-full" onClick={addItem}>
            <Plus size={14} /> Adicionar ingrediente
          </Button>
        </div>

        <div className="border-t border-border px-6 py-4 flex gap-2">
          {currentItems.length > 0 && (
            <Button type="button" variant="outline" size="sm" className="text-destructive hover:text-destructive gap-1.5" onClick={handleClear} disabled={pending}>
              Limpar receita
            </Button>
          )}
          <div className="flex-1" />
          <Button type="button" variant="outline" size="sm" onClick={() => onOpenChange(false)}>Cancelar</Button>
          <Button type="button" size="sm" onClick={handleSave} disabled={pending}>
            {pending ? <Loader2 size={14} className="animate-spin" /> : "Salvar"}
          </Button>
        </div>
      </SheetContent>
    </Sheet>
  );
}
