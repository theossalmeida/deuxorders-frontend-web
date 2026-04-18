import { KpiCard } from "@/components/data/kpi-card";
import { Skeleton } from "@/components/ui/skeleton";
import { formatBRL } from "@/lib/format";
import type { DashboardSummary } from "@/types/dashboard";

type Props = {
  data?: DashboardSummary;
  isLoading?: boolean;
};

export function DashboardKpis({ data, isLoading }: Props) {
  if (isLoading) {
    return (
      <div className="grid grid-cols-2 gap-2 md:grid-cols-4 md:gap-3">
        {Array.from({ length: 4 }).map((_, i) => (
          <Skeleton key={i} className="h-24 rounded-xl" />
        ))}
      </div>
    );
  }

  return (
    <div className="grid grid-cols-2 gap-2 md:grid-cols-4 md:gap-3">
      <KpiCard
        label="Receita"
        value={formatBRL((data?.totalRevenueCents ?? 0) / 100, { compact: true })}
      />
      <KpiCard
        label="Pedidos"
        value={String(data?.totalOrders ?? 0)}
      />
      <KpiCard
        label="Aguardando entrega"
        value={String(data?.pendingOrders ?? 0)}
        footnote="próximos 3 dias"
      />
      <KpiCard
        label="Ticket médio"
        value={formatBRL((data?.averageRevenuePerOrderCents ?? 0) / 100, { compact: true })}
      />
    </div>
  );
}
