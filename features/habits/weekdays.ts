/** Days of the week in display order (Monday first); `value` matches `Date.getDay()`. */
export const WEEKDAYS = [
  { value: 1, short: "Lu", name: "Lunes" },
  { value: 2, short: "Ma", name: "Martes" },
  { value: 3, short: "Mi", name: "Miércoles" },
  { value: 4, short: "Ju", name: "Jueves" },
  { value: 5, short: "Vi", name: "Viernes" },
  { value: 6, short: "Sá", name: "Sábado" },
  { value: 0, short: "Do", name: "Domingo" },
];

export const ALL_WEEKDAYS = WEEKDAYS.map((day) => day.value);

/** e.g. "Todos los días" or "Lu · Mi · Vi". */
export function describeWeekdays(weekdays: number[]): string {
  if (weekdays.length === WEEKDAYS.length) return "Todos los días";
  return WEEKDAYS.filter((day) => weekdays.includes(day.value))
    .map((day) => day.short)
    .join(" · ");
}
