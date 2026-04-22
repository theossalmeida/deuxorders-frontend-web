"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod/v4";
import { PackagePlus, Loader2 } from "lucide-react";
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
import { useRestockMaterial } from "@/hooks/useInventory";
import { formatCents } from "@/lib/format";
import type { InventoryMaterial } from "@/types/inventory";
import { MEASURE_UNIT_SHORT } from "@/types/inventory";

const schema = z.object({
  quantity: z.number({ error: "Quantidade obrigatória" }).positive("Deve ser maior que 0"),
  totalCost: z.number({ error: "Custo obrigatório" }).positive("Deve ser maior que 0"),
});

type FormValues = z.infer<typeof schema>;


type Props = {
  material: InventoryMaterial;
};

export function RestockSheet({ material }: Props) {
  const [open, setOpen] = useState(false);
  const { mutateAsync, isPending } = useRestockMaterial(material.id);

  const {
    register,
    handleSubmit,
    watch,
    reset,
    formState: { errors },
  } = useForm<FormValues>({
    resolver: zodResolver(schema),
  });

  const qtyInput = watch("quantity") ?? 0;
  const costInput = watch("totalCost") ?? 0;

  const addedQty = Math.round(qtyInput);
  const addedCost = Math.round(costInput * 100);
  const currentQty = material.quantity;
  const currentUnitCost = material.unitCost;
  const newQty = currentQty + addedQty;
  const newUnitCost =
    newQty > 0
      ? (currentQty * currentUnitCost + addedCost) / newQty
      : addedQty > 0 ? addedCost / addedQty : 0;

  async function onSubmit(values: FormValues) {
    const rawCost = Math.round(values.totalCost * 100);
    await mutateAsync({ quantity: Math.round(values.quantity), totalCost: rawCost });
    reset();
    setOpen(false);
  }

  const unitLabel = MEASURE_UNIT_SHORT[material.measureUnit];

  return (
    <Sheet open={open} onOpenChange={setOpen}>
      <Button type="button" size="sm" className="gap-1.5" onClick={() => setOpen(true)}>
        <PackagePlus size={14} aria-hidden /> Repor estoque
      </Button>

      <SheetContent className="sm:max-w-md">
        <SheetHeader className="px-0 pt-2">
          <SheetTitle>Repor estoque</SheetTitle>
          <SheetDescription>{material.name}</SheetDescription>
        </SheetHeader>

        <form onSubmit={handleSubmit(onSubmit)} className="mt-6 space-y-4">
          <div className="space-y-1.5">
            <Label className="text-[11px] font-semibold uppercase tracking-wider text-muted-foreground">
              Quantidade ({unitLabel})
            </Label>
            <Input
              type="number"
              step="1"
              min="0"
              placeholder="0"
              {...register("quantity", { valueAsNumber: true })}
              className="font-mono"
            />
            {errors.quantity && <p className="text-xs text-destructive">{errors.quantity.message}</p>}
          </div>

          <div className="space-y-1.5">
            <Label className="text-[11px] font-semibold uppercase tracking-wider text-muted-foreground">Custo total (R$)</Label>
            <Input
              type="number"
              step="0.01"
              min="0"
              placeholder="0,00"
              {...register("totalCost", { valueAsNumber: true })}
              className="font-mono"
            />
            {errors.totalCost && <p className="text-xs text-destructive">{errors.totalCost.message}</p>}
          </div>

          {qtyInput > 0 && costInput > 0 && (
            <div className="rounded-lg border border-border bg-muted/40 p-3 text-xs">
              <div className="font-semibold text-muted-foreground mb-1.5">Prévia</div>
              <div className="space-y-1 text-muted-foreground">
                <div className="flex justify-between">
                  <span>Custo unit. estimado</span>
                  <span className="font-mono font-medium text-foreground">
                    {formatCents(Math.round(newUnitCost))} / {unitLabel}
                  </span>
                </div>
              </div>
            </div>
          )}

          <Button type="submit" className="w-full" disabled={isPending}>
            {isPending ? <Loader2 size={14} className="animate-spin" /> : "Salvar reposição"}
          </Button>
        </form>
      </SheetContent>
    </Sheet>
  );
}
