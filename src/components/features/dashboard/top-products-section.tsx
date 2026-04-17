import { RankedList } from "@/components/data/ranked-list";
import { Skeleton } from "@/components/ui/skeleton";
import { formatBRL } from "@/lib/format";
import type { TopProduct } from "@/types/dashboard";

type Props = {
  data?: TopProduct[];
  isLoading?: boolean;
};

export function TopProductsSection({ data, isLoading }: Props) {
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
      title="Mais vendidos"
      data={data ?? []}
      getValue={(p) => p.totalRevenue}
      renderItem={(p) => (
        <>
          <div className="min-w-0 flex-1">
            <div className="truncate text-[13px] font-medium">{p.productName}</div>
            <div className="mt-0.5 font-mono text-[10.5px] text-muted-foreground">
              {p.totalQuantitySold}×
            </div>
          </div>
          <div className="font-mono text-xs font-semibold">{formatBRL(p.totalRevenue)}</div>
        </>
      )}
    />
  );
}
