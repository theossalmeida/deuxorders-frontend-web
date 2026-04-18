"use client";

import { Package, Truck } from "lucide-react";
import { cn } from "@/lib/utils";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";

export type DeliveryMode = "entrega" | "retirada";

export function DeliverySection({
  mode,
  onModeChange,
  address,
  onAddressChange,
  date,
  onDateChange,
}: {
  mode: DeliveryMode;
  onModeChange: (m: DeliveryMode) => void;
  address: string;
  onAddressChange: (v: string) => void;
  date: string;
  onDateChange: (v: string) => void;
}) {
  return (
    <div className="space-y-4">
      <div className="grid grid-cols-2 gap-2">
        {(
          [
            { k: "entrega", label: "Entrega", Icon: Truck },
            { k: "retirada", label: "Retirada", Icon: Package },
          ] as const
        ).map(({ k, label, Icon }) => {
          const active = mode === k;
          return (
            <button
              key={k}
              type="button"
              onClick={() => onModeChange(k)}
              className={cn(
                "flex items-center gap-2.5 rounded-lg border px-3 py-3 text-sm font-medium transition",
                active
                  ? "border-brand bg-brand-soft text-brand"
                  : "border-border bg-card text-foreground hover:bg-muted",
              )}
            >
              <Icon size={16} strokeWidth={1.6} />
              {label}
            </button>
          );
        })}
      </div>

      {mode === "entrega" && (
        <div className="space-y-1.5">
          <Label
            htmlFor="addr"
            className="text-[11px] font-semibold uppercase tracking-wider text-muted-foreground"
          >
            Endereço de entrega
          </Label>
          <Textarea
            id="addr"
            value={address}
            onChange={(e) => onAddressChange(e.target.value)}
            placeholder="Rua, número, bairro"
            rows={2}
          />
        </div>
      )}

      <div className="space-y-1.5">
        <Label
          htmlFor="date"
          className="text-[11px] font-semibold uppercase tracking-wider text-muted-foreground"
        >
          Data e hora
        </Label>
        <Input
          id="date"
          type="datetime-local"
          value={date}
          onChange={(e) => onDateChange(e.target.value)}
          className="font-mono"
        />
      </div>
    </div>
  );
}
