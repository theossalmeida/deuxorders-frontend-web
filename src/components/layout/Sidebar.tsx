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
      className="hidden md:flex flex-col w-60 h-screen sticky top-0 shrink-0 overflow-y-auto"
      style={{ backgroundColor: BRAND_COLOR }}
    >
      <div className="px-6 py-6 border-b border-white/10">
        <span className="text-white text-xl font-bold tracking-tight">DeuxOrders</span>
      </div>

      <nav className="flex-1 px-3 py-4 space-y-1">
        {NAV_ITEMS.map(({ href, label, icon: Icon }) => {
          const active = pathname.startsWith(href);
          return (
            <Link
              key={href}
              href={href}
              className={cn(
                "flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-colors",
                active
                  ? "bg-white/20 text-white"
                  : "text-white/70 hover:bg-white/10 hover:text-white"
              )}
            >
              <Icon className="h-5 w-5 shrink-0" />
              {label}
            </Link>
          );
        })}
      </nav>

      <div className="px-3 py-4 border-t border-white/10">
        <button
          onClick={handleLogout}
          className="flex w-full items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium text-white/70 hover:bg-white/10 hover:text-white transition-colors"
        >
          <LogOut className="h-5 w-5 shrink-0" />
          Sair
        </button>
      </div>
    </aside>
  );
}
