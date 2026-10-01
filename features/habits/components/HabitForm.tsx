"use client";

import { useState, type FormEvent, type ReactNode } from "react";
import { ghostButtonClassName } from "@/core/components/buttonStyles";
import { SubmitButton } from "@/core/components/SubmitButton";
import { TextField } from "@/core/components/TextField";
import type { HabitInput } from "../types";
import { ALL_WEEKDAYS, WEEKDAYS } from "../weekdays";

type HabitFormProps = {
  /** Current values when editing; omit to create a new habit. */
  initial?: HabitInput;
  submitLabel: string;
  /** Resolves to true when saved; the parent is expected to close the form then. */
  onSubmit: (input: HabitInput) => Promise<boolean>;
  onCancel: () => void;
  /** Extra actions shown at the end of the button row (e.g. archive, delete). */
  children?: ReactNode;
};

/** Name + scheduled weekdays, used both to create and to edit a habit. */
export function HabitForm({ initial, submitLabel, onSubmit, onCancel, children }: HabitFormProps) {
  const [name, setName] = useState(initial?.name ?? "");
  const [weekdays, setWeekdays] = useState(initial?.weekdays ?? ALL_WEEKDAYS);
  const [saving, setSaving] = useState(false);

  function toggleWeekday(value: number) {
    setWeekdays((prev) =>
      prev.includes(value) ? prev.filter((day) => day !== value) : [...prev, value],
    );
  }

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    if (weekdays.length === 0) return;

    setSaving(true);
    await onSubmit({ name: name.trim(), weekdays });
    setSaving(false);
  }

  return (
    <form onSubmit={handleSubmit} className="flex flex-col gap-4">
      <TextField
        label="Nombre"
        placeholder="Leer 20 minutos"
        required
        maxLength={80}
        autoFocus
        disabled={saving}
        value={name}
        onChange={(e) => setName(e.target.value)}
      />

      <fieldset className="flex flex-col gap-1.5" disabled={saving}>
        <legend className="mb-1.5 text-sm font-medium text-ink">Días</legend>
        <div className="flex flex-wrap gap-1.5">
          {WEEKDAYS.map((day) => {
            const selected = weekdays.includes(day.value);
            return (
              <button
                key={day.value}
                type="button"
                aria-pressed={selected}
                aria-label={day.name}
                onClick={() => toggleWeekday(day.value)}
                className={`h-9 w-9 rounded-full border text-xs font-semibold transition ${
                  selected
                    ? "border-accent bg-accent text-accent-foreground"
                    : "border-border bg-paper text-ink-muted hover:border-accent"
                }`}
              >
                {day.short}
              </button>
            );
          })}
        </div>
        {weekdays.length === 0 && (
          <p role="alert" className="text-xs text-accent">
            Elige al menos un día.
          </p>
        )}
      </fieldset>

      <div className="flex flex-wrap items-center gap-2">
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
        {children && <div className="ml-auto flex flex-wrap items-center gap-1">{children}</div>}
      </div>
    </form>
  );
}
