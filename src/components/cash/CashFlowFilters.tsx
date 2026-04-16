"use client";

import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import {
  CASH_TYPE_LABEL,
  CASH_CATEGORY_LABEL,
  CASH_SOURCE_LABEL,
  type CashFlowFilters,
  type CashFlowType,
  type CashFlowCategory,
  type CashFlowSource,
} from "@/types/cash";

interface Props {
  filters: CashFlowFilters;
  onChange: (f: CashFlowFilters) => void;
  isAdmin: boolean;
}

export function CashFlowFilters({ filters, onChange, isAdmin }: Props) {
  const set = (partial: Partial<CashFlowFilters>) =>
    onChange({ ...filters, ...partial, page: 1 });

  return (
    <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 p-4 bg-zinc-50 rounded-xl border">
      <div>
        <Label>De</Label>
        <Input type="date" value={filters.from ?? ""} onChange={(e) => set({ from: e.target.value || undefined })} />
      </div>
      <div>
        <Label>Até</Label>
        <Input type="date" value={filters.to ?? ""} onChange={(e) => set({ to: e.target.value || undefined })} />
      </div>

      <div>
        <Label>Tipo</Label>
        <Select value={filters.type ?? "all"} onValueChange={(v) => set({ type: v === "all" ? undefined : v as CashFlowType })}>
          <SelectTrigger><SelectValue /></SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Todos</SelectItem>
            {(Object.keys(CASH_TYPE_LABEL) as CashFlowType[]).map((t) => (
              <SelectItem key={t} value={t}>{CASH_TYPE_LABEL[t]}</SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      <div>
        <Label>Categoria</Label>
        <Select value={filters.category ?? "all"} onValueChange={(v) => set({ category: v === "all" ? undefined : v as CashFlowCategory })}>
          <SelectTrigger><SelectValue /></SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Todas</SelectItem>
            {(Object.keys(CASH_CATEGORY_LABEL) as CashFlowCategory[]).map((c) => (
              <SelectItem key={c} value={c}>{CASH_CATEGORY_LABEL[c]}</SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      <div>
        <Label>Origem</Label>
        <Select value={filters.source ?? "all"} onValueChange={(v) => set({ source: v === "all" ? undefined : v as CashFlowSource })}>
          <SelectTrigger><SelectValue /></SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Todas</SelectItem>
            {(Object.keys(CASH_SOURCE_LABEL) as CashFlowSource[]).map((s) => (
              <SelectItem key={s} value={s}>{CASH_SOURCE_LABEL[s]}</SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {isAdmin && (
        <div className="flex items-center gap-2 self-end pb-1">
          <Switch
            id="includeDeleted"
            checked={filters.includeDeleted ?? false}
            onCheckedChange={(v) => set({ includeDeleted: v })}
          />
          <Label htmlFor="includeDeleted">Mostrar excluídos</Label>
        </div>
      )}

      <div className="self-end">
        <Button variant="outline" size="sm" onClick={() => onChange({ page: 1, size: 50 })}>
          Limpar filtros
        </Button>
      </div>
    </div>
  );
}
