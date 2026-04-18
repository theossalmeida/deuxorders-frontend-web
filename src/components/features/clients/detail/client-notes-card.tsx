export function ClientNotesCard() {
  return (
    <div className="rounded-xl border border-border bg-card p-4">
      <div className="mb-2 text-xs font-semibold uppercase tracking-wider text-muted-foreground">
        Anotações
      </div>
      <p className="text-sm text-muted-foreground">Nenhuma anotação ainda.</p>
      <div className="mt-3 inline-flex items-center rounded-full bg-muted px-2 py-0.5 font-mono text-[10.5px] text-muted-foreground">
        sem edições
      </div>
    </div>
  );
}
