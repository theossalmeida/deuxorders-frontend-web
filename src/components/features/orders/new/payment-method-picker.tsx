"use client";

import { Banknote, CreditCard, Zap } from "lucide-react";
import { cn } from "@/lib/utils";

export type PaymentMethod = "pix" | "cartao" | "dinheiro";

const OPTIONS = [
  { k: "pix", label: "Pix", Icon: Zap },
  { k: "cartao", label: "Cartão", Icon: CreditCard },
  { k: "dinheiro", label: "Dinheiro", Icon: Banknote },
] as const;

export function PaymentMethodPicker({
  value,
  onChange,
}: {
  value: PaymentMethod;
  onChange: (v: PaymentMethod) => void;
}) {
  return (
    <div className="space-y-2">
      {OPTIONS.map(({ k, label, Icon }) => {
        const active = value === k;
        return (
          <label
            key={k}
            className={cn(
              "flex cursor-pointer items-center gap-3 rounded-lg border px-3.5 py-3 transition",
              active ? "border-brand bg-brand-soft" : "border-border bg-card hover:bg-muted",
            )}
          >
            <input
              type="radio"
              name="payment"
              value={k}
              checked={active}
              onChange={() => onChange(k)}
              className="sr-only"
            />
            <Icon
              size={18}
              strokeWidth={1.6}
              className={active ? "text-brand" : "text-muted-foreground"}
            />
            <span className={cn("text-sm font-medium", active && "text-brand")}>{label}</span>
          </label>
        );
      })}
    </div>
  );
}
