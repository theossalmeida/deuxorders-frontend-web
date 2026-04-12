"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { LayoutDashboard, ShoppingCart, Package, Users } from "lucide-react";
import { cn } from "@/lib/utils";

const NAV_ITEMS = [
  { href: "/dashboard", label: "Dashboard", icon: LayoutDashboard },
  { href: "/orders", label: "Pedidos", icon: ShoppingCart },
  { href: "/products", label: "Produtos", icon: Package },
  { href: "/clients", label: "Clientes", icon: Users },
];

export function BottomNav() {
  const pathname = usePathname();

  return (
    <nav
      className="fixed bottom-0 left-0 right-0 z-50 flex md:hidden border-t border-white/10 px-2 py-1 safe-area-pb"
      style={{ backgroundColor: "#581629" }}
    >
      {NAV_ITEMS.map(({ href, label, icon: Icon }) => {
        const active = pathname.startsWith(href);
        return (
          <Link
            key={href}
            href={href}
            className="flex flex-1 flex-col items-center justify-center py-1.5 gap-1 transition-all"
          >
            <span
              className={cn(
                "flex items-center justify-center w-10 h-6 rounded-full transition-all duration-200",
                active ? "bg-white/20" : ""
              )}
            >
              <Icon className={cn("h-5 w-5 transition-opacity", active ? "text-white opacity-100" : "text-white opacity-40")} />
            </span>
            <span className={cn("text-[10px] font-medium transition-opacity", active ? "text-white opacity-100" : "text-white opacity-40")}>
              {label}
            </span>
          </Link>
        );
      })}
    </nav>
  );
}
