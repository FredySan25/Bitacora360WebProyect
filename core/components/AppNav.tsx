"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import type { ReactNode } from "react";

export type NavItem = {
  href: string;
  label: string;
  icon: ReactNode;
};

function useIsActive() {
  const pathname = usePathname();
  return (href: string) => pathname === href || pathname.startsWith(`${href}/`);
}

/** The label of a menu item; the current one goes under the highlighter. */
function NavLabel({ label, active }: { label: string; active: boolean }) {
  return active ? <span className="highlight-mark">{label}</span> : <>{label}</>;
}

/** Vertical navigation for the desktop sidebar. */
export function SidebarNav({ items }: { items: NavItem[] }) {
  const isActive = useIsActive();

  return (
    <nav className="flex flex-col gap-0.5">
      {items.map((item) => {
        const active = isActive(item.href);
        return (
          <Link
            key={item.href}
            href={item.href}
            aria-current={active ? "page" : undefined}
            className={`flex min-h-10 items-center gap-3 rounded-md px-2.5 py-2 text-[0.9375rem] transition ${
              active ? "font-bold text-ink" : "text-ink-muted hover:bg-ink/5 hover:text-ink"
            }`}
          >
            <span className="h-5 w-5 shrink-0">{item.icon}</span>
            <NavLabel label={item.label} active={active} />
          </Link>
        );
      })}
    </nav>
  );
}

/** Bottom tab bar for mobile. */
export function BottomTabs({ items }: { items: NavItem[] }) {
  const isActive = useIsActive();

  return (
    <nav className="fixed inset-x-0 bottom-0 z-20 border-t border-rule bg-paper-elevated/95 pb-[env(safe-area-inset-bottom)] backdrop-blur md:hidden">
      <ul className="grid grid-cols-4">
        {items.map((item) => {
          const active = isActive(item.href);
          return (
            <li key={item.href}>
              <Link
                href={item.href}
                aria-current={active ? "page" : undefined}
                className={`flex flex-col items-center gap-1 pt-2.5 pb-3 text-xs transition ${
                  active ? "font-bold text-ink" : "text-ink-muted hover:text-ink"
                }`}
              >
                <span className="h-5 w-5">{item.icon}</span>
                <NavLabel label={item.label} active={active} />
              </Link>
            </li>
          );
        })}
      </ul>
    </nav>
  );
}
