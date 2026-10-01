import { addDays, toDateKey, weekdayOf } from "./dates";
import type { DateKey, Habit } from "./types";

/** Completions are kept in a Set of these keys for O(1) lookups. */
export function completionKey(habitId: string, day: DateKey): string {
  return `${habitId}|${day}`;
}

export type Totals = { scheduled: number; done: number };

/** A habit counts from the local day it was created, on its scheduled weekdays. */
export function isScheduledOn(habit: Habit, day: DateKey): boolean {
  return day >= toDateKey(new Date(habit.createdAt)) && habit.weekdays.includes(weekdayOf(day));
}

/** Scheduled days of a habit within [from, to], oldest first. */
function scheduledDays(habit: Habit, from: DateKey, to: DateKey): DateKey[] {
  const days: DateKey[] = [];
  const created = toDateKey(new Date(habit.createdAt));
  for (let day = from > created ? from : created; day <= to; day = addDays(day, 1)) {
    if (habit.weekdays.includes(weekdayOf(day))) days.push(day);
  }
  return days;
}

/**
 * Consecutive scheduled days completed, counting back from `today`.
 * A still-pending today doesn't break the streak. Only looks back to `from`.
 */
export function currentStreak(
  habit: Habit,
  done: ReadonlySet<string>,
  from: DateKey,
  today: DateKey,
): number {
  const days = scheduledDays(habit, from, today);
  if (days.at(-1) === today && !done.has(completionKey(habit.id, today))) days.pop();

  let streak = 0;
  for (let i = days.length - 1; i >= 0; i--) {
    if (!done.has(completionKey(habit.id, days[i]))) break;
    streak++;
  }
  return streak;
}

/** Longest run of consecutive scheduled days completed within [from, today]. */
export function bestStreak(
  habit: Habit,
  done: ReadonlySet<string>,
  from: DateKey,
  today: DateKey,
): number {
  let best = 0;
  let run = 0;
  for (const day of scheduledDays(habit, from, today)) {
    run = done.has(completionKey(habit.id, day)) ? run + 1 : 0;
    best = Math.max(best, run);
  }
  return best;
}

/** How many habits were scheduled and how many were completed within [from, to]. */
export function rangeTotals(
  habits: Habit[],
  done: ReadonlySet<string>,
  from: DateKey,
  to: DateKey,
): Totals {
  const totals: Totals = { scheduled: 0, done: 0 };
  for (const habit of habits) {
    for (const day of scheduledDays(habit, from, to)) {
      totals.scheduled++;
      if (done.has(completionKey(habit.id, day))) totals.done++;
    }
  }
  return totals;
}

/** Completion as a 0-100 integer, or null when nothing was scheduled. */
export function percent({ scheduled, done }: Totals): number | null {
  return scheduled === 0 ? null : Math.round((done / scheduled) * 100);
}
