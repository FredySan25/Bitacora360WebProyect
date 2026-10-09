"use client";

import { iconButtonClassName } from "@/core/components/buttonStyles";
import { PencilIcon, TrashIcon } from "@/core/components/icons";
import { formatDateKey, type DateKey } from "@/core/lib/dates";
import { categoryLabel } from "../constants";
import { formatMoney } from "../format";
import type { Transaction, TransactionInput } from "../types";
import { TransactionForm } from "./TransactionForm";

type TransactionItemProps = {
  transaction: Transaction;
  editing: boolean;
  /** Latest day the form accepts: today. */
  maxDate: DateKey;
  onStartEdit: () => void;
  onCancelEdit: () => void;
  onSave: (input: TransactionInput) => Promise<boolean>;
  onDelete: () => void;
};

/** One transaction row: its category, day, note and amount, or the form to edit it. */
export function TransactionItem({
  transaction,
  editing,
  maxDate,
  onStartEdit,
  onCancelEdit,
  onSave,
  onDelete,
}: TransactionItemProps) {
  if (editing) {
    return (
      <li className="px-4 py-4">
        <TransactionForm
          initial={transaction}
          defaultDate={transaction.occurredOn}
          maxDate={maxDate}
          submitLabel="Guardar"
          onSubmit={onSave}
          onCancel={onCancelEdit}
        />
      </li>
    );
  }

  const isIncome = transaction.type === "income";

  return (
    <li className="flex items-center gap-2 px-4 py-3">
      <div className="min-w-0 flex-1">
        <p className="truncate font-medium text-ink">
          {categoryLabel(transaction.type, transaction.category)}
        </p>
        <p className="truncate text-xs text-ink-muted">
          {formatDateKey(transaction.occurredOn, { day: "numeric", month: "short" })}
          {transaction.note && ` · ${transaction.note}`}
        </p>
      </div>

      {/* The sign tells income from expense; the color only reinforces it */}
      <p
        className={`shrink-0 text-sm font-semibold tabular-nums ${
          isIncome ? "text-positive" : "text-ink"
        }`}
      >
        <span className="sr-only">{isIncome ? "Ingreso: " : "Gasto: "}</span>
        {isIncome ? "+" : "−"}
        {formatMoney(transaction.amount)}
      </p>

      <button
        type="button"
        onClick={onStartEdit}
        aria-label="Editar movimiento"
        className={iconButtonClassName}
      >
        <PencilIcon className="h-4 w-4" />
      </button>
      <button
        type="button"
        onClick={onDelete}
        aria-label="Eliminar movimiento"
        className={iconButtonClassName}
      >
        <TrashIcon className="h-4 w-4" />
      </button>
    </li>
  );
}
