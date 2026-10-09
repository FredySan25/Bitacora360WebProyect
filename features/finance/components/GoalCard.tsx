"use client";

import { useState, type FormEvent } from "react";
import { iconButtonClassName } from "@/core/components/buttonStyles";
import { CheckIcon, CloseIcon, PencilIcon, TrashIcon } from "@/core/components/icons";
import { SubmitButton } from "@/core/components/SubmitButton";
import { TextField } from "@/core/components/TextField";
import { formatDateKey, monthOf, type DateKey } from "@/core/lib/dates";
import { MAX_AMOUNT } from "../constants";
import { formatMoney, formatPercent } from "../format";
import { savedTowards, sumAmounts } from "../stats";
import type {
  ContributionInput,
  SavingsContribution,
  SavingsGoal,
  SavingsGoalInput,
} from "../types";
import { GoalForm } from "./GoalForm";

/** Whole months from the month of `from` to the month of `to`. */
function monthsBetween(from: DateKey, to: DateKey): number {
  const [fromYear, fromMonth] = monthOf(from).split("-").map(Number);
  const [toYear, toMonth] = monthOf(to).split("-").map(Number);
  return (toYear - fromYear) * 12 + (toMonth - fromMonth);
}

function formatDay(day: DateKey): string {
  return formatDateKey(day, { day: "numeric", month: "short", year: "numeric" });
}

/** What the deadline asks for: how much to set aside each month, or that it already passed. */
function deadlineHint(goal: SavingsGoal, remaining: number, today: DateKey): string | null {
  if (!goal.targetDate || remaining <= 0) return null;
  if (goal.targetDate < today) return "La fecha objetivo ya pasó.";

  const months = Math.max(1, monthsBetween(today, goal.targetDate));
  return `Ahorra ${formatMoney(Math.ceil((remaining / months) * 100) / 100)} al mes para llegar a tiempo.`;
}

type GoalCardProps = {
  goal: SavingsGoal;
  today: DateKey;
  editing: boolean;
  onStartEdit: () => void;
  onCancelEdit: () => void;
  onSave: (input: SavingsGoalInput) => Promise<boolean>;
  onDelete: () => void;
  onContribute: (input: ContributionInput) => Promise<boolean>;
  onDeleteContribution: (contribution: SavingsContribution) => void;
};

/** One savings goal: how far it is, a form to add a contribution, and the contributions so far. */
export function GoalCard({
  goal,
  today,
  editing,
  onStartEdit,
  onCancelEdit,
  onSave,
  onDelete,
  onContribute,
  onDeleteContribution,
}: GoalCardProps) {
  const [amount, setAmount] = useState("");
  const [contributedOn, setContributedOn] = useState(today);
  const [saving, setSaving] = useState(false);

  const cardClassName =
    "rounded-2xl border border-border bg-paper-elevated p-5 shadow-[0_1px_2px_rgba(43,36,24,0.05)]";

  if (editing) {
    return (
      <li className={cardClassName}>
        <GoalForm
          initial={goal}
          submitLabel="Guardar"
          onSubmit={onSave}
          onCancel={onCancelEdit}
        />
      </li>
    );
  }

  const saved = savedTowards(goal);
  const remaining = sumAmounts([goal.targetAmount, -saved]);
  const reached = remaining <= 0;
  // Never "100 %" before the goal is actually reached
  const percent = reached ? 100 : Math.floor((saved / goal.targetAmount) * 100);
  const hint = deadlineHint(goal, remaining, today);

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    setSaving(true);
    const ok = await onContribute({ amount: Number(amount), contributedOn });
    setSaving(false);
    if (ok) setAmount("");
  }

  return (
    <li className={cardClassName}>
      <header className="flex items-start gap-2">
        <div className="min-w-0 flex-1">
          <h3 className="truncate font-display text-lg font-semibold text-ink">{goal.name}</h3>
          {goal.targetDate && (
            <p className="text-xs text-ink-muted">Para el {formatDay(goal.targetDate)}</p>
          )}
        </div>
        <button
          type="button"
          onClick={onStartEdit}
          aria-label={`Editar meta ${goal.name}`}
          className={iconButtonClassName}
        >
          <PencilIcon className="h-4 w-4" />
        </button>
        <button
          type="button"
          onClick={onDelete}
          aria-label={`Eliminar meta ${goal.name}`}
          className={iconButtonClassName}
        >
          <TrashIcon className="h-4 w-4" />
        </button>
      </header>

      <p className="mt-3 text-2xl font-semibold text-ink">
        {formatMoney(saved)}{" "}
        <span className="text-sm font-normal text-ink-muted">
          de {formatMoney(goal.targetAmount)}
        </span>
      </p>
      <div
        role="progressbar"
        aria-label={`Avance de ${goal.name}`}
        aria-valuemin={0}
        aria-valuemax={100}
        aria-valuenow={percent}
        aria-valuetext={formatPercent(percent)}
        className="mt-2 h-2 overflow-hidden rounded-full bg-accent/20"
      >
        <div
          className="h-full rounded-full bg-accent transition-[width]"
          style={{ width: `${percent}%` }}
        />
      </div>
      <p className="mt-1.5 flex flex-wrap items-center gap-x-1 text-xs text-ink-muted">
        <span>{formatPercent(percent)} ·</span>
        {reached ? (
          <span className="inline-flex items-center gap-1 font-medium text-ink">
            <CheckIcon className="h-3.5 w-3.5 text-positive" />
            Meta cumplida
          </span>
        ) : (
          <span>Te faltan {formatMoney(remaining)}</span>
        )}
      </p>
      {hint && <p className="mt-0.5 text-xs text-ink-muted">{hint}</p>}

      <form
        onSubmit={handleSubmit}
        className="mt-4 grid grid-cols-2 items-end gap-3 border-t border-border pt-4 sm:grid-cols-[minmax(0,1fr)_10rem_auto]"
      >
        <TextField
          label="Aporte"
          type="number"
          inputMode="decimal"
          placeholder="0.00"
          required
          min={0.01}
          max={MAX_AMOUNT}
          step={0.01}
          disabled={saving}
          value={amount}
          onChange={(e) => setAmount(e.target.value)}
        />
        <TextField
          label="Fecha"
          type="date"
          required
          max={today}
          disabled={saving}
          value={contributedOn}
          onChange={(e) => setContributedOn(e.target.value)}
        />
        <div className="col-span-2 flex flex-col sm:col-span-1">
          <SubmitButton loading={saving} loadingLabel="Guardando...">
            Aportar
          </SubmitButton>
        </div>
      </form>

      {goal.contributions.length > 0 && (
        <details className="mt-4">
          <summary className="cursor-pointer text-sm font-medium text-ink-muted hover:text-ink">
            Aportes ({goal.contributions.length})
          </summary>
          <ul className="mt-2 divide-y divide-border">
            {goal.contributions.map((contribution) => (
              <li key={contribution.id} className="flex items-center gap-2 py-1.5 text-sm">
                <span className="flex-1 text-ink-muted">
                  {formatDay(contribution.contributedOn)}
                </span>
                <span className="font-medium tabular-nums text-ink">
                  {formatMoney(contribution.amount)}
                </span>
                <button
                  type="button"
                  onClick={() => onDeleteContribution(contribution)}
                  aria-label={`Eliminar aporte de ${formatMoney(contribution.amount)} del ${formatDay(
                    contribution.contributedOn,
                  )}`}
                  className={iconButtonClassName}
                >
                  <CloseIcon className="h-3.5 w-3.5" />
                </button>
              </li>
            ))}
          </ul>
        </details>
      )}
    </li>
  );
}
