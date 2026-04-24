"use client";

import { useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { Tag, Calendar, Link2 } from "lucide-react";
import { cn } from "@/lib/utils";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { useCreateCashEntry } from "@/hooks/useCashFlow";
import { localISODate } from "@/lib/format";
import {
  CASH_CATEGORY_LABEL,
  type CashFlowType,
  type CashFlowCategory,
} from "@/types/cash";

const CATEGORIES = Object.entries(CASH_CATEGORY_LABEL) as [CashFlowCategory, string][];

export default function NewCashEntryPage() {
  const router = useRouter();
  const params = useSearchParams();
  const orderId = params.get("orderId");

  const [type, setType] = useState<CashFlowType>("Inflow");
  const [amountStr, setAmountStr] = useState("0,00");
  const [counterparty, setCounterparty] = useState("");
  const [category, setCategory] = useState<CashFlowCategory>("Other");
  const [date, setDate] = useState(() => localISODate(new Date()));
  const [notes, setNotes] = useState("");

  const createEntry = useCreateCashEntry();

  function parseAmount() {
    return Math.round(parseFloat(amountStr.replace(/\./g, "").replace(",", ".")) * 100) || 0;
  }

  function handleAmountChange(v: string) {
    const digits = v.replace(/[^0-9]/g, "");
    const num = parseInt(digits || "0", 10);
    const formatted = (num / 100).toLocaleString("pt-BR", {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    });
    setAmountStr(formatted);
  }

  function handleSave() {
    const amountCents = parseAmount();
    if (!amountCents || !counterparty) return;
    createEntry.mutate({
      billingDate: date,
      type,
      category,
      counterparty,
      amountCents,
      notes: notes || undefined,
    });
  }

  const isInflow = type === "Inflow";
  const valueColor = isInflow ? "text-ok" : "text-destructive";

  return (
    <>
      {/* Mobile top bar */}
      <div className="sticky top-0 z-20 flex items-center justify-between bg-background px-4 pt-14 pb-3 md:hidden">
        <button
          type="button"
          onClick={() => router.back()}
          className="text-sm font-medium text-muted-foreground"
        >
          Cancelar
        </button>
        <span className="text-sm font-semibold">Novo lançamento</span>
        <button
          type="button"
          onClick={handleSave}
          disabled={createEntry.isPending}
          className="text-sm font-semibold text-brand disabled:opacity-50"
        >
          Salvar
        </button>
      </div>

      <div className="space-y-4 px-4 pt-4 pb-28 md:mx-auto md:max-w-lg md:pt-8">
        {/* Type toggle */}
        <div className="flex gap-0.5 rounded-xl bg-muted p-1">
          {(["Inflow", "Outflow"] as CashFlowType[]).map((t) => (
            <button
              key={t}
              type="button"
              onClick={() => setType(t)}
              className={cn(
                "flex flex-1 items-center justify-center gap-1.5 rounded-lg py-2.5 text-sm font-semibold transition-colors",
                type === t
                  ? t === "Inflow"
                    ? "bg-card text-ok shadow-sm"
                    : "bg-card text-destructive shadow-sm"
                  : "text-muted-foreground",
              )}
            >
              {t === "Inflow" ? "↓ Entrada" : "↑ Saída"}
            </button>
          ))}
        </div>

        {/* Big value input */}
        <div className="flex flex-col items-center rounded-xl border border-border bg-card py-6">
          <div className="mb-2 text-[10.5px] font-semibold uppercase tracking-widest text-muted-foreground">
            Valor
          </div>
          <div className="flex items-baseline gap-1.5">
            <span className="text-[22px] font-semibold text-muted-foreground">R$</span>
            <input
              type="text"
              inputMode="numeric"
              value={amountStr}
              onChange={(e) => handleAmountChange(e.target.value)}
              className={cn(
                "w-48 bg-transparent text-center font-mono text-[52px] font-semibold leading-none tracking-tight outline-none",
                valueColor,
              )}
            />
          </div>
        </div>

        {/* Linked order badge */}
        {orderId && (
          <div className="flex items-center gap-2.5 rounded-lg border border-brand/30 bg-brand-soft px-3.5 py-2.5">
            <Link2 size={14} className="text-brand" />
            <span className="text-sm text-foreground">
              Vinculado ao pedido{" "}
              <span className="font-mono font-semibold text-brand">{orderId}</span>
            </span>
          </div>
        )}

        {/* Fields */}
        <div className="space-y-3 rounded-xl border border-border bg-card p-4">
          <div className="space-y-1.5">
            <Label className="text-[11px] font-semibold uppercase tracking-wider text-muted-foreground">
              Descrição
            </Label>
            <Input
              value={counterparty}
              onChange={(e) => setCounterparty(e.target.value)}
              placeholder="Ex: Fornecedor Ingredientes"
            />
          </div>

          <div className="space-y-1.5">
            <Label className="flex items-center gap-1.5 text-[11px] font-semibold uppercase tracking-wider text-muted-foreground">
              <Tag size={12} /> Categoria
            </Label>
            <Select value={category} onValueChange={(v) => setCategory(v as CashFlowCategory)}>
              <SelectTrigger>
                <SelectValue>{CASH_CATEGORY_LABEL[category]}</SelectValue>
              </SelectTrigger>
              <SelectContent>
                {CATEGORIES.map(([k, label]) => (
                  <SelectItem key={k} value={k}>
                    {label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-1.5">
            <Label className="flex items-center gap-1.5 text-[11px] font-semibold uppercase tracking-wider text-muted-foreground">
              <Calendar size={12} /> Data
            </Label>
            <Input
              type="date"
              value={date}
              onChange={(e) => setDate(e.target.value)}
              className="font-mono"
            />
          </div>

          <div className="space-y-1.5">
            <Label className="text-[11px] font-semibold uppercase tracking-wider text-muted-foreground">
              Observações
            </Label>
            <Textarea
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="Notas adicionais (opcional)"
              rows={2}
            />
          </div>
        </div>
      </div>

      {/* Footer */}
      <div className="fixed bottom-0 left-0 right-0 z-30 border-t border-border bg-background/90 px-4 py-3 backdrop-blur-sm md:hidden">
        <Button
          className="w-full"
          disabled={!counterparty || parseAmount() === 0 || createEntry.isPending}
          onClick={handleSave}
        >
          {createEntry.isPending ? "Salvando..." : "Criar lançamento"}
        </Button>
      </div>
    </>
  );
}
