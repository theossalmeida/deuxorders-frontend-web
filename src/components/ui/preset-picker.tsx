"use client";

import { cn } from "@/lib/utils";

export type PresetOption<T extends string> = { value: T; label: string };

export function PresetPicker<T extends string>({
  options,
  value,
  onChange,
  className,
}: {
  options: PresetOption<T>[];
  value: T;
  onChange: (next: T) => void;
  className?: string;
}) {
  return (
    <div
      className={cn(
        "inline-flex gap-1 bg-white rounded-xl p-1 shadow-sm border",
        className,
      )}
    >
      {options.map((o) => {
        const active = value === o.value;
        return (
          <button
            key={o.value}
            type="button"
            onClick={() => onChange(o.value)}
            className={cn(
              "rounded-lg px-3 py-1.5 text-xs font-semibold transition-colors duration-150",
              "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand focus-visible:ring-offset-1",
              active
                ? "bg-brand text-brand-foreground shadow-sm"
                : "text-muted-foreground hover:text-foreground",
            )}
          >
            {o.label}
          </button>
        );
      })}
    </div>
  );
}
