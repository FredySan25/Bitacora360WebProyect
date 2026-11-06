"use client";

import { ModuleCard, ModuleCardEmpty } from "@/core/components/ModuleCard";
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
    <ModuleCard title="Hábitos" href="/habits" framed>
      {status === "loading" && <p className="text-ink-muted">Cargando...</p>}

      {status === "error" && <p className="text-ink-muted">No pudimos cargar tus hábitos.</p>}

      {status === "ready" && habits.length === 0 && (
        <ModuleCardEmpty
          message="Aún no registras hábitos. Empieza con uno pequeño."
          actionLabel="+ Crear hábito"
          actionHref="/habits"
        />
      )}

      {status === "ready" && habits.length > 0 && scheduled.length === 0 && (
        <p className="font-display text-xl leading-snug text-ink">
          Hoy no toca ningún hábito. Día libre.
        </p>
      )}

      {status === "ready" && scheduled.length > 0 && (
        <div className="flex flex-col gap-4">
          <div className="flex flex-col gap-3">
            <p className="text-lg text-ink-muted tabular-nums">
              <span className="font-display text-5xl leading-none font-bold text-ink">
                {doneCount}
              </span>{" "}
              de {scheduled.length}
            </p>
            {/* One segment per habit; the count above carries the meaning */}
            <div aria-hidden="true" className="flex gap-1">
              {scheduled.map((habit) => (
                <span
                  key={habit.id}
                  className={`h-2 flex-1 rounded-sm transition-colors ${
                    isDone(habit.id) ? "bg-accent" : "bg-rule"
                  }`}
                />
              ))}
            </div>
          </div>

          <ul className="divide-y divide-rule">
            {scheduled.slice(0, MAX_LISTED).map((habit) => (
              <li key={habit.id} className="flex items-center gap-3.5 py-2.5">
                <HabitCheckbox
                  checked={isDone(habit.id)}
                  label={habit.name}
                  onToggle={() => toggleCompletion(habit.id, today)}
                />
                <span
                  className={`truncate text-[1.0625rem] ${
                    isDone(habit.id) ? "text-ink-muted line-through" : "text-ink"
                  }`}
                >
                  {habit.name}
                </span>
              </li>
            ))}
          </ul>

          {scheduled.length > MAX_LISTED && (
            <p className="text-sm text-ink-muted">
              y {scheduled.length - MAX_LISTED} más en Hábitos
            </p>
          )}
        </div>
      )}
    </ModuleCard>
  );
}
