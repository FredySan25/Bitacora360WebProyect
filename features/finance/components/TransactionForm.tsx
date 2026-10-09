"use client";

import { useId, useState, type FormEvent } from "react";
import { ghostButtonClassName } from "@/core/components/buttonStyles";
import { SelectField } from "@/core/components/SelectField";
import { SubmitButton } from "@/core/components/SubmitButton";
import { TextField } from "@/core/components/TextField";
import type { DateKey } from "@/core/lib/dates";
import { MAX_AMOUNT, NOTE_MAX_LENGTH, TRANSACTION_TYPES, categoriesOf } from "../constants";
import type { TransactionInput, TransactionType } from "../types";

type TransactionFormProps = {
  /** Current values when editing; omit to register a new transaction. */
  initial?: TransactionInput;
  /** Day a new transaction starts on. */
  defaultDate: DateKey;
  /** Latest day accepted: today. */
  maxDate: DateKey;
  submitLabel: string;
  /** Resolves to true when saved; the parent is expected to close the form then. */
  onSubmit: (input: TransactionInput) => Promise<boolean>;
  onCancel: () => void;
};

/** Type, amount, category, date and note; used both to register and to edit a transaction. */
export function TransactionForm({
  initial,
  defaultDate,
  maxDate,
  submitLabel,
  onSubmit,
  onCancel,
}: TransactionFormProps) {
  const typeName = useId();
  const [type, setType] = useState<TransactionType>(initial?.type ?? "expense");
  const [category, setCategory] = useState(initial?.category ?? categoriesOf("expense")[0].key);
  const [amount, setAmount] = useState(initial ? String(initial.amount) : "");
  const [occurredOn, setOccurredOn] = useState(initial?.occurredOn ?? defaultDate);
  const [note, setNote] = useState(initial?.note ?? "");
  const [saving, setSaving] = useState(false);

  const categories = categoriesOf(type);

  function changeType(next: TransactionType) {
    setType(next);
    // Each type has its own categories; keep the choice only if the other type has it too
    const options = categoriesOf(next);
    if (!options.some((option) => option.key === category)) setCategory(options[0].key);
  }

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    setSaving(true);
    await onSubmit({
      type,
      category,
      amount: Number(amount),
      occurredOn,
      note: note.trim() || null,
    });
    setSaving(false);
  }

  return (
    <form onSubmit={handleSubmit} className="grid gap-4 sm:grid-cols-2">
      <fieldset className="sm:col-span-2" disabled={saving}>
        <legend className="mb-1.5 text-sm font-medium text-ink">Tipo</legend>
        <div className="inline-flex gap-1 rounded-xl border border-border bg-paper p-1">
          {TRANSACTION_TYPES.map((option) => (
            <label
              key={option.value}
              className={`relative rounded-lg px-3.5 py-1.5 text-sm font-medium transition has-focus-visible:outline-2 has-focus-visible:outline-offset-2 has-focus-visible:outline-accent ${
                type === option.value
                  ? "bg-accent/10 text-accent"
                  : "text-ink-muted hover:bg-ink/5 hover:text-ink"
              }`}
            >
              {/* Covers the whole pill, so a click anywhere on it lands on the radio */}
              <input
                type="radio"
                name={typeName}
                value={option.value}
                checked={type === option.value}
                onChange={() => changeType(option.value)}
                className="absolute inset-0 cursor-pointer opacity-0"
              />
              {option.label}
            </label>
          ))}
        </div>
      </fieldset>

      <TextField
        label="Monto"
        type="number"
        inputMode="decimal"
        placeholder="0.00"
        required
        min={0.01}
        max={MAX_AMOUNT}
        step={0.01}
        autoFocus
        disabled={saving}
        value={amount}
        onChange={(e) => setAmount(e.target.value)}
      />
      <SelectField
        label="Categoría"
        required
        disabled={saving}
        value={category}
        onChange={(e) => setCategory(e.target.value)}
      >
        {categories.map((option) => (
          <option key={option.key} value={option.key}>
            {option.label}
          </option>
        ))}
      </SelectField>
      <TextField
        label="Fecha"
        type="date"
        required
        max={maxDate}
        disabled={saving}
        value={occurredOn}
        onChange={(e) => setOccurredOn(e.target.value)}
      />
      <TextField
        label="Nota (opcional)"
        placeholder="Súper de la semana"
        maxLength={NOTE_MAX_LENGTH}
        disabled={saving}
        value={note}
        onChange={(e) => setNote(e.target.value)}
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
