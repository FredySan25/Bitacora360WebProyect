"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

const TABS = [
  { href: "/habits", label: "Diario" },
  { href: "/habits/progress", label: "Progreso" },
  { href: "/habits/gym", label: "Gym" },
];

/** Section switcher for the habits module. */
export function HabitsTabs() {
  const pathname = usePathname();

  return (
    <nav
      aria-label="Secciones de hábitos"
      className="mb-6 inline-flex gap-1 rounded-xl border border-border bg-paper-elevated p-1"
    >
      {TABS.map((tab) => {
        const active = pathname === tab.href;
        return (
          <Link
            key={tab.href}
            href={tab.href}
            aria-current={active ? "page" : undefined}
            className={`rounded-lg px-3.5 py-1.5 text-sm font-medium transition ${
              active ? "bg-accent/10 text-accent" : "text-ink-muted hover:bg-ink/5 hover:text-ink"
            }`}
          >
            {tab.label}
          </Link>
        );
      })}
    </nav>
  );
}
