"use client";

import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { CASH_TYPE_LABEL, CASH_CATEGORY_LABEL, type CashFlowType, type CashFlowCategory } from "@/types/cash";
import type { CreateCashFlowEntryInput } from "@/types/cash";

function parseAmountToCents(value: string): number {
  const normalized = value.replace(/\./g, "").replace(",", ".");
  const float = parseFloat(normalized);
  if (isNaN(float)) return 0;
  return Math.round(float * 100);
}

const schema = z.object({
  billingDate: z.string().min(1, "Data obrigatória"),
  type: z.enum(["Inflow", "Outflow"] as const),
  category: z.enum([
    "Order", "OrderReversal", "RawMaterial", "Supplier",
    "Salary", "Tax", "Utilities", "Equipment", "Marketing", "Other",
  ] as const),
  counterparty: z.string().trim().min(1, "Obrigatório").max(200, "Máx 200 caracteres"),
  amountInput: z.string().refine((s) => {
    const cents = parseAmountToCents(s);
    return cents > 0 && cents <= 99_999_999;
  }, "Valor inválido"),
  notes: z.string().max(2000).optional(),
});

type FormValues = z.infer<typeof schema>;

interface Props {
  defaultValues?: Partial<FormValues>;
  onSubmit: (input: CreateCashFlowEntryInput) => void;
  isPending: boolean;
  submitLabel?: string;
}

export function CashFlowEntryForm({ defaultValues, onSubmit, isPending, submitLabel = "Salvar" }: Props) {
  const { register, handleSubmit, setValue, formState: { errors } } = useForm<FormValues>({
    resolver: zodResolver(schema),
    defaultValues,
  });

  function handleValid(values: FormValues) {
    onSubmit({
      billingDate: values.billingDate,
      type: values.type as CashFlowType,
      category: values.category as CashFlowCategory,
      counterparty: values.counterparty,
      amountCents: parseAmountToCents(values.amountInput),
      notes: values.notes || undefined,
    });
  }

  return (
    <form onSubmit={handleSubmit(handleValid)} className="space-y-4">
      <div>
        <Label htmlFor="billingDate">Data</Label>
        <Input id="billingDate" type="date" {...register("billingDate")} />
        {errors.billingDate && <p className="text-xs text-red-500 mt-1">{errors.billingDate.message}</p>}
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div>
          <Label>Tipo</Label>
          <Select onValueChange={(v) => setValue("type", v as CashFlowType, { shouldValidate: true })} defaultValue={defaultValues?.type}>
            <SelectTrigger><SelectValue placeholder="Tipo" /></SelectTrigger>
            <SelectContent>
              {(Object.keys(CASH_TYPE_LABEL) as CashFlowType[]).map((t) => (
                <SelectItem key={t} value={t}>{CASH_TYPE_LABEL[t]}</SelectItem>
              ))}
            </SelectContent>
          </Select>
          {errors.type && <p className="text-xs text-red-500 mt-1">{errors.type.message}</p>}
        </div>

        <div>
          <Label>Categoria</Label>
          <Select onValueChange={(v) => setValue("category", v as CashFlowCategory, { shouldValidate: true })} defaultValue={defaultValues?.category}>
            <SelectTrigger><SelectValue placeholder="Categoria" /></SelectTrigger>
            <SelectContent>
              {(Object.keys(CASH_CATEGORY_LABEL) as CashFlowCategory[]).map((c) => (
                <SelectItem key={c} value={c}>{CASH_CATEGORY_LABEL[c]}</SelectItem>
              ))}
            </SelectContent>
          </Select>
          {errors.category && <p className="text-xs text-red-500 mt-1">{errors.category.message}</p>}
        </div>
      </div>

      <div>
        <Label htmlFor="counterparty">Contraparte</Label>
        <Input id="counterparty" {...register("counterparty")} placeholder="Nome do fornecedor, cliente..." />
        {errors.counterparty && <p className="text-xs text-red-500 mt-1">{errors.counterparty.message}</p>}
      </div>

      <div>
        <Label htmlFor="amountInput">Valor (R$)</Label>
        <Input id="amountInput" {...register("amountInput")} placeholder="100,50" />
        {errors.amountInput && <p className="text-xs text-red-500 mt-1">{errors.amountInput.message}</p>}
      </div>

      <div>
        <Label htmlFor="notes">Observações</Label>
        <Textarea id="notes" {...register("notes")} placeholder="Opcional..." rows={3} />
        {errors.notes && <p className="text-xs text-red-500 mt-1">{errors.notes.message}</p>}
      </div>

      <Button type="submit" disabled={isPending}>
        {isPending ? "Salvando..." : submitLabel}
      </Button>
    </form>
  );
}
