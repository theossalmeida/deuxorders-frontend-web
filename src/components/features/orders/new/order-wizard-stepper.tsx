"use client";

import { cn } from "@/lib/utils";

const STEPS = ["Cliente", "Itens", "Entrega", "Revisão"] as const;
export type WizardStep = (typeof STEPS)[number];

export function OrderWizardStepper({ current }: { current: WizardStep }) {
  const idx = STEPS.indexOf(current);
  return (
    <div className="px-4 pt-3">
      <div className="flex gap-1.5">
        {STEPS.map((s, i) => (
          <div key={s} className={cn("h-1 flex-1 rounded-full", i <= idx ? "bg-brand" : "bg-border")} />
        ))}
      </div>
      <div className="mt-2.5 flex justify-between text-[10.5px] font-medium uppercase tracking-wider">
        {STEPS.map((s, i) => (
          <span
            key={s}
            className={cn(i === idx ? "font-semibold text-foreground" : "text-muted-foreground")}
          >
            {s}
          </span>
        ))}
      </div>
    </div>
  );
}
