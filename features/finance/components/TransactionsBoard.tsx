"use client";

import { useState } from "react";
import { ghostButtonClassName, outlineButtonClassName } from "@/core/components/buttonStyles";
import { ConfirmDialog } from "@/core/components/ConfirmDialog";
import { FormAlert } from "@/core/components/FormAlert";
import { PlusIcon } from "@/core/components/icons";
import {
  formatDateKey,
  formatMonth,
  lastDayOf,
  monthOf,
  todayKey,
  type MonthKey,
} from "@/core/lib/dates";
import { categoryLabel } from "../constants";
import { formatMoney } from "../format";
import { useSelectedMonth } from "../hooks/useSelectedMonth";
import { useTransactions } from "../hooks/useTransactions";
import { totalsOf, transactionsOf } from "../stats";
import type { Transaction, TransactionInput } from "../types";
import { MonthNav } from "./MonthNav";
import { SummaryCards } from "./SummaryCards";
import { NO_FILTERS, TransactionFilters, matchesFilter } from "./TransactionFilters";
import { TransactionForm } from "./TransactionForm";
import { TransactionItem } from "./TransactionItem";

const listClassName =
  "divide-y divide-border rounded-2xl border border-border bg-paper-elevated shadow-[0_1px_2px_rgba(20,32,43,0.05)]";

const emptyClassName =
  "rounded-2xl border border-dashed border-rule px-4 py-6 text-center text-sm text-ink-muted";

/** Transactions of the selected month: totals, the list with its filters, and create, edit and delete. */
export function TransactionsBoard() {
  const { month, thisMonth, setMonth } = useSelectedMonth();
  const {
    status,
    transactions,
    loadedMonth,
    refreshing,
    actionError,
    clearActionError,
    addTransaction,
    editTransaction,
    removeTransaction,
  } = useTransactions(month, 1);

  const [today] = useState(todayKey);
  const [creating, setCreating] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [deleting, setDeleting] = useState<Transaction | null>(null);
  const [filter, setFilter] = useState(NO_FILTERS);
  /** Month a transaction was just saved in, when it isn't the one on screen. */
  const [savedElsewhere, setSavedElsewhere] = useState<MonthKey | null>(null);

  if (status === "loading") {
    return <p className="text-sm text-ink-muted">Cargando tus movimientos...</p>;
  }
  if (status === "error") {
    return (
      <FormAlert message="No pudimos cargar tus movimientos. Recarga la página para intentar de nuevo." />
    );
  }

  const monthTransactions = transactionsOf(transactions, loadedMonth);
  const visible = monthTransactions.filter((transaction) => matchesFilter(transaction, filter));
  const filtering = filter.type !== "all" || filter.category !== "";

  function changeMonth(next: MonthKey) {
    // An open form belongs to the month it was opened in: its date started there
    setCreating(false);
    setEditingId(null);
    setSavedElsewhere(null);
    clearActionError();
    setMonth(next);
  }

  /** Runs a save and, if it landed in another month, says where it went. */
  async function save(input: TransactionInput, write: () => Promise<boolean>): Promise<boolean> {
    const ok = await write();
    if (ok) {
      const savedIn = monthOf(input.occurredOn);
      setSavedElsewhere(savedIn === month ? null : savedIn);
    }
    return ok;
  }

  return (
    <div className="flex flex-col gap-6">
      {actionError && <FormAlert message={actionError} />}

      <MonthNav month={month} thisMonth={thisMonth} onChange={changeMonth} />

      <div
        aria-busy={refreshing}
        className={`flex flex-col gap-6 transition-opacity ${refreshing ? "opacity-60" : ""}`}
      >
        <SummaryCards totals={totalsOf(monthTransactions)} />

        {creating ? (
          <section className="rounded-2xl border border-border bg-paper-elevated p-4">
            <h2 className="mb-3 font-display text-lg font-semibold text-ink">Nuevo movimiento</h2>
            <TransactionForm
              // Past months start on their last day, so the transaction lands in the month on screen
              defaultDate={month === thisMonth ? today : lastDayOf(month)}
              maxDate={today}
              submitLabel="Agregar movimiento"
              onSubmit={async (input) => {
                const ok = await save(input, () => addTransaction(input));
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
          <button
            type="button"
            onClick={() => setCreating(true)}
            className={outlineButtonClassName}
          >
            <PlusIcon className="h-4 w-4" />
            Nuevo movimiento
          </button>
        )}

        {savedElsewhere && (
          <p role="status" className="text-sm text-ink-muted">
            Guardado en {formatMonth(savedElsewhere)}. Cambia de mes para verlo.
          </p>
        )}

        <section className="flex flex-col gap-3">
          <h2 className="text-xs font-semibold uppercase tracking-widest text-ink-muted">
            Movimientos
          </h2>

          {monthTransactions.length > 0 && (
            <TransactionFilters filter={filter} onChange={setFilter} />
          )}

          {visible.length > 0 ? (
            <ul className={listClassName}>
              {visible.map((transaction) => (
                <TransactionItem
                  key={transaction.id}
                  transaction={transaction}
                  editing={editingId === transaction.id}
                  maxDate={today}
                  onStartEdit={() => setEditingId(transaction.id)}
                  onCancelEdit={() => {
                    setEditingId(null);
                    clearActionError();
                  }}
                  onSave={async (input) => {
                    const ok = await save(input, () => editTransaction(transaction.id, input));
                    if (ok) setEditingId(null);
                    return ok;
                  }}
                  onDelete={() => setDeleting(transaction)}
                />
              ))}
            </ul>
          ) : monthTransactions.length === 0 ? (
            <p className={emptyClassName}>
              Sin movimientos en {formatMonth(loadedMonth)}. Anota el primero.
            </p>
          ) : (
            <div className={`flex flex-col items-center gap-2 ${emptyClassName}`}>
              <p>Ningún movimiento coincide con los filtros.</p>
              {filtering && (
                <button
                  type="button"
                  onClick={() => setFilter(NO_FILTERS)}
                  className={ghostButtonClassName}
                >
                  Quitar filtros
                </button>
              )}
            </div>
          )}
        </section>
      </div>

      {deleting && (
        <ConfirmDialog
          title="¿Eliminar este movimiento?"
          message={`${categoryLabel(deleting.type, deleting.category)} · ${formatMoney(
            deleting.amount,
          )} · ${formatDateKey(deleting.occurredOn, {
            day: "numeric",
            month: "long",
            year: "numeric",
          })}. Esta acción no se puede deshacer.`}
          confirmLabel="Eliminar"
          onConfirm={async () => {
            await removeTransaction(deleting.id);
            setDeleting(null);
          }}
          onCancel={() => setDeleting(null)}
        />
      )}
    </div>
  );
}
