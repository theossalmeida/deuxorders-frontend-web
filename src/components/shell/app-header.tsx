type Props = {
  title: string;
  subtitle?: string;
  actions?: React.ReactNode;
};

export function AppHeader({ title, subtitle, actions }: Props) {
  return (
    <header className="sticky top-0 z-20 flex items-center justify-between border-b border-border bg-background px-7 py-4">
      <div>
        <h1 className="text-lg font-semibold tracking-tight">{title}</h1>
        {subtitle ? (
          <div className="mt-0.5 text-xs text-muted-foreground">{subtitle}</div>
        ) : null}
      </div>
      {actions ? <div className="flex items-center gap-2">{actions}</div> : null}
    </header>
  );
}
