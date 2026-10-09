"use client";

import { useState } from "react";
import { formatMonth } from "@/core/lib/dates";
import { formatCompactMoney, formatMoney } from "../format";
import type { TrendPoint } from "../stats";

const SERIES = [
  { key: "income", label: "Ingresos", className: "bg-series-income" },
  { key: "expenses", label: "Gastos", className: "bg-series-expense" },
] as const;

/** Rounds up to 1, 2, 2.5 or 5 times a power of ten, so the axis reads cleanly. */
function niceCeil(value: number): number {
  if (value <= 0) return 100;
  const magnitude = 10 ** Math.floor(Math.log10(value));
  const step = [1, 2, 2.5, 5, 10].find((candidate) => candidate * magnitude >= value) ?? 10;
  return step * magnitude;
}

/**
 * Grouped columns of income and expenses per month, oldest first, on a single
 * axis. The readout on top shows the hovered or focused month, or the last one.
 */
export function TrendChart({ points }: { points: TrendPoint[] }) {
  const [active, setActive] = useState<number | null>(null);
  const shownIndex = active !== null && active < points.length ? active : points.length - 1;
  const shown = points[shownIndex];

  const max = niceCeil(Math.max(...points.flatMap((point) => [point.income, point.expenses])));
  const ticks = [max, max / 2, 0];

  return (
    <figure>
      <figcaption className="mb-3 flex flex-col gap-0.5" aria-live="polite">
        <span className="text-sm font-medium text-ink first-letter:uppercase">
          {formatMonth(shown.month)}
        </span>
        <span className="text-xs text-ink-muted">
          Ingresos {formatMoney(shown.income)} · Gastos {formatMoney(shown.expenses)} · Balance{" "}
          {formatMoney(shown.balance)}
        </span>
      </figcaption>

      <ul className="mb-4 flex gap-4 text-xs text-ink-muted">
        {SERIES.map((series) => (
          <li key={series.key} className="flex items-center gap-1.5">
            <span aria-hidden="true" className={`h-2.5 w-2.5 rounded-sm ${series.className}`} />
            {series.label}
          </li>
        ))}
      </ul>

      <div className="flex gap-2">
        {/* Y axis */}
        <div className="relative h-44 w-10 shrink-0 text-right text-[10px] tabular-nums text-ink-muted">
          {ticks.map((tick, i) => (
            <span
              key={tick}
              className="absolute right-0 translate-y-1/2 leading-none"
              style={{ bottom: `${100 - i * 50}%` }}
            >
              {formatCompactMoney(tick)}
            </span>
          ))}
        </div>

        <div className="min-w-0 flex-1">
          <div
            className="relative h-44"
            onPointerLeave={() => setActive(null)}
            onBlur={() => setActive(null)}
          >
            {ticks.map((tick, i) => (
              <div
                key={tick}
                className="absolute inset-x-0 border-t border-border"
                style={{ bottom: `${100 - i * 50}%` }}
              />
            ))}

            <div className="absolute inset-0 flex items-end">
              {points.map((point, i) => (
                <button
                  key={point.month}
                  type="button"
                  aria-label={`${formatMonth(point.month)}: ingresos ${formatMoney(
                    point.income,
                  )}, gastos ${formatMoney(point.expenses)}`}
                  onPointerEnter={() => setActive(i)}
                  onFocus={() => setActive(i)}
                  // The whole slot is the hover target, not just the columns
                  className={`flex h-full flex-1 items-end justify-center gap-0.5 rounded-t px-1 outline-offset-0 transition-colors ${
                    i === shownIndex ? "bg-ink/5" : ""
                  }`}
                >
                  {SERIES.map((series) => {
                    const value = point[series.key];
                    return (
                      <span
                        key={series.key}
                        className={`w-full max-w-5 rounded-t ${series.className}`}
                        // Keep a sliver visible so a small amount doesn't look like none
                        style={{ height: value === 0 ? 0 : `max(${(value / max) * 100}%, 2px)` }}
                      />
                    );
                  })}
                </button>
              ))}
            </div>
          </div>

          {/* X axis */}
          <div className="mt-1.5 flex text-[10px] text-ink-muted">
            {points.map((point) => (
              <span key={point.month} className="flex-1 text-center">
                {formatMonth(point.month, { month: "short" })}
              </span>
            ))}
          </div>
        </div>
      </div>

      {/* The same numbers as a table, for screen readers */}
      <table className="sr-only">
        <caption>Ingresos y gastos por mes</caption>
        <thead>
          <tr>
            <th scope="col">Mes</th>
            <th scope="col">Ingresos</th>
            <th scope="col">Gastos</th>
            <th scope="col">Balance</th>
          </tr>
        </thead>
        <tbody>
          {points.map((point) => (
            <tr key={point.month}>
              <th scope="row">{formatMonth(point.month)}</th>
              <td>{formatMoney(point.income)}</td>
              <td>{formatMoney(point.expenses)}</td>
              <td>{formatMoney(point.balance)}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </figure>
  );
}
