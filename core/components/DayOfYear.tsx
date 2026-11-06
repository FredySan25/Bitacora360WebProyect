"use client";

import { useClientToday } from "../hooks/useClientToday";
import { dayOfYear, daysInYear } from "../lib/dates";

/** "Día 309 del año. Faltan 56.", in the viewer's timezone. */
export function DayOfYear() {
  const today = useClientToday();
  // Non-breaking space, so the line keeps its height until the day shows up.
  if (!today) return <>{" "}</>;

  const day = dayOfYear(today) + 1;
  const left = daysInYear(Number(today.slice(0, 4))) - day;
  return (
    <span className="tabular-nums">
      Día {day} del año. {left === 0 ? "Es el último." : left === 1 ? "Falta 1." : `Faltan ${left}.`}
    </span>
  );
}
