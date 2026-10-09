"use client";

import Link from "next/link";
import { usePathname, useSearchParams } from "next/navigation";
import { MONTH_PARAM } from "../hooks/useSelectedMonth";

const TABS = [
  { href: "/finance", label: "Movimientos" },
  { href: "/finance/budgets", label: "Presupuestos" },
  { href: "/finance/summary", label: "Resumen" },
  { href: "/finance/goals", label: "Metas" },
];

/** Section switcher for the finance module. The selected month follows from tab to tab. */
export function FinanceTabs() {
  const pathname = usePathname();
  const month = useSearchParams().get(MONTH_PARAM);
  const query = month ? `?${MONTH_PARAM}=${encodeURIComponent(month)}` : "";

  return (
    <nav
      aria-label="Secciones de finanzas"
      className="mb-6 inline-flex max-w-full gap-1 overflow-x-auto rounded-xl border border-border bg-paper-elevated p-1"
    >
      {TABS.map((tab) => {
        const active = pathname === tab.href;
        return (
          <Link
            key={tab.href}
            href={`${tab.href}${query}`}
            aria-current={active ? "page" : undefined}
            className={`shrink-0 rounded-lg px-3.5 py-1.5 text-sm font-medium transition ${
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
