"use client";

import { useState, type FormEvent } from "react";
import { ghostButtonClassName } from "@/core/components/buttonStyles";
import { SelectField } from "@/core/components/SelectField";
import { SubmitButton } from "@/core/components/SubmitButton";
import { TextField } from "@/core/components/TextField";
import { formatMonth, type MonthKey } from "@/core/lib/dates";
import { MAX_AMOUNT, type Category } from "../constants";

type BudgetFormProps = {
  /** Categories to choose from. When editing it's the budget's own, and it can't be changed. */
  categories: Category[];
  /** Current limit when editing; omit to create a budget. */
  initialLimit?: number;
  /** Month the limit starts to apply. */
  month: MonthKey;
  submitLabel: string;
  /** Resolves to true when saved; the parent is expected to close the form then. */
  onSubmit: (category: string, monthlyLimit: number) => Promise<boolean>;
  onCancel: () => void;
};

/** Category and monthly limit; used both to create a budget and to change its limit. */
export function BudgetForm({
  categories,
  initialLimit,
  month,
  submitLabel,
  onSubmit,
  onCancel,
}: BudgetFormProps) {
  const editing = initialLimit !== undefined;
  const [category, setCategory] = useState(categories[0].key);
  const [limit, setLimit] = useState(editing ? String(initialLimit) : "");
  const [saving, setSaving] = useState(false);

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    setSaving(true);
    await onSubmit(category, Number(limit));
    setSaving(false);
  }

  return (
    <form onSubmit={handleSubmit} className="grid items-start gap-4 sm:grid-cols-2">
      <SelectField
        label="Categoría"
        required
        disabled={saving || editing}
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
        label="Límite mensual"
        type="number"
        inputMode="decimal"
        placeholder="0.00"
        hint={`Aplica desde ${formatMonth(month)} en adelante.`}
        required
        min={0.01}
        max={MAX_AMOUNT}
        step={0.01}
        autoFocus
        disabled={saving}
        value={limit}
        onChange={(e) => setLimit(e.target.value)}
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
