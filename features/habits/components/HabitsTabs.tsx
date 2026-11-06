"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { tabClassName, tabListClassName } from "@/core/components/surfaces";

const TABS = [
  { href: "/habits", label: "Diario" },
  { href: "/habits/progress", label: "Progreso" },
  { href: "/habits/gym", label: "Gym" },
];

/** Section switcher for the habits module. */
export function HabitsTabs() {
  const pathname = usePathname();

  return (
    <nav aria-label="Secciones de hábitos" className={tabListClassName}>
      {TABS.map((tab) => {
        const active = pathname === tab.href;
        return (
          <Link
            key={tab.href}
            href={tab.href}
            aria-current={active ? "page" : undefined}
            className={tabClassName(active)}
          >
            {tab.label}
          </Link>
        );
      })}
    </nav>
  );
}
