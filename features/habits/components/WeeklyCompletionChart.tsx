"use client";

import { useState } from "react";
import { formatDateKey } from "../dates";
import { percent, type Totals } from "../stats";
import type { DateKey } from "../types";

export type WeekPoint = {
  weekStart: DateKey;
  /** Last day counted; for the current week that's today. */
  weekEnd: DateKey;
  totals: Totals;
};

const Y_TICKS = [100, 50, 0];

function weekRange(week: WeekPoint): string {
  const from = formatDateKey(week.weekStart, { day: "numeric", month: "short" });
  const to = formatDateKey(week.weekEnd, { day: "numeric", month: "short" });
  return `${from} – ${to}`;
}

function weekSummary(week: WeekPoint): string {
  if (week.totals.scheduled === 0) return "Sin hábitos programados";
  return `${week.totals.done} de ${week.totals.scheduled} completados`;
}

/**
 * Column chart of weekly completion (% of scheduled habits done), oldest week
 * first. The readout on top shows the hovered/focused week, or the current one.
 */
export function WeeklyCompletionChart({ weeks }: { weeks: WeekPoint[] }) {
  const [active, setActive] = useState<number | null>(null);
  const shownIndex = active ?? weeks.length - 1;
  const shown = weeks[shownIndex];
  const shownPercent = percent(shown.totals);

  return (
    <figure>
      <figcaption className="mb-4 flex items-baseline gap-2" aria-live="polite">
        <span className="text-2xl font-semibold text-ink">
          {shownPercent === null ? "—" : `${shownPercent}%`}
        </span>
        <span className="text-xs text-ink-muted">
          {weekRange(shown)} · {weekSummary(shown)}
        </span>
      </figcaption>

      <div className="flex gap-2">
        {/* Y axis */}
        <div className="relative h-40 w-8 shrink-0 text-right text-[10px] tabular-nums text-ink-muted">
          {Y_TICKS.map((tick) => (
            <span
              key={tick}
              className="absolute right-0 translate-y-1/2 leading-none"
              style={{ bottom: `${tick}%` }}
            >
              {tick}%
            </span>
          ))}
        </div>

        <div className="min-w-0 flex-1">
          <div
            className="relative h-40"
            onPointerLeave={() => setActive(null)}
            onBlur={() => setActive(null)}
          >
            {Y_TICKS.map((tick) => (
              <div
                key={tick}
                className="absolute inset-x-0 border-t border-border"
                style={{ bottom: `${tick}%` }}
              />
            ))}

            <div className="absolute inset-0 flex items-end">
              {weeks.map((week, i) => {
                const value = percent(week.totals);
                return (
                  <button
                    key={week.weekStart}
                    type="button"
                    aria-label={`Semana ${weekRange(week)}: ${
                      value === null ? "" : `${value}%, `
                    }${weekSummary(week)}`}
                    onPointerEnter={() => setActive(i)}
                    onFocus={() => setActive(i)}
                    className="flex h-full flex-1 items-end justify-center px-[1px] outline-offset-0"
                  >
                    {value !== null && (
                      <span
                        className={`w-full max-w-6 rounded-t transition-colors ${
                          i === shownIndex ? "bg-accent" : "bg-accent/40"
                        }`}
                        // Keep a sliver visible at 0% so the week doesn't look unrecorded
                        style={{ height: `max(${value}%, 2px)` }}
                      />
                    )}
                  </button>
                );
              })}
            </div>
          </div>

          {/* X axis: every other week, always including the current one */}
          <div className="mt-1.5 flex text-[10px] tabular-nums text-ink-muted">
            {weeks.map((week, i) => (
              <span key={week.weekStart} className="flex-1 text-center">
                {(weeks.length - 1 - i) % 2 === 0 &&
                  formatDateKey(week.weekStart, { day: "numeric", month: "numeric" })}
              </span>
            ))}
          </div>
        </div>
      </div>
    </figure>
  );
}
