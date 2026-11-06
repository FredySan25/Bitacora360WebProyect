"use client";

import { useState } from "react";
import {
  ghostButtonClassName,
  iconButtonClassName,
  outlineButtonClassName,
} from "@/core/components/buttonStyles";
import { FormAlert } from "@/core/components/FormAlert";
import {
  emptyStateClassName,
  listSheetClassName,
  ruledHeadingClassName,
  sheetClassName,
} from "@/core/components/surfaces";
import { ChevronLeftIcon, ChevronRightIcon, PlusIcon } from "@/core/components/icons";
import { addDays, formatDateKey } from "@/core/lib/dates";
import { useHabits } from "../hooks/useHabits";
import { completionKey, currentStreak, isScheduledOn } from "../stats";
import type { DateKey, Habit } from "../types";
import { HabitForm } from "./HabitForm";
import { HabitItem } from "./HabitItem";
import { ProgressRing } from "./ProgressRing";

/** The day's habits: one sheet, a ruled row per habit. */
const cardListClassName = `${listSheetClassName} px-5`;

function dayTitle(day: DateKey, today: DateKey): string {
  if (day === today) return "Hoy";
  if (day === addDays(today, -1)) return "Ayer";
  return formatDateKey(day, { weekday: "long" });
}

type DayNavProps = {
  day: DateKey;
  today: DateKey;
  /** Earliest day that can be shown. */
  min: DateKey;
  onChange: (day: DateKey) => void;
};

/** Steps one day back or forward, never past today. */
function DayNav({ day, today, min, onChange }: DayNavProps) {
  return (
    <div className="flex items-center gap-1">
      <button
        type="button"
        aria-label="Día anterior"
        disabled={day <= min}
        onClick={() => onChange(addDays(day, -1))}
        className={iconButtonClassName}
      >
        <ChevronLeftIcon className="h-5 w-5" />
      </button>
      <div className="min-w-36 text-center" aria-live="polite">
        <p className="font-display text-[1.75rem] leading-tight font-bold text-ink first-letter:uppercase">
          {dayTitle(day, today)}
        </p>
        <p className="text-sm text-ink-muted">
          {formatDateKey(day, { day: "numeric", month: "long" })}
        </p>
      </div>
      <button
        type="button"
        aria-label="Día siguiente"
        disabled={day >= today}
        onClick={() => onChange(addDays(day, 1))}
        className={iconButtonClassName}
      >
        <ChevronRightIcon className="h-5 w-5" />
      </button>
    </div>
  );
}

/** Daily checklist plus habit management (create, edit, archive, delete). */
export function HabitsBoard() {
  const {
    status,
    habits,
    archivedHabits,
    completions,
    today,
    since,
    actionError,
    toggleCompletion,
    addHabit,
    editHabit,
    archiveHabit,
    restoreHabit,
    removeHabit,
  } = useHabits();

  // null follows "today"
  const [pickedDay, setPickedDay] = useState<DateKey | null>(null);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [creating, setCreating] = useState(false);

  if (status === "loading") {
    return <p className="text-sm text-ink-muted">Cargando tus hábitos...</p>;
  }
  if (status === "error") {
    return (
      <FormAlert message="No pudimos cargar tus hábitos. Recarga la página para intentar de nuevo." />
    );
  }

  const day = pickedDay ?? today;
  const scheduled = habits.filter((habit) => isScheduledOn(habit, day));
  const unscheduled = habits.filter((habit) => !isScheduledOn(habit, day));
  const doneCount = scheduled.filter((habit) => completions.has(completionKey(habit.id, day))).length;

  function confirmDelete(habit: Habit) {
    const confirmed = window.confirm(
      `¿Eliminar "${habit.name}" y todo su historial? Esta acción no se puede deshacer.`,
    );
    if (confirmed) removeHabit(habit.id);
  }

  function renderItem(habit: Habit, isScheduled: boolean) {
    return (
      <HabitItem
        key={habit.id}
        habit={habit}
        streak={currentStreak(habit, completions, since, today)}
        checked={isScheduled ? completions.has(completionKey(habit.id, day)) : undefined}
        editing={editingId === habit.id}
        onToggle={() => toggleCompletion(habit.id, day)}
        onStartEdit={() => setEditingId(habit.id)}
        onCancelEdit={() => setEditingId(null)}
        onSave={async (input) => {
          const ok = await editHabit(habit.id, input);
          if (ok) setEditingId(null);
          return ok;
        }}
        onArchive={() => {
          setEditingId(null);
          archiveHabit(habit.id);
        }}
        onDelete={() => confirmDelete(habit)}
      />
    );
  }

  return (
    <div className="flex flex-col gap-6">
      {actionError && <FormAlert message={actionError} />}

      <div className="grid gap-x-12 gap-y-8 lg:grid-cols-[minmax(0,3fr)_minmax(0,2fr)] lg:items-start">
      <section>
        <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
          <DayNav
            day={day}
            today={today}
            min={since}
            onChange={(next) => setPickedDay(next === today ? null : next)}
          />
          {scheduled.length > 0 && (
            <div className="flex items-center gap-3">
              <p className="text-[0.9375rem] text-ink-muted tabular-nums">
                <span className="font-display text-[1.75rem] font-bold text-ink">{doneCount}</span> de{" "}
                {scheduled.length}
              </p>
              <ProgressRing done={doneCount} total={scheduled.length} />
            </div>
          )}
        </div>

        {scheduled.length > 0 ? (
          <ul className={cardListClassName}>{scheduled.map((habit) => renderItem(habit, true))}</ul>
        ) : (
          <p className={emptyStateClassName}>
            {habits.length === 0
              ? "Aún no tienes hábitos. Empieza con uno pequeño."
              : "No hay hábitos programados para este día."}
          </p>
        )}
      </section>

      <div className="flex flex-col gap-7 lg:pt-2">
      {unscheduled.length > 0 && (
        <section>
          <h2 className={`mb-1 ${ruledHeadingClassName} md:text-[1.3125rem]`}>
            Otros días
          </h2>
          <ul className="divide-y divide-rule">
            {unscheduled.map((habit) => renderItem(habit, false))}
          </ul>
        </section>
      )}

      {creating ? (
        <section className={`${sheetClassName} p-5`}>
          <h2 className="mb-4 font-display text-[1.3125rem] font-bold text-ink">Nuevo hábito</h2>
          <HabitForm
            submitLabel="Crear hábito"
            onSubmit={async (input) => {
              const ok = await addHabit(input);
              if (ok) setCreating(false);
              return ok;
            }}
            onCancel={() => setCreating(false)}
          />
        </section>
      ) : (
        <button type="button" onClick={() => setCreating(true)} className={outlineButtonClassName}>
          <PlusIcon className="h-4 w-4" />
          Nuevo hábito
        </button>
      )}

      {archivedHabits.length > 0 && (
        <details>
          <summary className="flex min-h-11 cursor-pointer items-center text-[0.9375rem] font-bold text-ink-muted hover:text-ink">
            Archivados ({archivedHabits.length})
          </summary>
          <ul className="divide-y divide-rule border-t border-rule">
            {archivedHabits.map((habit) => (
              <li key={habit.id} className="flex flex-wrap items-center gap-1 py-1.5">
                <p className="min-w-0 flex-1 truncate text-ink-muted">{habit.name}</p>
                <button
                  type="button"
                  onClick={() => restoreHabit(habit.id)}
                  className={ghostButtonClassName}
                >
                  Restaurar
                </button>
                <button
                  type="button"
                  onClick={() => confirmDelete(habit)}
                  className={ghostButtonClassName}
                >
                  Eliminar
                </button>
              </li>
            ))}
          </ul>
        </details>
      )}
      </div>
      </div>
    </div>
  );
}
