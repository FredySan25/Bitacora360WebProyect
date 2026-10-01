"use client";

import { useState } from "react";
import { formatDateKey } from "../dates";
import type { Totals } from "../stats";
import type { DateKey } from "../types";

export type DayPoint = {
  day: DateKey;
  totals: Totals;
};

// One hue, light -> strong: the share of that day's habits that got done.
const LEVELS = ["bg-ink/10", "bg-accent/30", "bg-accent/55", "bg-accent/80", "bg-accent"];

// Rows run Monday to Sunday; only alternate rows are labeled.
const ROW_LABELS = ["L", "", "X", "", "V", "", "D"];

function levelClassName({ scheduled, done }: Totals): string {
  if (scheduled === 0) return "border border-border";
  if (done === 0) return LEVELS[0];
  if (done === scheduled) return LEVELS[4];
  return LEVELS[Math.min(3, Math.ceil((done / scheduled) * 3))];
}

function daySummary({ scheduled, done }: Totals): string {
  if (scheduled === 0) return "Sin hábitos programados";
  return `${done} de ${scheduled} completados`;
}

/**
 * Calendar heatmap: one column per week (Monday on top), one cell per day.
 * `days` must start on a Monday; the readout shows the hovered day, or today.
 */
export function CompletionHeatmap({ days, today }: { days: DayPoint[]; today: DateKey }) {
  const [active, setActive] = useState<DayPoint | null>(null);
  const shown = active ?? days.find((point) => point.day === today) ?? days[days.length - 1];

  return (
    <figure>
      <figcaption className="mb-3 text-xs text-ink-muted" aria-live="polite">
        <span className="font-semibold text-ink first-letter:uppercase">
          {formatDateKey(shown.day, { weekday: "short", day: "numeric", month: "short" })}
        </span>{" "}
        · {daySummary(shown.totals)}
      </figcaption>

      <div className="flex max-w-xl gap-1.5">
        <div className="grid grid-rows-7 gap-1 text-[10px] leading-none text-ink-muted">
          {ROW_LABELS.map((label, i) => (
            <span key={i} className="flex items-center">
              {label}
            </span>
          ))}
        </div>

        <div
          role="img"
          aria-label="Mapa de calor del cumplimiento diario de las últimas semanas"
          className="grid flex-1 grid-flow-col grid-rows-7 gap-1 [grid-auto-columns:minmax(0,1fr)]"
          onPointerLeave={() => setActive(null)}
        >
          {days.map((point) => (
            <div
              key={point.day}
              onPointerEnter={() => setActive(point)}
              className={`aspect-square rounded-[3px] ${levelClassName(point.totals)} ${
                point.day === shown.day ? "outline outline-2 outline-offset-1 outline-ink/60" : ""
              }`}
            />
          ))}
        </div>
      </div>

      <div className="mt-3 flex items-center gap-1.5 text-[10px] text-ink-muted">
        <span>Menos</span>
        {LEVELS.map((level) => (
          <span key={level} className={`h-3 w-3 rounded-[3px] ${level}`} />
        ))}
        <span>Más</span>
      </div>
    </figure>
  );
}
