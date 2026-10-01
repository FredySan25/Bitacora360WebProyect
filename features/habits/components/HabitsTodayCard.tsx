"use client";

import { ModuleCard, ModuleCardEmpty } from "@/core/components/ModuleCard";
import { HabitsIcon } from "@/core/components/icons";
import { useHabits } from "../hooks/useHabits";
import { completionKey, isScheduledOn } from "../stats";
import { HabitCheckbox } from "./HabitCheckbox";

/** Habits listed on the card; the rest are one tap away on /habits. */
const MAX_LISTED = 5;

/** Today's habits summary for the Today page, with quick check-offs. */
export function HabitsTodayCard() {
  const { status, habits, completions, today, toggleCompletion } = useHabits();

  const scheduled = habits.filter((habit) => isScheduledOn(habit, today));
  const isDone = (habitId: string) => completions.has(completionKey(habitId, today));
  const doneCount = scheduled.filter((habit) => isDone(habit.id)).length;

  return (
    <ModuleCard title="Hábitos" icon={<HabitsIcon />} href="/habits">
      {status === "loading" && <p className="text-sm text-ink-muted">Cargando...</p>}

      {status === "error" && (
        <p className="text-sm text-ink-muted">No pudimos cargar tus hábitos.</p>
      )}

      {status === "ready" && habits.length === 0 && (
        <ModuleCardEmpty
          message="Aún no registras hábitos. Empieza con uno pequeño."
          actionLabel="+ Crear hábito"
          actionHref="/habits"
        />
      )}

      {status === "ready" && habits.length > 0 && scheduled.length === 0 && (
        <p className="font-display text-lg leading-snug text-ink">
          Hoy no toca ningún hábito. Día libre.
        </p>
      )}

      {status === "ready" && scheduled.length > 0 && (
        <div className="flex flex-col gap-4">
          <div>
            <p className="text-2xl font-semibold text-ink">
              {doneCount} de {scheduled.length}
            </p>
            <div className="mt-2 h-1.5 overflow-hidden rounded-full bg-accent/20">
              <div
                className="h-full rounded-full bg-accent transition-[width]"
                style={{ width: `${(doneCount / scheduled.length) * 100}%` }}
              />
            </div>
          </div>

          <ul className="flex flex-col gap-2">
            {scheduled.slice(0, MAX_LISTED).map((habit) => (
              <li key={habit.id} className="flex items-center gap-2.5">
                <HabitCheckbox
                  checked={isDone(habit.id)}
                  label={habit.name}
                  onToggle={() => toggleCompletion(habit.id, today)}
                />
                <span
                  className={`truncate text-sm ${
                    isDone(habit.id) ? "text-ink-muted line-through" : "text-ink"
                  }`}
                >
                  {habit.name}
                </span>
              </li>
            ))}
          </ul>

          {scheduled.length > MAX_LISTED && (
            <p className="text-xs text-ink-muted">
              y {scheduled.length - MAX_LISTED} más en Hábitos
            </p>
          )}
        </div>
      )}
    </ModuleCard>
  );
}
