import { RankedList } from "@/components/data/ranked-list";
import { Skeleton } from "@/components/ui/skeleton";
import { formatCents } from "@/lib/format";
import type { TopClient } from "@/types/dashboard";

type Props = {
  data?: TopClient[];
  isLoading?: boolean;
};

export function TopClientsSection({ data, isLoading }: Props) {
  if (isLoading) {
    return (
      <div className="rounded-xl border border-border bg-card p-4">
        <Skeleton className="mb-3 h-4 w-28" />
        {Array.from({ length: 5 }).map((_, i) => (
          <Skeleton key={i} className="mt-2 h-12" />
        ))}
      </div>
    );
  }

  return (
    <RankedList
      title="Melhores clientes"
      data={data ?? []}
      getValue={(c) => c.totalRevenueCents}
      renderItem={(c) => (
        <>
          <div className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-brand-soft text-[11px] font-semibold text-brand">
            {c.clientName[0]}
          </div>
          <div className="min-w-0 flex-1">
            <div className="truncate text-[13px] font-medium">{c.clientName}</div>
            <div className="font-mono text-[10.5px] text-muted-foreground">
              {c.orderCount} pedidos
            </div>
          </div>
          <div className="font-mono text-xs font-semibold">{formatCents(c.totalRevenueCents)}</div>
        </>
      )}
    />
  );
}
