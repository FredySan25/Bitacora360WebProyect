"use client";

import { useState, type FormEvent } from "react";
import { ghostButtonClassName } from "@/core/components/buttonStyles";
import { SubmitButton } from "@/core/components/SubmitButton";
import { TextField } from "@/core/components/TextField";
import { GOAL_NAME_MAX_LENGTH, MAX_AMOUNT } from "../constants";
import type { SavingsGoalInput } from "../types";

type GoalFormProps = {
  /** Current values when editing; omit to create a new goal. */
  initial?: SavingsGoalInput;
  submitLabel: string;
  /** Resolves to true when saved; the parent is expected to close the form then. */
  onSubmit: (input: SavingsGoalInput) => Promise<boolean>;
  onCancel: () => void;
};

/** Name, target amount and optional deadline; used both to create and to edit a savings goal. */
export function GoalForm({ initial, submitLabel, onSubmit, onCancel }: GoalFormProps) {
  const [name, setName] = useState(initial?.name ?? "");
  const [targetAmount, setTargetAmount] = useState(initial ? String(initial.targetAmount) : "");
  const [targetDate, setTargetDate] = useState(initial?.targetDate ?? "");
  const [saving, setSaving] = useState(false);

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    setSaving(true);
    await onSubmit({
      name: name.trim(),
      targetAmount: Number(targetAmount),
      targetDate: targetDate || null,
    });
    setSaving(false);
  }

  return (
    <form onSubmit={handleSubmit} className="grid items-start gap-4 sm:grid-cols-2">
      <div className="sm:col-span-2">
        <TextField
          label="Nombre"
          placeholder="Fondo de emergencia"
          required
          // At least one character that isn't a space, as the database asks
          pattern=".*\S.*"
          title="Escribe un nombre para la meta."
          maxLength={GOAL_NAME_MAX_LENGTH}
          autoFocus
          disabled={saving}
          value={name}
          onChange={(e) => setName(e.target.value)}
        />
      </div>
      <TextField
        label="Monto objetivo"
        type="number"
        inputMode="decimal"
        placeholder="0.00"
        required
        min={0.01}
        max={MAX_AMOUNT}
        step={0.01}
        disabled={saving}
        value={targetAmount}
        onChange={(e) => setTargetAmount(e.target.value)}
      />
      <TextField
        label="Fecha objetivo (opcional)"
        type="date"
        disabled={saving}
        value={targetDate}
        onChange={(e) => setTargetDate(e.target.value)}
      />

      <div className="flex flex-wrap items-center gap-2 sm:col-span-2">
        <SubmitButton loading={saving} loadingLabel="Guardando...">
          {submitLabel}
        </SubmitButton>
        <button
          type="button"
          onClick={onCancel}
          disabled={saving}
          className={ghostButtonClassName}
        >
          Cancelar
        </button>
      </div>
    </form>
  );
}
