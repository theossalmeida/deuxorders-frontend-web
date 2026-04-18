import { ArrowDown, ArrowUp } from "lucide-react";
import { formatBRL } from "@/lib/format";

type Props = {
  netCents?: number;
  inflowCents?: number;
  outflowCents?: number;
  entriesCount?: number;
  periodLabel?: string;
};

export function CashHeroBalance({
  netCents = 0,
  inflowCents = 0,
  outflowCents = 0,
  entriesCount,
  periodLabel = "este mês",
}: Props) {
  return (
    <div
      className="relative overflow-hidden rounded-2xl p-5 text-white"
      style={{ background: "linear-gradient(135deg, var(--brand) 0%, var(--brand-2) 100%)" }}
    >
      <div className="relative z-10">
        <div className="text-xs font-medium opacity-75">Saldo líquido · {periodLabel}</div>
        <div className="mt-1 font-mono text-[36px] font-semibold leading-none tracking-tight md:text-[44px]">
          {formatBRL(netCents / 100)}
        </div>

        <div className="mt-5 grid grid-cols-2 gap-2.5 md:grid-cols-3">
          <div className="rounded-lg bg-white/10 px-3 py-2.5 backdrop-blur-sm">
            <div className="flex items-center gap-1 text-[9.5px] font-semibold uppercase tracking-wider opacity-75">
              <ArrowDown size={11} /> Entradas
            </div>
            <div className="mt-1 font-mono text-sm font-semibold md:text-base">
              {formatBRL(inflowCents / 100)}
            </div>
          </div>
          <div className="rounded-lg bg-white/10 px-3 py-2.5 backdrop-blur-sm">
            <div className="flex items-center gap-1 text-[9.5px] font-semibold uppercase tracking-wider opacity-75">
              <ArrowUp size={11} /> Saídas
            </div>
            <div className="mt-1 font-mono text-sm font-semibold md:text-base">
              {formatBRL(outflowCents / 100)}
            </div>
          </div>
          {entriesCount !== undefined && (
            <div className="rounded-lg bg-white/10 px-3 py-2.5 backdrop-blur-sm">
              <div className="text-[9.5px] font-semibold uppercase tracking-wider opacity-75">
                Lançamentos
              </div>
              <div className="mt-1 font-mono text-sm font-semibold md:text-base">{entriesCount}</div>
            </div>
          )}
        </div>
      </div>

      <div className="absolute -right-16 -top-16 h-48 w-48 rounded-full border border-white/10" />
      <div className="absolute -right-8 -bottom-12 h-36 w-36 rounded-full border border-white/10" />
    </div>
  );
}
