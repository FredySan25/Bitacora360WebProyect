import { BUDGET_RULE, EXPENSE_CATEGORIES, type SpendingGroup } from "../constants";
import { formatMoney, formatPercent } from "../format";
import type { RuleBreakdown } from "../stats";

const ROWS = [
  { key: "needs", label: "Necesidades" },
  { key: "wants", label: "Gustos" },
  { key: "savings", label: "Ahorro" },
] as const;

function categoriesIn(group: SpendingGroup): string {
  return EXPENSE_CATEGORIES.filter((category) => category.group === group)
    .map((category) => category.label.toLowerCase())
    .join(", ");
}

/**
 * How the month's income was split between needs, wants and savings, each
 * against its share in the 50/30/20 rule (the mark on the bar).
 */
export function BudgetRuleChart({ breakdown }: { breakdown: RuleBreakdown }) {
  if (breakdown.income === 0) {
    return (
      <p className="text-sm text-ink-muted">
        Registra un ingreso en este mes para ver cómo se reparte.
      </p>
    );
  }

  return (
    <div className="flex flex-col gap-4">
      <ul className="flex flex-col gap-4">
        {ROWS.map((row) => {
          const amount = breakdown[row.key];
          const share = (amount / breakdown.income) * 100;
          const reference = BUDGET_RULE[row.key];
          return (
            <li key={row.key}>
              <div className="flex flex-wrap items-baseline justify-between gap-x-3 text-sm">
                <span className="text-ink">{row.label}</span>
                <span className="tabular-nums text-ink-muted">
                  <span className="font-medium text-ink">{formatPercent(share)}</span> del ingreso
                  · {formatMoney(amount)} · referencia {formatPercent(reference)}
                </span>
              </div>
              <div className="relative mt-2 h-2 rounded-full bg-accent/20">
                <div
                  className="h-full rounded-full bg-accent"
                  style={{ width: `${Math.min(Math.max(share, 0), 100)}%` }}
                />
                {/* Reference mark, ringed in the surface color so it stays visible over the fill */}
                <span
                  aria-hidden="true"
                  className="absolute top-1/2 h-4 w-0.5 -translate-x-1/2 -translate-y-1/2 rounded-full bg-ink ring-2 ring-paper-elevated"
                  style={{ left: `${reference}%` }}
                />
              </div>
            </li>
          );
        })}
      </ul>

      <p className="text-xs text-ink-muted">
        Necesidades: {categoriesIn("needs")}. Gustos: {categoriesIn("wants")}. Ahorro: lo que
        queda del ingreso después de los gastos.
      </p>
    </div>
  );
}
