"use client";

import { usePathname, useSearchParams } from "next/navigation";
import { useState } from "react";
import { currentMonth, isMonthKey, type MonthKey } from "@/core/lib/dates";

/** Query parameter that carries the selected month, e.g. `/finance?month=2026-09`. */
export const MONTH_PARAM = "month";

/**
 * The month the finance views are showing. It lives in the URL, so it survives
 * a reload and follows the user from one tab to the next; without the
 * parameter (or with a month that hasn't started yet) it's the current month.
 */
export function useSelectedMonth() {
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const [thisMonth] = useState(currentMonth);

  const param = searchParams.get(MONTH_PARAM);
  const month: MonthKey = param && isMonthKey(param) && param <= thisMonth ? param : thisMonth;

  function setMonth(next: MonthKey) {
    const params = new URLSearchParams(searchParams.toString());
    if (next >= thisMonth) params.delete(MONTH_PARAM);
    else params.set(MONTH_PARAM, next);

    // Only the query changes, so there's nothing to ask the server for
    const query = params.toString();
    window.history.replaceState(null, "", query ? `${pathname}?${query}` : pathname);
  }

  return { month, thisMonth, setMonth };
}
