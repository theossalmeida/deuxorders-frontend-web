import { cn } from "@/lib/utils";

type Variant = "orders" | "cash-card" | "products" | "clients" | "rows";

const SHAPES: Record<Variant, string> = {
  orders: "h-20 rounded-2xl bg-zinc-100 border-l-4 border-l-zinc-200",
  "cash-card": "h-24 rounded-2xl bg-zinc-100",
  products: "h-64 rounded-xl bg-zinc-100",
  clients: "h-[68px] rounded-xl bg-zinc-100",
  rows: "h-14 rounded-xl bg-zinc-100",
};

export function SkeletonList({
  variant,
  count = 6,
  className,
}: {
  variant: Variant;
  count?: number;
  className?: string;
}) {
  const isGrid = variant === "products";
  return (
    <div
      className={cn(
        "animate-pulse",
        isGrid
          ? "grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4"
          : "space-y-3",
        className,
      )}
    >
      {Array.from({ length: count }).map((_, i) => (
        <div key={i} className={SHAPES[variant]} />
      ))}
    </div>
  );
}
