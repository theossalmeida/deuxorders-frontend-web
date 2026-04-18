import { cn } from "@/lib/utils";

export function ClientAvatar({ name, size = "md" }: { name: string; size?: "sm" | "md" | "lg" }) {
  const letter = name?.[0]?.toUpperCase() ?? "?";
  return (
    <div
      className={cn(
        "flex shrink-0 items-center justify-center rounded-full bg-brand-soft font-semibold text-brand",
        size === "sm" && "h-7 w-7 text-[11px]",
        size === "md" && "h-9 w-9 text-sm",
        size === "lg" && "h-14 w-14 text-[22px]",
      )}
    >
      {letter}
    </div>
  );
}
