"use client";

import { Search } from "lucide-react";
import { Input } from "@/components/ui/input";
import { cn } from "@/lib/utils";

type Props = {
  search: string;
  onSearchChange: (v: string) => void;
  showInactive: boolean;
  onShowInactiveChange: (v: boolean) => void;
};

export function ClientsToolbar({ search, onSearchChange, showInactive, onShowInactiveChange }: Props) {
  return (
    <div className="flex items-center gap-2">
      <div className="relative flex-1">
        <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
        <Input
          value={search}
          onChange={(e) => onSearchChange(e.target.value)}
          placeholder="Buscar por nome ou telefone"
          className="h-9 bg-card pl-9"
        />
      </div>
      <button
        type="button"
        onClick={() => onShowInactiveChange(!showInactive)}
        className={cn(
          "whitespace-nowrap rounded-lg px-3 py-1.5 text-xs font-medium transition-colors",
          showInactive
            ? "bg-foreground text-background"
            : "border border-border bg-card text-foreground-soft hover:bg-accent",
        )}
      >
        {showInactive ? "Ocultar inativos" : "Mostrar inativos"}
      </button>
    </div>
  );
}
