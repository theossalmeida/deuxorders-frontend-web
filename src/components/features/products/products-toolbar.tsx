"use client";

import { Search } from "lucide-react";
import { Input } from "@/components/ui/input";
import { cn } from "@/lib/utils";

type Props = {
  search: string;
  onSearchChange: (v: string) => void;
  category: string;
  onCategoryChange: (c: string) => void;
  categories: string[];
};

export function ProductsToolbar({ search, onSearchChange, category, onCategoryChange, categories }: Props) {
  return (
    <div className="space-y-2.5">
      <div className="relative">
        <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
        <Input
          value={search}
          onChange={(e) => onSearchChange(e.target.value)}
          placeholder="Buscar produto"
          className="h-9 bg-card pl-9"
        />
      </div>
      {categories.length > 0 && (
        <div className="flex gap-1.5 overflow-x-auto pb-1">
          <button
            type="button"
            onClick={() => onCategoryChange("all")}
            className={cn(
              "whitespace-nowrap rounded-lg px-3 py-1.5 text-xs font-medium transition-colors",
              category === "all"
                ? "bg-foreground text-background"
                : "border border-border bg-card text-foreground-soft hover:bg-accent",
            )}
          >
            Todos
          </button>
          {categories.map((c) => (
            <button
              key={c}
              type="button"
              onClick={() => onCategoryChange(c)}
              className={cn(
                "whitespace-nowrap rounded-lg px-3 py-1.5 text-xs font-medium transition-colors",
                category === c
                  ? "bg-foreground text-background"
                  : "border border-border bg-card text-foreground-soft hover:bg-accent",
              )}
            >
              {c}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
