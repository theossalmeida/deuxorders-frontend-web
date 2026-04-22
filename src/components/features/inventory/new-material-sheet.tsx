"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod/v4";
import { Plus, Loader2 } from "lucide-react";
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
import { useCreateMaterial } from "@/hooks/useInventory";
import { MEASURE_UNIT_LABEL, MEASURE_UNIT_SHORT, type MeasureUnit } from "@/types/inventory";

const schema = z.object({
  name: z.string().min(1, "Nome obrigatório").max(200),
  measureUnit: z.enum(["G", "ML", "U"]),
  quantity: z.number({ error: "Quantidade obrigatória" }).int("Deve ser um número inteiro").positive("Quantidade deve ser maior que 0"),
  totalCost: z.number({ error: "Custo obrigatório" }).positive("Custo total deve ser maior que 0"),
});

type FormValues = z.infer<typeof schema>;

type Props = {
  compact?: boolean;
};

export function NewMaterialSheet({ compact = false }: Props) {
  const [open, setOpen] = useState(false);
  const { mutateAsync, isPending } = useCreateMaterial();

  const {
    register,
    handleSubmit,
    watch,
    setValue,
    reset,
    formState: { errors },
  } = useForm<FormValues>({
    resolver: zodResolver(schema),
    defaultValues: { measureUnit: "G" },
  });

  const measureUnit = watch("measureUnit");

  async function onSubmit(values: FormValues) {
    const rawCost = Math.round(values.totalCost * 100);
    await mutateAsync({ name: values.name, measureUnit: values.measureUnit, quantity: values.quantity, totalCost: rawCost });
    reset();
    setOpen(false);
  }

  return (
    <Sheet open={open} onOpenChange={setOpen}>
      <Button
        type="button"
        size={compact ? "icon" : "sm"}
        className={compact ? "h-9 w-9" : "gap-1.5"}
        onClick={() => setOpen(true)}
        aria-haspopup="dialog"
        aria-label="Novo material"
      >
        <Plus size={compact ? 16 : 14} aria-hidden />
        {compact ? null : "Novo material"}
      </Button>

      <SheetContent className="sm:max-w-md">
        <SheetHeader className="px-0 pt-2">
          <SheetTitle>Novo material</SheetTitle>
          <SheetDescription>Cadastre um insumo ou matéria-prima no estoque.</SheetDescription>
        </SheetHeader>

        <form onSubmit={handleSubmit(onSubmit)} className="mt-6 space-y-4">
          <div className="space-y-1.5">
            <Label className="text-[11px] font-semibold uppercase tracking-wider text-muted-foreground">Nome</Label>
            <Input {...register("name")} placeholder="Ex: Farinha de trigo" />
            {errors.name && <p className="text-xs text-destructive">{errors.name.message}</p>}
          </div>

          <div className="space-y-1.5">
            <Label className="text-[11px] font-semibold uppercase tracking-wider text-muted-foreground">Unidade de medida</Label>
            <Select
              value={measureUnit}
              onValueChange={(v) => v !== null && setValue("measureUnit", v as MeasureUnit)}
            >
              <SelectTrigger>
                <SelectValue placeholder="Selecione">
                  {() => MEASURE_UNIT_LABEL[measureUnit]}
                </SelectValue>
              </SelectTrigger>
              <SelectContent>
                {(Object.entries(MEASURE_UNIT_LABEL) as [MeasureUnit, string][]).map(([k, label]) => (
                  <SelectItem key={k} value={k}>{label}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-1.5">
            <Label className="text-[11px] font-semibold uppercase tracking-wider text-muted-foreground">
              Quantidade ({MEASURE_UNIT_SHORT[measureUnit]})
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

          <Button type="submit" className="w-full" disabled={isPending}>
            {isPending ? <Loader2 size={14} className="animate-spin" /> : "Criar material"}
          </Button>
        </form>
      </SheetContent>
    </Sheet>
  );
}
