"use client";

import { FormAlert } from "@/core/components/FormAlert";
import { addMonths, formatMonth } from "@/core/lib/dates";
import { TREND_MONTHS } from "../constants";
import { useSelectedMonth } from "../hooks/useSelectedMonth";
import { useTransactions } from "../hooks/useTransactions";
import {
  expensesByCategory,
  monthlyTrend,
  ruleBreakdown,
  totalsOf,
  transactionsOf,
} from "../stats";
import { BudgetRuleChart } from "./BudgetRuleChart";
import { CategoryChart } from "./CategoryChart";
import { ChartCard } from "./ChartCard";
import { MonthNav } from "./MonthNav";
import { SummaryCards } from "./SummaryCards";
import { TrendChart } from "./TrendChart";

/** Monthly summary: totals against the month before, expenses by category, the trend and the 50/30/20 split. */
export function FinanceSummary() {
  const { month, thisMonth, setMonth } = useSelectedMonth();
  const { status, transactions, loadedMonth, refreshing } = useTransactions(month, TREND_MONTHS);

  if (status === "loading") {
    return <p className="text-sm text-ink-muted">Cargando tu resumen...</p>;
  }
  if (status === "error") {
    return (
      <FormAlert message="No pudimos cargar tu resumen. Recarga la página para intentar de nuevo." />
    );
  }

  const monthTransactions = transactionsOf(transactions, loadedMonth);
  const previousMonth = addMonths(loadedMonth, -1);
  const byCategory = expensesByCategory(monthTransactions);
  const trend = monthlyTrend(transactions, loadedMonth, TREND_MONTHS);

  return (
    <div className="flex flex-col gap-6">
      <MonthNav month={month} thisMonth={thisMonth} onChange={setMonth} />

      <div
        aria-busy={refreshing}
        className={`flex flex-col gap-4 transition-opacity ${refreshing ? "opacity-60" : ""}`}
      >
        <SummaryCards
          totals={totalsOf(monthTransactions)}
          previous={{
            month: previousMonth,
            totals: totalsOf(transactionsOf(transactions, previousMonth)),
          }}
          showSavingsRate
        />

        <ChartCard title="Gastos por categoría">
          {byCategory.length > 0 ? (
            <CategoryChart rows={byCategory} />
          ) : (
            <p className="text-sm text-ink-muted">Sin gastos en {formatMonth(loadedMonth)}.</p>
          )}
        </ChartCard>

        <ChartCard title={`Ingresos y gastos de los últimos ${TREND_MONTHS} meses`}>
          {transactions.length > 0 ? (
            <TrendChart points={trend} />
          ) : (
            <p className="text-sm text-ink-muted">Aún no hay movimientos en estos meses.</p>
          )}
        </ChartCard>

        <ChartCard title="Regla 50/30/20">
          <BudgetRuleChart breakdown={ruleBreakdown(monthTransactions)} />
        </ChartCard>
      </div>
    </div>
  );
}
