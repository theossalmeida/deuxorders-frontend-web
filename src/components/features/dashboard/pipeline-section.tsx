import { PipelineList } from "@/components/data/pipeline-list";
import { Skeleton } from "@/components/ui/skeleton";
import type { DashboardSummary } from "@/types/dashboard";
import type { OrderStatus } from "@/types/orders";

type Props = {
  summary?: DashboardSummary;
  isLoading?: boolean;
};

export function PipelineSection({ summary, isLoading }: Props) {
  if (isLoading) {
    return <Skeleton className="h-[240px] rounded-xl" />;
  }

  const data: { status: OrderStatus; count: number }[] = [
    { status: "Received" as OrderStatus, count: summary?.pendingOrders ?? 0 },
    { status: "Completed" as OrderStatus, count: summary?.completedOrders ?? 0 },
    { status: "Canceled" as OrderStatus, count: summary?.canceledOrders ?? 0 },
  ].filter((r) => r.count > 0);

  return <PipelineList data={data} />;
}
