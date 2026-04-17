import { cn } from "@/lib/utils";

type Props = {
  children: React.ReactNode;
  variant?: "dashboard" | "list" | "form";
  className?: string;
};

export function PageShell({ children, className }: Props) {
  return (
    <div className={cn("px-4 md:px-7 py-4 md:py-6", className)}>
      {children}
    </div>
  );
}
