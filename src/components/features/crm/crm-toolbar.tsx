"use client";

import { Search } from "lucide-react";
import { Input } from "@/components/ui/input";

type Props = {
  search: string;
  onSearchChange: (v: string) => void;
};

export function CrmToolbar({ search, onSearchChange }: Props) {
  return (
    <div className="relative flex-1">
      <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
      <Input
        value={search}
        onChange={(e) => onSearchChange(e.target.value)}
        placeholder="Buscar por nome ou telefone"
        className="h-9 bg-card pl-9"
      />
    </div>
  );
}
