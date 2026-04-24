import { cn } from "@/lib/utils";

type Props<T> = {
  title: string;
  data: T[];
  getValue: (item: T, index: number) => number;
  renderItem: (item: T, index: number) => React.ReactNode;
  className?: string;
};

export function RankedList<T>({
  title,
  data,
  renderItem,
  className,
}: Props<T>) {
  return (
    <div className={cn("rounded-xl border border-border bg-card p-4", className)}>
      <div className="text-xs font-semibold">{title}</div>
      <ul className="mt-3 divide-y divide-border">
        {data.map((item, i) => (
          <li key={i} className="flex items-center gap-3 py-2">
            <span className="w-6 font-mono text-[11px] text-muted-foreground">
              {String(i + 1).padStart(2, "0")}
            </span>
            {renderItem(item, i)}
          </li>
        ))}
      </ul>
    </div>
  );
}
