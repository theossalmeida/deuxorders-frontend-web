import {
  LayoutGrid,
  ShoppingCart,
  Package,
  Users,
  Wallet,
  Receipt,
  Warehouse,
  Handshake,
  type LucideIcon,
} from "lucide-react";

export type NavGroup = {
  label: string;
  items: NavItem[];
};

export type NavItem = {
  href: string;
  label: string;
  icon: LucideIcon;
  badgeKey?: "pendingOrders";
  inMobile?: boolean;
};

export const NAV_GROUPS: NavGroup[] = [
  {
    label: "Pedidos",
    items: [
      { href: "/dashboard", label: "Painel",   icon: LayoutGrid },
      { href: "/orders",    label: "Pedidos",  icon: ShoppingCart, badgeKey: "pendingOrders", inMobile: true },
      { href: "/products",  label: "Produtos", icon: Package },
      { href: "/inventory", label: "Estoque",  icon: Warehouse },
    ],
  },
  {
    label: "Financeiro",
    items: [
      { href: "/cash",         label: "Caixa",       icon: Wallet, inMobile: true },
      { href: "/cash/entries", label: "Lançamentos", icon: Receipt },
    ],
  },
  {
    label: "Clientes",
    items: [
      { href: "/clients", label: "Clientes", icon: Users, inMobile: true },
      { href: "/crm",      label: "CRM",      icon: Handshake },
    ],
  },
];

export type MobileGroupTab = {
  groupLabel: string;
  tabLabel: string;
  tabIcon: LucideIcon;
};

export const MOBILE_GROUP_TABS: MobileGroupTab[] = [
  { groupLabel: "Pedidos",     tabLabel: "Pedidos",  tabIcon: ShoppingCart },
  { groupLabel: "Financeiro",  tabLabel: "Caixa",    tabIcon: Wallet },
  { groupLabel: "Clientes",    tabLabel: "Clientes", tabIcon: Users },
];

/** @deprecated — use MOBILE_GROUP_TABS */
export const MOBILE_NAV = NAV_GROUPS
  .flatMap((g) => g.items)
  .filter((i) => i.inMobile);

const ALL_HREFS = NAV_GROUPS.flatMap((g) => g.items.map((i) => i.href));

/** Returns true if the given href should be considered active for pathname. */
export function isNavItemActive(href: string, pathname: string): boolean {
  if (pathname === href) return true;
  if (!pathname.startsWith(href + "/")) return false;
  // Prevent a parent from being active when a more-specific sibling matches.
  return !ALL_HREFS.some(
    (h) => h !== href && h.length > href.length && pathname.startsWith(h)
  );
}
