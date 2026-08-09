"use client";

import { cn } from "@/lib/utils";
import { CRM_TIER_META, type CrmTier } from "@/lib/crm";

const FILTERS: { value: CrmTier | "all"; label: string }[] = [
  { value: "all", label: "Todos" },
  { value: "green", label: CRM_TIER_META.green.label },
  { value: "yellow", label: CRM_TIER_META.yellow.label },
  { value: "orange", label: CRM_TIER_META.orange.label },
  { value: "red", label: CRM_TIER_META.red.label },
];

type Props = {
  value: CrmTier | "all";
  onChange: (v: CrmTier | "all") => void;
};

export function CrmFilterTabs({ value, onChange }: Props) {
  return (
    <div className="flex gap-1.5 overflow-x-auto pb-1">
      {FILTERS.map((f) => (
        <button
          key={f.value}
          type="button"
          onClick={() => onChange(f.value)}
          className={cn(
            "shrink-0 whitespace-nowrap rounded-lg px-3 py-1.5 text-xs font-medium transition-colors",
            value === f.value
              ? "bg-foreground text-background"
              : "border border-border bg-card text-foreground-soft hover:bg-accent",
          )}
        >
          {f.label}
        </button>
      ))}
    </div>
  );
}
