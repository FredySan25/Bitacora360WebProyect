"use client";

import Link from "next/link";
import { usePathname, useSearchParams } from "next/navigation";
import { tabClassName, tabListClassName } from "@/core/components/surfaces";
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
    <nav aria-label="Secciones de finanzas" className={tabListClassName}>
      {TABS.map((tab) => {
        const active = pathname === tab.href;
        return (
          <Link
            key={tab.href}
            href={`${tab.href}${query}`}
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
