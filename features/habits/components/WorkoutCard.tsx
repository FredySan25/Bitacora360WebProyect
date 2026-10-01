"use client";

import { useId, useState, type FormEvent } from "react";
import { iconButtonClassName } from "@/core/components/buttonStyles";
import { CloseIcon, TrashIcon } from "@/core/components/icons";
import { SubmitButton } from "@/core/components/SubmitButton";
import { TextField } from "@/core/components/TextField";
import { formatDateKey } from "../dates";
import { formatSet } from "../format";
import type { Exercise, Workout, WorkoutSet, WorkoutSetInput } from "../types";

type WorkoutCardProps = {
  workout: Workout;
  /** The user's exercise catalog, for names and suggestions. */
  exercises: Exercise[];
  onAddSet: (input: WorkoutSetInput) => Promise<boolean>;
  onDeleteSet: (setId: string) => void;
  onDelete: () => void;
};

/** Groups a workout's sets by exercise, in the order each exercise first appears. */
function groupByExercise(sets: WorkoutSet[]): { exerciseId: string; sets: WorkoutSet[] }[] {
  const groups = new Map<string, WorkoutSet[]>();
  for (const set of sets) {
    const group = groups.get(set.exerciseId);
    if (group) group.push(set);
    else groups.set(set.exerciseId, [set]);
  }
  return [...groups.entries()].map(([exerciseId, groupSets]) => ({ exerciseId, sets: groupSets }));
}

/** One training session: its sets by exercise, and a form to log the next set. */
export function WorkoutCard({ workout, exercises, onAddSet, onDeleteSet, onDelete }: WorkoutCardProps) {
  const suggestionsId = useId();
  const [exerciseName, setExerciseName] = useState("");
  const [reps, setReps] = useState("");
  const [weight, setWeight] = useState("");
  const [saving, setSaving] = useState(false);

  const exerciseNames = new Map(exercises.map((exercise) => [exercise.id, exercise.name]));
  const groups = groupByExercise(workout.sets);

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    setSaving(true);
    // The fields keep their values so the next set of the same exercise is one tap away
    await onAddSet({
      exerciseName,
      reps: Number(reps),
      weightKg: weight === "" ? 0 : Number(weight),
    });
    setSaving(false);
  }

  return (
    <li className="rounded-2xl border border-border bg-paper-elevated p-5 shadow-[0_1px_2px_rgba(43,36,24,0.05)]">
      <header className="mb-4 flex items-start justify-between gap-3">
        <div className="min-w-0">
          <h3 className="truncate font-display text-lg font-semibold text-ink first-letter:uppercase">
            {workout.title ?? "Entrenamiento"}
          </h3>
          <p className="text-xs text-ink-muted first-letter:uppercase">
            {formatDateKey(workout.performedOn, {
              weekday: "long",
              day: "numeric",
              month: "long",
              year: "numeric",
            })}
          </p>
        </div>
        <button
          type="button"
          onClick={onDelete}
          aria-label="Eliminar entrenamiento"
          className={iconButtonClassName}
        >
          <TrashIcon className="h-4 w-4" />
        </button>
      </header>

      {groups.length === 0 ? (
        <p className="mb-4 text-sm text-ink-muted">Aún no hay series. Registra la primera.</p>
      ) : (
        <div className="mb-5 flex flex-col gap-3">
          {groups.map((group) => (
            <div key={group.exerciseId}>
              <h4 className="mb-1.5 text-sm font-medium text-ink">
                {exerciseNames.get(group.exerciseId) ?? "Ejercicio"}
              </h4>
              <ul className="flex flex-wrap gap-1.5">
                {group.sets.map((set) => (
                  <li
                    key={set.id}
                    className="flex items-center rounded-lg border border-border bg-paper pl-2.5 text-sm tabular-nums text-ink"
                  >
                    {formatSet(set)}
                    <button
                      type="button"
                      onClick={() => onDeleteSet(set.id)}
                      aria-label={`Eliminar serie ${formatSet(set)}`}
                      className="ml-0.5 flex h-7 w-7 items-center justify-center rounded-md text-ink-muted transition hover:text-ink"
                    >
                      <CloseIcon className="h-3.5 w-3.5" />
                    </button>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>
      )}

      <form
        onSubmit={handleSubmit}
        className="grid grid-cols-2 items-end gap-3 border-t border-border pt-4 sm:grid-cols-[minmax(0,1fr)_5.5rem_6.5rem_auto]"
      >
        <div className="col-span-2 sm:col-span-1">
          <TextField
            label="Ejercicio"
            placeholder="Sentadilla"
            list={suggestionsId}
            autoComplete="off"
            required
            maxLength={60}
            disabled={saving}
            value={exerciseName}
            onChange={(e) => setExerciseName(e.target.value)}
          />
          <datalist id={suggestionsId}>
            {exercises.map((exercise) => (
              <option key={exercise.id} value={exercise.name} />
            ))}
          </datalist>
        </div>
        <TextField
          label="Reps"
          type="number"
          inputMode="numeric"
          placeholder="10"
          required
          min={1}
          max={1000}
          step={1}
          disabled={saving}
          value={reps}
          onChange={(e) => setReps(e.target.value)}
        />
        <TextField
          label="Peso (kg)"
          type="number"
          inputMode="decimal"
          placeholder="0"
          min={0}
          max={9999}
          step={0.25}
          disabled={saving}
          value={weight}
          onChange={(e) => setWeight(e.target.value)}
        />
        <div className="col-span-2 flex flex-col sm:col-span-1">
          <SubmitButton loading={saving} loadingLabel="Guardando...">
            Agregar serie
          </SubmitButton>
        </div>
      </form>
    </li>
  );
}
