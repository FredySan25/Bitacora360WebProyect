"use client";

import { useState } from "react";
import { outlineButtonClassName } from "@/core/components/buttonStyles";
import { ConfirmDialog } from "@/core/components/ConfirmDialog";
import { FormAlert } from "@/core/components/FormAlert";
import { PlusIcon } from "@/core/components/icons";
import { formatMonth, type MonthKey } from "@/core/lib/dates";
import { EXPENSE_CATEGORIES, categoryLabel } from "../constants";
import { useBudgets } from "../hooks/useBudgets";
import { useSelectedMonth } from "../hooks/useSelectedMonth";
import { useTransactions } from "../hooks/useTransactions";
import { activeBudgets, expensesByCategory, transactionsOf } from "../stats";
import type { Budget } from "../types";
import { BudgetForm } from "./BudgetForm";
import { BudgetProgress } from "./BudgetProgress";
import { MonthNav } from "./MonthNav";

const listClassName =
  "divide-y divide-border rounded-2xl border border-border bg-paper-elevated shadow-[0_1px_2px_rgba(43,36,24,0.05)]";

/** Budgets in force during the selected month, each against what was spent, plus create, edit and delete. */
export function BudgetsBoard() {
  const { month, thisMonth, setMonth } = useSelectedMonth();
  const spending = useTransactions(month, 1);
  const { status, budgets, actionError, clearActionError, saveBudget, removeBudget } = useBudgets();

  const [creating, setCreating] = useState(false);
  const [editingCategory, setEditingCategory] = useState<string | null>(null);
  const [deleting, setDeleting] = useState<Budget | null>(null);

  if (status === "loading" || spending.status === "loading") {
    return <p className="text-sm text-ink-muted">Cargando tus presupuestos...</p>;
  }
  if (status === "error" || spending.status === "error") {
    return (
      <FormAlert message="No pudimos cargar tus presupuestos. Recarga la página para intentar de nuevo." />
    );
  }

  // Limits and spending of the same month, also while the next month's spending is on its way
  const shownMonth = spending.loadedMonth;
  const active = activeBudgets(budgets, shownMonth);
  const spentBy = new Map(
    expensesByCategory(transactionsOf(spending.transactions, shownMonth)).map((row) => [
      row.category,
      row.total,
    ]),
  );
  const available = EXPENSE_CATEGORIES.filter(
    (category) => !active.some((budget) => budget.category === category.key),
  );

  function changeMonth(next: MonthKey) {
    setCreating(false);
    setEditingCategory(null);
    clearActionError();
    setMonth(next);
  }

  return (
    <div className="flex flex-col gap-6">
      {actionError && <FormAlert message={actionError} />}

      <MonthNav month={month} thisMonth={thisMonth} onChange={changeMonth} />

      <div
        aria-busy={spending.refreshing}
        className={`flex flex-col gap-6 transition-opacity ${
          spending.refreshing ? "opacity-60" : ""
        }`}
      >
        {active.length > 0 ? (
          <ul className={listClassName}>
            {active.map((budget) => {
              const label = categoryLabel("expense", budget.category);
              if (editingCategory === budget.category) {
                return (
                  <li key={budget.category} className="px-4 py-4">
                    <BudgetForm
                      categories={[{ key: budget.category, label }]}
                      initialLimit={budget.monthlyLimit}
                      month={month}
                      submitLabel="Guardar"
                      onSubmit={async (category, monthlyLimit) => {
                        const ok = await saveBudget(category, month, monthlyLimit);
                        if (ok) setEditingCategory(null);
                        return ok;
                      }}
                      onCancel={() => {
                        setEditingCategory(null);
                        clearActionError();
                      }}
                    />
                  </li>
                );
              }
              return (
                <BudgetProgress
                  key={budget.category}
                  label={label}
                  spent={spentBy.get(budget.category) ?? 0}
                  limit={budget.monthlyLimit}
                  onEdit={() => {
                    setCreating(false);
                    setEditingCategory(budget.category);
                  }}
                  onDelete={() => setDeleting(budget)}
                />
              );
            })}
          </ul>
        ) : (
          <p className="rounded-2xl border border-dashed border-rule px-4 py-6 text-center text-sm text-ink-muted">
            Sin presupuestos en {formatMonth(shownMonth)}. Ponle un límite a la categoría en la que
            más gastas.
          </p>
        )}

        {creating ? (
          <section className="rounded-2xl border border-border bg-paper-elevated p-4">
            <h2 className="mb-3 font-display text-lg font-semibold text-ink">Nuevo presupuesto</h2>
            <BudgetForm
              categories={available}
              month={month}
              submitLabel="Crear presupuesto"
              onSubmit={async (category, monthlyLimit) => {
                const ok = await saveBudget(category, month, monthlyLimit);
                if (ok) setCreating(false);
                return ok;
              }}
              onCancel={() => {
                setCreating(false);
                clearActionError();
              }}
            />
          </section>
        ) : (
          // Every category can have one budget; with all of them taken there's nothing to add
          available.length > 0 && (
            <button
              type="button"
              onClick={() => {
                setEditingCategory(null);
                setCreating(true);
              }}
              className={outlineButtonClassName}
            >
              <PlusIcon className="h-4 w-4" />
              Nuevo presupuesto
            </button>
          )
        )}
      </div>

      {deleting && (
        <ConfirmDialog
          title={`¿Eliminar el presupuesto de ${categoryLabel("expense", deleting.category)}?`}
          message="Se quita de todos los meses, también de los anteriores. Tus movimientos no se borran."
          confirmLabel="Eliminar"
          onConfirm={async () => {
            await removeBudget(deleting.category);
            setDeleting(null);
          }}
          onCancel={() => setDeleting(null)}
        />
      )}
    </div>
  );
}
