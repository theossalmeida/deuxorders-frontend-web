import { cn } from "@/lib/utils";

type Variant = "list" | "dashboard" | "form";

const WIDTHS: Record<Variant, string> = {
  list: "max-w-6xl",
  dashboard: "max-w-5xl",
  form: "max-w-2xl",
};

export function PageShell({
  variant,
  className,
  children,
}: {
  variant: Variant;
  className?: string;
  children: React.ReactNode;
}) {
  return (
    <div className={cn("mx-auto w-full px-4 py-6", WIDTHS[variant], className)}>
      {children}
    </div>
  );
}
