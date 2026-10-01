"use client";

import { useId, useState } from "react";
import { inputClassName } from "@/core/components/TextField";
import { daysBetween, formatDateKey } from "../dates";
import { formatNumber, formatSet } from "../format";
import type { DateKey, Exercise, Workout, WorkoutSet } from "../types";

/** Most recent sessions plotted. */
const MAX_POINTS = 20;

type SessionPoint = {
  day: DateKey;
  /** Heaviest set of the exercise that day (most reps on a tie). */
  top: WorkoutSet;
};

function isBetterSet(candidate: WorkoutSet, current: WorkoutSet): boolean {
  if (candidate.weightKg !== current.weightKg) return candidate.weightKg > current.weightKg;
  return candidate.reps > current.reps;
}

/** One point per day the exercise was trained, oldest first. */
function sessionPoints(workouts: Workout[], exerciseId: string): SessionPoint[] {
  const topByDay = new Map<DateKey, WorkoutSet>();
  for (const workout of workouts) {
    for (const set of workout.sets) {
      if (set.exerciseId !== exerciseId) continue;
      const current = topByDay.get(workout.performedOn);
      if (!current || isBetterSet(set, current)) topByDay.set(workout.performedOn, set);
    }
  }
  return [...topByDay.entries()]
    .map(([day, top]) => ({ day, top }))
    .sort((a, b) => a.day.localeCompare(b.day))
    .slice(-MAX_POINTS);
}

/** Rounds the value range out to multiples of 5 so the axis reads cleanly. */
function axisRange(values: number[]): { min: number; max: number } {
  const min = Math.floor(Math.min(...values) / 5) * 5;
  const max = Math.ceil(Math.max(...values) / 5) * 5;
  return min === max ? { min: Math.max(0, min - 5), max: max + 5 } : { min, max };
}

type ExerciseProgressProps = {
  exercises: Exercise[];
  workouts: Workout[];
};

/**
 * Line chart of one exercise over time: the heaviest set of each session
 * (or its reps, for bodyweight exercises). The readout shows the hovered or
 * focused session, or the latest one.
 */
export function ExerciseProgress({ exercises, workouts }: ExerciseProgressProps) {
  const selectId = useId();
  const [picked, setPicked] = useState<string | null>(null);
  const [active, setActive] = useState<number | null>(null);

  // Exercises with at least one logged set; default to the most recently trained
  const trainedIds = workouts.flatMap((workout) => workout.sets.map((set) => set.exerciseId));
  const options = exercises.filter((exercise) => trainedIds.includes(exercise.id));
  if (options.length === 0) return null;

  const exerciseId = picked && trainedIds.includes(picked) ? picked : trainedIds[0];
  const points = sessionPoints(workouts, exerciseId);

  const usesWeight = points.some((point) => point.top.weightKg > 0);
  const unit = usesWeight ? "kg" : "reps";
  const valueOf = (point: SessionPoint) => (usesWeight ? point.top.weightKg : point.top.reps);

  const values = points.map(valueOf);
  const { min, max } = axisRange(values);
  const ticks = [max, (min + max) / 2, min];
  const best = Math.max(...values);

  const firstDay = points[0].day;
  const spanDays = daysBetween(firstDay, points[points.length - 1].day);
  const xOf = (point: SessionPoint) =>
    spanDays === 0 ? 50 : (daysBetween(firstDay, point.day) / spanDays) * 100;
  const yOf = (point: SessionPoint) => ((valueOf(point) - min) / (max - min)) * 100;

  const shownIndex = active !== null && active < points.length ? active : points.length - 1;
  const shown = points[shownIndex];

  return (
    <figure>
      <div className="mb-4 flex flex-col gap-1.5 sm:max-w-xs">
        <label htmlFor={selectId} className="text-sm font-medium text-ink">
          Ejercicio
        </label>
        <select
          id={selectId}
          value={exerciseId}
          onChange={(e) => {
            setPicked(e.target.value);
            setActive(null);
          }}
          className={inputClassName}
        >
          {options.map((exercise) => (
            <option key={exercise.id} value={exercise.id}>
              {exercise.name}
            </option>
          ))}
        </select>
      </div>

      <figcaption className="mb-4 flex flex-wrap items-baseline gap-x-2" aria-live="polite">
        <span className="text-2xl font-semibold text-ink">
          {formatNumber(valueOf(shown))} {unit}
        </span>
        <span className="text-xs text-ink-muted">
          {formatDateKey(shown.day, { day: "numeric", month: "short", year: "numeric" })}
          {usesWeight && ` · ${formatSet(shown.top)}`} · Mejor marca: {formatNumber(best)} {unit}
        </span>
      </figcaption>

      <div className="flex gap-2">
        {/* Y axis */}
        <div className="relative h-44 w-8 shrink-0 text-right text-[10px] tabular-nums text-ink-muted">
          {ticks.map((tick, i) => (
            <span
              key={tick}
              className="absolute right-0 translate-y-1/2 leading-none"
              style={{ bottom: `${100 - i * 50}%` }}
            >
              {formatNumber(tick)}
            </span>
          ))}
        </div>

        <div className="min-w-0 flex-1">
          <div className="relative h-44">
            {ticks.map((tick, i) => (
              <div
                key={tick}
                className="absolute inset-x-0 border-t border-border"
                style={{ bottom: `${100 - i * 50}%` }}
              />
            ))}

            {/* Inset so the first and last dots aren't clipped at the edges */}
            <div
              className="absolute inset-x-3 inset-y-0"
              onPointerLeave={() => setActive(null)}
              onBlur={() => setActive(null)}
            >
              <svg
                viewBox="0 0 100 100"
                preserveAspectRatio="none"
                aria-hidden="true"
                className="absolute inset-0 h-full w-full overflow-visible"
              >
                <polyline
                  points={points.map((point) => `${xOf(point)},${100 - yOf(point)}`).join(" ")}
                  fill="none"
                  stroke="var(--accent)"
                  strokeWidth={2}
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  vectorEffect="non-scaling-stroke"
                />
              </svg>

              {points.map((point, i) => (
                <button
                  key={point.day}
                  type="button"
                  aria-label={`${formatDateKey(point.day, {
                    day: "numeric",
                    month: "long",
                    year: "numeric",
                  })}: ${formatNumber(valueOf(point))} ${unit}`}
                  onPointerEnter={() => setActive(i)}
                  onFocus={() => setActive(i)}
                  className="absolute flex h-6 w-6 -translate-x-1/2 translate-y-1/2 items-center justify-center rounded-full"
                  style={{ left: `${xOf(point)}%`, bottom: `${yOf(point)}%` }}
                >
                  <span
                    className={`rounded-full bg-accent ring-2 ring-paper-elevated transition-all ${
                      i === shownIndex ? "h-3 w-3" : "h-2 w-2"
                    }`}
                  />
                </button>
              ))}
            </div>
          </div>

          {/* X axis */}
          <div className="mt-2 flex justify-between text-[10px] tabular-nums text-ink-muted">
            <span>{formatDateKey(firstDay, { day: "numeric", month: "short" })}</span>
            {spanDays > 0 && (
              <span>
                {formatDateKey(points[points.length - 1].day, { day: "numeric", month: "short" })}
              </span>
            )}
          </div>
        </div>
      </div>
    </figure>
  );
}
