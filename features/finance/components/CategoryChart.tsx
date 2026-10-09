import { categoryLabel } from "../constants";
import { formatMoney, formatPercent } from "../format";
import type { CategoryTotal } from "../stats";

/**
 * Expenses by category as horizontal bars, largest first. Every bar carries
 * its amount and its share of the month, so the list reads without hovering.
 * One series, one color: the length already says which is bigger.
 */
export function CategoryChart({ rows }: { rows: CategoryTotal[] }) {
  const largest = Math.max(...rows.map((row) => row.total));

  return (
    <ol className="flex flex-col gap-3.5">
      {rows.map((row) => (
        <li key={row.category}>
          <div className="flex items-baseline justify-between gap-3 text-sm">
            <span className="truncate text-ink">{categoryLabel("expense", row.category)}</span>
            <span className="shrink-0 tabular-nums text-ink-muted">
              <span className="font-medium text-ink">{formatMoney(row.total)}</span> ·{" "}
              {formatPercent(row.share)}
            </span>
          </div>
          <div className="mt-1.5 h-3">
            {/* Keep a sliver visible so a tiny category doesn't look empty */}
            <div
              className="h-full rounded-r bg-accent"
              style={{ width: `max(${(row.total / largest) * 100}%, 3px)` }}
            />
          </div>
        </li>
      ))}
    </ol>
  );
}
