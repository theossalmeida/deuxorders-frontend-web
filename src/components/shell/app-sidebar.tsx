"use client";

import Link from "next/link";
import Image from "next/image";
import { usePathname, useRouter } from "next/navigation";
import { LogOut } from "lucide-react";
import { toast } from "sonner";
import { cn } from "@/lib/utils";
import { NAV_GROUPS, isNavItemActive } from "./nav-items";

type Props = {
  badges?: { pendingOrders?: number };
  user: { name: string; email: string };
};

export function AppSidebar({ badges, user }: Props) {
  const pathname = usePathname();
  const router = useRouter();

  async function handleLogout() {
    await fetch("/api/auth/logout", { method: "POST" });
    toast.success("Sessão encerrada.");
    router.replace("/login");
  }

  return (
    <aside className="hidden md:flex w-56 shrink-0 flex-col border-r border-border bg-background-2">
      {/* Logo */}
      <div className="flex items-center gap-2.5 px-4 py-5">
        <Image src="/logo.jpeg" alt="Deuxcerie" width={32} height={32} className="rounded-lg object-cover" />
        <div>
          <div className="text-sm font-semibold tracking-tight">Deuxcerie</div>
          <div className="text-[10px] text-muted-foreground font-mono">ERP · v2.0</div>
        </div>
      </div>

      {/* Nav */}
      <nav className="flex-1 px-2.5 space-y-4" role="navigation" aria-label="Navegação principal">
        {NAV_GROUPS.map((group) => (
          <div key={group.label}>
            <div className="px-2.5 pb-1.5 text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">
              {group.label}
            </div>
            <ul className="space-y-0.5">
              {group.items.map((it) => {
                const active = isNavItemActive(it.href, pathname);
                const Icon = it.icon;
                const badge = it.badgeKey ? badges?.[it.badgeKey] : undefined;

                return (
                  <li key={it.href}>
                    <Link
                      href={it.href}
                      aria-current={active ? "page" : undefined}
                      className={cn(
                        "flex items-center gap-2.5 rounded-lg px-2.5 py-1.5 text-sm transition-colors",
                        active
                          ? "bg-card text-foreground font-semibold shadow-sm ring-1 ring-border"
                          : "text-foreground-soft hover:bg-accent font-medium",
                      )}
                    >
                      <Icon
                        size={18}
                        strokeWidth={1.6}
                        aria-hidden
                        className={active ? "text-brand" : "text-muted-foreground"}
                      />
                      <span className="flex-1">{it.label}</span>
                      {badge ? (
                        <span className="rounded-full bg-brand px-1.5 py-px text-[10px] font-mono font-semibold text-brand-foreground">
                          {badge}
                        </span>
                      ) : null}
                    </Link>
                  </li>
                );
              })}
            </ul>
          </div>
        ))}
      </nav>

      {/* User + logout */}
      <div className="border-t border-border px-2.5 py-3 space-y-1">
        <div className="flex items-center gap-2.5 px-2.5 py-1.5">
          <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-brand text-xs font-semibold text-brand-foreground shrink-0">
            {user.name[0]?.toUpperCase()}
          </div>
          <div className="min-w-0 flex-1">
            <div className="truncate text-xs font-semibold">{user.name}</div>
            <div className="truncate text-[10px] text-muted-foreground font-mono">{user.email}</div>
          </div>
        </div>
        <button
          onClick={handleLogout}
          className="flex w-full items-center gap-2.5 rounded-lg px-2.5 py-1.5 text-sm font-medium text-muted-foreground hover:bg-accent hover:text-foreground transition-colors"
        >
          <LogOut size={16} strokeWidth={1.6} aria-hidden />
          Sair
        </button>
      </div>
    </aside>
  );
}
