/*
 * Calendar-day helpers. Days are handled as "YYYY-MM-DD" keys in the viewer's
 * own timezone (never as UTC instants), so "today" is always the user's today.
 * Keys sort chronologically with plain string comparison.
 */

/** A calendar day as a local "YYYY-MM-DD" string. */
export type DateKey = string;

/** A calendar month as a local "YYYY-MM" string. */
export type MonthKey = string;

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

// --- Months ------------------------------------------------------------------

export function monthOf(key: DateKey): MonthKey {
  return key.slice(0, 7);
}

export function currentMonth(): MonthKey {
  return monthOf(todayKey());
}

/** True for a well-formed "YYYY-MM" with a month between 01 and 12. */
export function isMonthKey(value: string): value is MonthKey {
  // Years below 1000 are left out: `Date` reads 0-99 as 1900-1999
  return /^[1-9]\d{3}-(0[1-9]|1[0-2])$/.test(value);
}

export function addMonths(month: MonthKey, months: number): MonthKey {
  const [year, monthNumber] = month.split("-").map(Number);
  return monthOf(toDateKey(new Date(year, monthNumber - 1 + months, 1)));
}

export function firstDayOf(month: MonthKey): DateKey {
  return `${month}-01`;
}

export function lastDayOf(month: MonthKey): DateKey {
  return addDays(firstDayOf(addMonths(month, 1)), -1);
}

/** e.g. "octubre de 2026". */
export function formatMonth(month: MonthKey, options?: Intl.DateTimeFormatOptions): string {
  return formatDateKey(firstDayOf(month), options ?? { month: "long", year: "numeric" });
}
