"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { LayoutDashboard, ShoppingCart, Package, Users, LogOut } from "lucide-react";
import { cn } from "@/lib/utils";
import { toast } from "sonner";

const NAV_ITEMS = [
  { href: "/dashboard", label: "Dashboard", icon: LayoutDashboard },
  { href: "/orders", label: "Pedidos", icon: ShoppingCart },
  { href: "/products", label: "Produtos", icon: Package },
  { href: "/clients", label: "Clientes", icon: Users },
];

const BRAND_COLOR = "#581629";

export function Sidebar() {
  const pathname = usePathname();
  const router = useRouter();

  async function handleLogout() {
    await fetch("/api/auth/logout", { method: "POST" });
    toast.success("Sessão encerrada.");
    router.replace("/login");
  }

  return (
    <aside
      className="hidden md:flex flex-col w-64 h-screen sticky top-0 shrink-0 overflow-y-auto"
      style={{ backgroundColor: BRAND_COLOR }}
    >
      {/* Brand */}
      <div className="px-5 py-6">
        <img src="/logo.jpeg" alt="Deuxcerie" className="h-9 w-auto object-contain" />
        <p className="text-white/40 text-xs mt-1.5 font-medium tracking-wide uppercase text-center">Gestão de pedidos</p>
      </div>

      {/* Nav */}
      <nav className="flex-1 px-3 space-y-0.5">
        {NAV_ITEMS.map(({ href, label, icon: Icon }) => {
          const active = pathname.startsWith(href);
          return (
            <Link
              key={href}
              href={href}
              className={cn(
                "group relative flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium transition-all duration-150",
                active
                  ? "bg-white/15 text-white shadow-sm"
                  : "text-white/60 hover:bg-white/8 hover:text-white/90"
              )}
            >
              {active && (
                <span className="absolute left-0 inset-y-2.5 w-[3px] bg-white rounded-r-full" />
              )}
              <Icon className={cn("h-[18px] w-[18px] shrink-0 transition-opacity", active ? "opacity-100" : "opacity-60 group-hover:opacity-90")} />
              {label}
            </Link>
          );
        })}
      </nav>

      {/* Logout */}
      <div className="px-3 py-5 mt-auto">
        <div className="h-px bg-white/10 mb-4" />
        <button
          onClick={handleLogout}
          className="flex w-full items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium text-white/50 hover:bg-white/8 hover:text-white/80 transition-all duration-150"
        >
          <LogOut className="h-[18px] w-[18px] shrink-0" />
          Sair
        </button>
      </div>
    </aside>
  );
}
