import { formatBRL } from "@/lib/format";

export type CategorySlice = {
  name: string;
  value: number;
  color: string;
};

type Props = {
  data: CategorySlice[];
  title?: string;
};

export function CategoryBar({ data, title = "Saídas por categoria" }: Props) {
  const total = data.reduce((a, c) => a + c.value, 0);

  return (
    <div className="rounded-xl border border-border bg-card p-4">
      <div className="text-xs font-semibold">{title}</div>

      <div className="mt-3 flex h-3.5 overflow-hidden rounded-full bg-muted">
        {data.map((c) => (
          <div
            key={c.name}
            className="h-full"
            style={{
              backgroundColor: c.color,
              width: total > 0 ? `${(c.value / total) * 100}%` : "0%",
            }}
          />
        ))}
      </div>

      <ul className="mt-3.5 grid grid-cols-2 gap-x-4 gap-y-1.5">
        {data.map((c) => (
          <li key={c.name} className="flex items-center gap-1.5 text-[11.5px]">
            <span
              aria-hidden
              className="h-2 w-2 rounded-sm shrink-0"
              style={{ backgroundColor: c.color }}
            />
            <span className="flex-1 truncate">{c.name}</span>
            <span className="font-mono font-semibold">{formatBRL(c.value)}</span>
          </li>
        ))}
      </ul>
    </div>
  );
}
