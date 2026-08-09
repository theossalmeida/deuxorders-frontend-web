"use client";

type Props = {
  page: number;
  pageSize: number;
  totalCount: number;
  onPageChange: (page: number) => void;
};

export function CrmPagination({ page, pageSize, totalCount, onPageChange }: Props) {
  if (totalCount === 0) return null;

  const start = (page - 1) * pageSize + 1;
  const end = Math.min(page * pageSize, totalCount);
  const hasPrev = page > 1;
  const hasNext = end < totalCount;

  return (
    <div className="flex items-center justify-between px-1 py-2 text-xs text-muted-foreground">
      <span>
        {start}–{end} de {totalCount} clientes
      </span>
      <div className="flex items-center gap-2">
        <button
          type="button"
          disabled={!hasPrev}
          onClick={() => onPageChange(page - 1)}
          className="rounded-lg border border-border bg-card px-3 py-1.5 font-medium text-foreground-soft transition-colors hover:bg-accent disabled:cursor-not-allowed disabled:opacity-40"
        >
          Anterior
        </button>
        <button
          type="button"
          disabled={!hasNext}
          onClick={() => onPageChange(page + 1)}
          className="rounded-lg border border-border bg-card px-3 py-1.5 font-medium text-foreground-soft transition-colors hover:bg-accent disabled:cursor-not-allowed disabled:opacity-40"
        >
          Próxima
        </button>
      </div>
    </div>
  );
}
