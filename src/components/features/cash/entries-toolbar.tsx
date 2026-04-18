"use client";

import { Search } from "lucide-react";
import { Input } from "@/components/ui/input";
import { cn } from "@/lib/utils";
import type { CashFlowType } from "@/types/cash";

type TypeFilter = CashFlowType | "all";

type Props = {
  search: string;
  onSearchChange: (v: string) => void;
  type: TypeFilter;
  onTypeChange: (t: TypeFilter) => void;
};

export function EntriesToolbar({ search, onSearchChange, type, onTypeChange }: Props) {
  const chips: { k: TypeFilter; label: string }[] = [
    { k: "all", label: "Todos" },
    { k: "Inflow", label: "Entradas" },
    { k: "Outflow", label: "Saídas" },
  ];

  return (
    <div className="space-y-2.5">
      <div className="flex items-center gap-2">
        <div className="relative flex-1">
          <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
          <Input
            value={search}
            onChange={(e) => onSearchChange(e.target.value)}
            placeholder="Buscar lançamento"
            className="h-9 bg-card pl-9"
          />
        </div>
      </div>
      <div className="flex gap-1.5 overflow-x-auto pb-1">
        {chips.map(({ k, label }) => (
          <button
            key={k}
            type="button"
            onClick={() => onTypeChange(k)}
            className={cn(
              "inline-flex whitespace-nowrap rounded-lg px-3 py-1.5 text-xs font-medium transition-colors",
              type === k
                ? "bg-foreground text-background"
                : "border border-border bg-card text-foreground-soft hover:bg-accent",
            )}
          >
            {label}
          </button>
        ))}
      </div>
    </div>
  );
}
