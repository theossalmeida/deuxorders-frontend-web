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

  const pending = summary?.pendingOrders ?? 0;
  const completed = summary?.completedOrders ?? 0;
  const canceled = summary?.canceledOrders ?? 0;
  const inProgress = Math.max(0, (summary?.totalOrders ?? 0) - pending - completed - canceled);

  const data: { status: OrderStatus; count: number }[] = [
    { status: "Pending" as OrderStatus, count: pending },
    { status: "Received" as OrderStatus, count: inProgress },
    { status: "Completed" as OrderStatus, count: completed },
    { status: "Canceled" as OrderStatus, count: canceled },
  ].filter((r) => r.count > 0);

  return <PipelineList data={data} />;
}
