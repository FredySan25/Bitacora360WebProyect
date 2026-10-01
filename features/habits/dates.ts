import type { DateKey } from "./types";

/*
 * Calendar-day helpers. Days are handled as "YYYY-MM-DD" keys in the viewer's
 * own timezone (never as UTC instants), so "today" is always the user's today.
 * Keys sort chronologically with plain string comparison.
 */

export function toDateKey(date: Date): DateKey {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
}

export function fromDateKey(key: DateKey): Date {
  const [year, month, day] = key.split("-").map(Number);
  return new Date(year, month - 1, day);
}

export function todayKey(): DateKey {
  return toDateKey(new Date());
}

export function addDays(key: DateKey, days: number): DateKey {
  const date = fromDateKey(key);
  date.setDate(date.getDate() + days);
  return toDateKey(date);
}

/** 0 = Sunday ... 6 = Saturday. */
export function weekdayOf(key: DateKey): number {
  return fromDateKey(key).getDay();
}

/** Monday of the week that contains `key`. */
export function startOfWeek(key: DateKey): DateKey {
  return addDays(key, -((weekdayOf(key) + 6) % 7));
}

/** Whole days from `from` to `to` (negative if `to` is earlier). */
export function daysBetween(from: DateKey, to: DateKey): number {
  const ms = fromDateKey(to).getTime() - fromDateKey(from).getTime();
  return Math.round(ms / 86_400_000);
}

export function formatDateKey(key: DateKey, options: Intl.DateTimeFormatOptions): string {
  return new Intl.DateTimeFormat("es", options).format(fromDateKey(key));
}
