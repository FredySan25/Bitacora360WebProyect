"use client";

import { useState } from "react";
import { YearRose, YearRoseLegend, type RoseDay, type RoseMonth } from "@/core/components/YearRose";
import { useClientToday } from "@/core/hooks/useClientToday";
import { addDays, currentMonth, dayOfYear } from "@/core/lib/dates";
import { useBudgets } from "@/features/finance/hooks/useBudgets";
import { useTransactions } from "@/features/finance/hooks/useTransactions";
import { isOverBudget } from "@/features/finance/stats";
import { useHabits } from "@/features/habits/hooks/useHabits";
import { useWorkouts } from "@/features/habits/hooks/useWorkouts";
import { completionLevel, rangeTotals } from "@/features/habits/stats";

function plural(count: number, one: string, many: string): string {
  return `${count} ${count === 1 ? one : many}`;
}

/** What the rose shows, said in words for screen readers. */
function describe(year: number, days: RoseDay[], months: RoseMonth[]): string {
  const due = days.filter((day) => day.level !== null).length;
  const complete = days.filter((day) => day.level === 3).length;
  const trained = days.filter((day) => day.trained).length;
  const budgeted = months.filter((month) => month !== null).length;
  const over = months.filter((month) => month === "over").length;

  const habits = due > 0 ? `hábitos completos en ${complete} de ${plural(due, "día", "días")}` : "sin hábitos";
  const budget =
    budgeted > 0
      ? `presupuesto excedido en ${over} de ${plural(budgeted, "mes", "meses")}`
      : "sin presupuestos";
  return `Rosa 360 de ${year}: ${habits}, ${plural(trained, "día", "días")} con gym y ${budget}.`;
}

/**
 * The year rose of the Today page. Brings together what three modules already
 * load (habits, workouts, budgets and spending) and hands it to the drawing in
 * core/, which knows nothing about where the data comes from.
 */
export function TodayRose() {
  const today = useClientToday();
  const [month] = useState(currentMonth);
  const habits = useHabits();
  const gym = useWorkouts();
  const budgets = useBudgets();
  // From January to this month
  const spending = useTransactions(month, Number(month.slice(5, 7)));

  if (!today) {
    // Keeps the rose's place until the browser knows the viewer's date; the
    // legend doesn't depend on it, so it shows from the start
    return (
      <div className="flex w-full max-w-[340px] flex-col items-center gap-5">
        <div aria-hidden="true" className="aspect-square w-full shrink-0" />
        <YearRoseLegend />
      </div>
    );
  }

  const year = Number(today.slice(0, 4));
  const todayIndex = dayOfYear(today);
  const statuses = [habits.status, gym.status, budgets.status, spending.status];
  const ready = statuses.every((status) => status === "ready");
  const failed = statuses.includes("error");

  let days: RoseDay[] = [];
  let months: RoseMonth[] = [];
  if (ready) {
    const trainedOn = new Set(gym.workouts.map((workout) => workout.performedOn));
    const firstDay = `${year}-01-01`;
    days = Array.from({ length: todayIndex + 1 }, (_, index) => {
      const day = addDays(firstDay, index);
      return {
        level: completionLevel(rangeTotals(habits.habits, habits.completions, day, day)),
        trained: trainedOn.has(day),
      };
    });
    months = Array.from({ length: Number(today.slice(5, 7)) }, (_, index) => {
      const key = `${year}-${String(index + 1).padStart(2, "0")}`;
      const over = isOverBudget(budgets.budgets, spending.transactions, key);
      return over === null ? null : over ? "over" : "ok";
    });
  }

  const label = ready
    ? describe(year, days, months)
    : failed
      ? `Rosa 360 de ${year}: no pudimos cargar tus datos.`
      : `Rosa 360 de ${year}: cargando tus datos.`;

  return (
    <div className="flex w-full max-w-[340px] flex-col items-center gap-5">
      <YearRose year={year} todayIndex={todayIndex} days={days} months={months} label={label} />
      <YearRoseLegend />
    </div>
  );
}
