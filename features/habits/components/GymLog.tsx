"use client";

import { useState, type FormEvent } from "react";
import { outlineButtonClassName } from "@/core/components/buttonStyles";
import { FormAlert } from "@/core/components/FormAlert";
import {
  emptyStateClassName,
  ruledHeadingClassName,
  sectionHeadingClassName,
  sheetClassName,
} from "@/core/components/surfaces";
import { SubmitButton } from "@/core/components/SubmitButton";
import { TextField } from "@/core/components/TextField";
import { todayKey } from "@/core/lib/dates";
import { useWorkouts } from "../hooks/useWorkouts";
import type { Workout, WorkoutInput } from "../types";
import { ExerciseProgress } from "./ExerciseProgress";
import { WorkoutCard } from "./WorkoutCard";

/** Workouts shown at first, and how many more each "Ver más" reveals. */
const PAGE_SIZE = 5;

function NewWorkoutForm({ onSubmit }: { onSubmit: (input: WorkoutInput) => Promise<boolean> }) {
  const [today] = useState(todayKey);
  const [performedOn, setPerformedOn] = useState(today);
  const [title, setTitle] = useState("");
  const [saving, setSaving] = useState(false);

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    setSaving(true);
    const ok = await onSubmit({ performedOn, title: title.trim() || null });
    setSaving(false);
    if (ok) setTitle("");
  }

  return (
    <form
      onSubmit={handleSubmit}
      className={`grid items-end gap-4 ${sheetClassName} p-5 sm:grid-cols-[12rem_minmax(0,1fr)_auto]`}
    >
      <TextField
        label="Fecha"
        type="date"
        required
        max={today}
        disabled={saving}
        value={performedOn}
        onChange={(e) => setPerformedOn(e.target.value)}
      />
      <TextField
        label="Título (opcional)"
        placeholder="Pierna, empuje, cuerpo completo..."
        maxLength={60}
        disabled={saving}
        value={title}
        onChange={(e) => setTitle(e.target.value)}
      />
      <div className="flex flex-col">
        <SubmitButton loading={saving} loadingLabel="Creando...">
          Registrar entrenamiento
        </SubmitButton>
      </div>
    </form>
  );
}

/** Gym log: register workouts and their sets, and see each exercise's progress. */
export function GymLog() {
  const { status, exercises, workouts, actionError, addWorkout, removeWorkout, addSet, removeSet } =
    useWorkouts();
  const [visibleCount, setVisibleCount] = useState(PAGE_SIZE);

  if (status === "loading") {
    return <p className="text-ink-muted">Cargando tus entrenamientos...</p>;
  }
  if (status === "error") {
    return (
      <FormAlert message="No pudimos cargar tus entrenamientos. Recarga la página para intentar de nuevo." />
    );
  }

  function confirmDelete(workout: Workout) {
    const hasSets = workout.sets.length > 0;
    if (!hasSets || window.confirm("¿Eliminar este entrenamiento con todas sus series?")) {
      removeWorkout(workout.id);
    }
  }

  return (
    <div className="flex flex-col gap-8">
      {actionError && <FormAlert message={actionError} />}

      <NewWorkoutForm onSubmit={addWorkout} />

      <div className="grid gap-x-12 gap-y-8 lg:grid-cols-[minmax(0,3fr)_minmax(0,2fr)] lg:items-start">
      {workouts.length === 0 ? (
        <p className={emptyStateClassName}>
          Aún no registras entrenamientos. Crea el primero y agrega tus series.
        </p>
      ) : (
        <section>
          <h2 className={`mb-4 ${ruledHeadingClassName} md:text-[1.3125rem]`}>
            Entrenamientos
          </h2>
          <ul className="flex flex-col gap-5">
            {workouts.slice(0, visibleCount).map((workout) => (
              <WorkoutCard
                key={workout.id}
                workout={workout}
                exercises={exercises}
                onAddSet={(input) => addSet(workout.id, input)}
                onDeleteSet={(setId) => removeSet(workout.id, setId)}
                onDelete={() => confirmDelete(workout)}
              />
            ))}
          </ul>
          {workouts.length > visibleCount && (
            <button
              type="button"
              onClick={() => setVisibleCount((count) => count + PAGE_SIZE)}
              className={`mx-auto mt-4 ${outlineButtonClassName}`}
            >
              Ver más
            </button>
          )}
        </section>
      )}

      {workouts.some((workout) => workout.sets.length > 0) && (
        <section className={`${sheetClassName} p-5 md:p-6`}>
          <h2 className={`mb-4 ${sectionHeadingClassName} md:text-[1.3125rem]`}>
            Progreso por ejercicio
          </h2>
          <ExerciseProgress exercises={exercises} workouts={workouts} />
        </section>
      )}
      </div>
    </div>
  );
}
