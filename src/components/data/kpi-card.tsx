import { cn } from "@/lib/utils";
import { formatPercentDelta } from "@/lib/format";

type Props = {
  label: string;
  value: string;
  delta?: number;
  footnote?: string;
  icon?: React.ReactNode;
  className?: string;
};

export function KpiCard({ label, value, delta, footnote, icon, className }: Props) {
  const isPositive = delta != null && delta >= 0;
  return (
    <div className={cn("rounded-xl border border-border bg-card p-4", className)}>
      <div className="flex items-center justify-between">
        <div className="text-[11px] font-medium text-muted-foreground">{label}</div>
        {icon ? <div className="text-muted-foreground">{icon}</div> : null}
      </div>
      <div className="mt-2 font-mono text-2xl font-semibold tracking-tight num-tabular">
        {value}
      </div>
      <div className="mt-2 flex items-center gap-1.5">
        {delta != null ? (
          <span
            className={cn(
              "rounded px-1.5 py-0.5 text-[10.5px] font-mono font-semibold",
              isPositive ? "bg-ok/10 text-ok" : "bg-destructive/10 text-destructive",
            )}
          >
            {formatPercentDelta(delta)}
          </span>
        ) : null}
        {footnote ? (
          <span className="text-[11px] text-muted-foreground">{footnote}</span>
        ) : null}
      </div>
    </div>
  );
}
