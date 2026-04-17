type Props = {
  title: string;
  eyebrow?: string;
  right?: React.ReactNode;
};

export function MobileTopBar({ title, eyebrow, right }: Props) {
  return (
    <header className="sticky top-0 z-20 flex items-center justify-between bg-background px-4 pt-14 pb-3 md:hidden">
      <div>
        {eyebrow ? (
          <div className="text-[11px] font-medium text-muted-foreground">{eyebrow}</div>
        ) : null}
        <h1 className="text-[22px] font-semibold tracking-tight mt-0.5">{title}</h1>
      </div>
      {right}
    </header>
  );
}
