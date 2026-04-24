"use client";

import { useState } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { cn } from "@/lib/utils";
import { NAV_GROUPS, MOBILE_GROUP_TABS, isNavItemActive } from "./nav-items";

export function MobileBottomNav() {
  const pathname = usePathname();
  const router = useRouter();
  const [openGroupState, setOpenGroupState] = useState<{
    pathname: string;
    group: string | null;
  }>({ pathname, group: null });
  const openGroup = openGroupState.pathname === pathname ? openGroupState.group : null;
  const setOpenGroup = (group: string | null) =>
    setOpenGroupState({ pathname, group });

  return (
    <>
      {openGroup && (
        <div
          className="fixed inset-0 z-40"
          onClick={() => setOpenGroup(null)}
        />
      )}

      <nav
        role="navigation"
        aria-label="Navegação principal"
        className="fixed inset-x-0 bottom-0 z-50 border-t border-border bg-background/90 backdrop-blur-md md:hidden"
      >
        {openGroup && (
          <GroupPopover
            groupLabel={openGroup}
            pathname={pathname}
            onClose={() => setOpenGroup(null)}
          />
        )}

        <div
          className="flex justify-around px-2 pt-2"
          style={{ paddingBottom: "calc(env(safe-area-inset-bottom) + 0.5rem)" }}
        >
          {MOBILE_GROUP_TABS.map((tab) => {
            const group = NAV_GROUPS.find((g) => g.label === tab.groupLabel);
            if (!group) return null;

            const isActiveGroup = group.items.some((item) => isNavItemActive(item.href, pathname));
            const Icon = tab.tabIcon;

            function handleTap() {
              if (group!.items.length === 1) {
                router.push(group!.items[0].href);
              } else {
                setOpenGroup(openGroup === tab.groupLabel ? null : tab.groupLabel);
              }
            }

            return (
              <button
                key={tab.groupLabel}
                type="button"
                aria-current={isActiveGroup ? "true" : undefined}
                onClick={handleTap}
                className={cn(
                  "flex flex-col items-center gap-0.5 rounded-xl px-5 py-1.5 transition-colors",
                  isActiveGroup ? "bg-brand text-brand-foreground" : "text-muted-foreground",
                )}
              >
                <Icon size={18} strokeWidth={1.6} aria-hidden />
                <span className="text-[10px] font-semibold">{tab.tabLabel}</span>
              </button>
            );
          })}
        </div>
      </nav>
    </>
  );
}

type GroupPopoverProps = {
  groupLabel: string;
  pathname: string;
  onClose: () => void;
};

function GroupPopover({ groupLabel, pathname, onClose }: GroupPopoverProps) {
  const group = NAV_GROUPS.find((g) => g.label === groupLabel);
  if (!group) return null;

  return (
    <div className="border-t border-border bg-background px-3 py-2">
      <div className="text-[10px] font-semibold uppercase tracking-wider text-muted-foreground px-1 pb-1.5">
        {group.label}
      </div>
      <ul className="space-y-0.5">
        {group.items.map((item) => {
          const active = isNavItemActive(item.href, pathname);
          const Icon = item.icon;
          return (
            <li key={item.href}>
              <Link
                href={item.href}
                onClick={onClose}
                className={cn(
                  "flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-colors",
                  active
                    ? "bg-brand text-brand-foreground"
                    : "text-foreground hover:bg-accent",
                )}
              >
                <Icon size={16} strokeWidth={1.6} aria-hidden />
                {item.label}
              </Link>
            </li>
          );
        })}
      </ul>
    </div>
  );
}
