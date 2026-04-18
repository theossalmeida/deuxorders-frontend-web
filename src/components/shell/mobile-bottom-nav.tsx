"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";
import { MOBILE_NAV, isNavItemActive } from "./nav-items";

export function MobileBottomNav() {
  const pathname = usePathname();

  return (
    <nav
      role="navigation"
      aria-label="Navegação principal"
      className="fixed inset-x-0 bottom-0 z-30 flex justify-around border-t border-border bg-background/90 px-2 pt-2 backdrop-blur-md md:hidden"
      style={{ paddingBottom: "calc(env(safe-area-inset-bottom) + 0.5rem)" }}
    >
      {MOBILE_NAV.map((it) => {
        const active = isNavItemActive(it.href, pathname);
        const Icon = it.icon;
        return (
          <Link
            key={it.href}
            href={it.href}
            aria-current={active ? "page" : undefined}
            className={cn(
              "flex flex-col items-center gap-0.5 rounded-xl px-3 py-1.5 transition-colors",
              active ? "bg-brand text-brand-foreground" : "text-muted-foreground",
            )}
          >
            <Icon size={18} strokeWidth={1.6} aria-hidden />
            <span className="text-[10px] font-semibold">{it.label}</span>
          </Link>
        );
      })}
    </nav>
  );
}
