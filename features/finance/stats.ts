import { addMonths, firstDayOf, monthOf, type MonthKey } from "@/core/lib/dates";
import { BUDGET_WARNING_RATIO, EXPENSE_CATEGORIES } from "./constants";
import type { Budget, SavingsGoal, Transaction } from "./types";

/** Adds amounts in whole cents, so a total never carries floating-point dust. */
export function sumAmounts(amounts: number[]): number {
  return amounts.reduce((cents, amount) => cents + Math.round(amount * 100), 0) / 100;
}

export function transactionsOf(transactions: Transaction[], month: MonthKey): Transaction[] {
  return transactions.filter((transaction) => monthOf(transaction.occurredOn) === month);
}

export type MonthTotals = { income: number; expenses: number; balance: number };

export function totalsOf(transactions: Transaction[]): MonthTotals {
  const amountsOf = (type: Transaction["type"]) =>
    transactions.filter((transaction) => transaction.type === type).map((t) => t.amount);

  const income = sumAmounts(amountsOf("income"));
  const expenses = sumAmounts(amountsOf("expense"));
  return { income, expenses, balance: sumAmounts([income, -expenses]) };
}

/** Share of the income that wasn't spent, in percent; null without income. */
export function savingsRate({ income, balance }: MonthTotals): number | null {
  return income === 0 ? null : (balance / income) * 100;
}

/** Change from `previous` to `current` in percent; null when there's nothing to compare with. */
export function percentChange(current: number, previous: number): number | null {
  return previous === 0 ? null : ((current - previous) / previous) * 100;
}

export type CategoryTotal = {
  category: string;
  total: number;
  /** Share of all the expenses, 0-100. */
  share: number;
};

/** Expenses added up by category, largest first. Categories without expenses are left out. */
export function expensesByCategory(transactions: Transaction[]): CategoryTotal[] {
  const expenses = transactions.filter((transaction) => transaction.type === "expense");
  const all = sumAmounts(expenses.map((expense) => expense.amount));

  return EXPENSE_CATEGORIES.map(({ key }) => {
    const total = sumAmounts(
      expenses.filter((expense) => expense.category === key).map((expense) => expense.amount),
    );
    return { category: key, total, share: all === 0 ? 0 : (total / all) * 100 };
  })
    .filter((row) => row.total > 0)
    .sort((a, b) => b.total - a.total);
}

/**
 * The budget in force for each category during `month`: its latest version
 * that starts on or before that month. In the order of `EXPENSE_CATEGORIES`.
 */
export function activeBudgets(budgets: Budget[], month: MonthKey): Budget[] {
  const monthStart = firstDayOf(month);
  const active = new Map<string, Budget>();
  for (const budget of budgets) {
    if (budget.effectiveFrom > monthStart) continue;
    const current = active.get(budget.category);
    if (!current || budget.effectiveFrom > current.effectiveFrom) {
      active.set(budget.category, budget);
    }
  }
  return EXPENSE_CATEGORIES.flatMap(({ key }) => active.get(key) ?? []);
}

export type BudgetState = "ok" | "warning" | "over";

/** "warning" from 80% of the limit, "over" past 100%. Compared in cents. */
export function budgetState(spent: number, limit: number): BudgetState {
  const spentCents = Math.round(spent * 100);
  const limitCents = Math.round(limit * 100);
  if (spentCents > limitCents) return "over";
  return spentCents >= limitCents * BUDGET_WARNING_RATIO ? "warning" : "ok";
}

export type TrendPoint = MonthTotals & { month: MonthKey };

/** Totals of the `count` months that end on `lastMonth`, oldest first. */
export function monthlyTrend(
  transactions: Transaction[],
  lastMonth: MonthKey,
  count: number,
): TrendPoint[] {
  return Array.from({ length: count }, (_, i) => {
    const month = addMonths(lastMonth, i - (count - 1));
    return { month, ...totalsOf(transactionsOf(transactions, month)) };
  });
}

export type RuleBreakdown = {
  income: number;
  needs: number;
  wants: number;
  /** What's left of the income; negative when more was spent than earned. */
  savings: number;
};

/** How a month's income was split between needs, wants and savings (50/30/20 rule). */
export function ruleBreakdown(transactions: Transaction[]): RuleBreakdown {
  const { income, balance } = totalsOf(transactions);
  const spentIn = (group: "needs" | "wants") => {
    const keys = EXPENSE_CATEGORIES.filter((c) => c.group === group).map((c) => c.key);
    return sumAmounts(
      transactions
        .filter((t) => t.type === "expense" && keys.includes(t.category))
        .map((t) => t.amount),
    );
  };

  return { income, needs: spentIn("needs"), wants: spentIn("wants"), savings: balance };
}

/** Total contributed to a goal so far. */
export function savedTowards(goal: SavingsGoal): number {
  return sumAmounts(goal.contributions.map((contribution) => contribution.amount));
}
