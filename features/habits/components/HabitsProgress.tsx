"use client";

import Link from "next/link";
import type { ReactNode } from "react";
import { outlineButtonClassName } from "@/core/components/buttonStyles";
import { FormAlert } from "@/core/components/FormAlert";
import { addDays, startOfWeek } from "../dates";
import { useHabits } from "../hooks/useHabits";
import { bestStreak, currentStreak, percent, rangeTotals, type Totals } from "../stats";
import { CompletionHeatmap, type DayPoint } from "./CompletionHeatmap";
import { StatTile } from "./StatTile";
import { WeeklyCompletionChart, type WeekPoint } from "./WeeklyCompletionChart";

const CHART_WEEKS = 12;
const HEATMAP_WEEKS = 17;

function formatPercent(totals: Totals): string {
  const value = percent(totals);
  return value === null ? "—" : `${value}%`;
}

function formatDays(count: number): string {
  return `${count} ${count === 1 ? "día" : "días"}`;
}

function ChartCard({ title, children }: { title: string; children: ReactNode }) {
  return (
    <section className="rounded-2xl border border-border bg-paper-elevated p-5">
      <h2 className="mb-4 text-xs font-semibold uppercase tracking-widest text-ink-muted">
        {title}
      </h2>
      {children}
    </section>
  );
}

/** Progress view: headline numbers, weekly trend, daily heatmap and per-habit streaks. */
export function HabitsProgress() {
  const { status, habits, completions, today, since } = useHabits();

  if (status === "loading") {
    return <p className="text-sm text-ink-muted">Cargando tu progreso...</p>;
  }
  if (status === "error") {
    return (
      <FormAlert message="No pudimos cargar tu progreso. Recarga la página para intentar de nuevo." />
    );
  }
  if (habits.length === 0) {
    return (
      <div className="flex flex-col items-start gap-4">
        <p className="font-display text-lg text-ink">
          Cuando registres hábitos, aquí verás tus rachas y tu avance.
        </p>
        <Link href="/habits" className={outlineButtonClassName}>
          + Crear hábito
        </Link>
      </div>
    );
  }

  const thisWeek = startOfWeek(today);

  const todayTotals = rangeTotals(habits, completions, today, today);
  const last7 = rangeTotals(habits, completions, addDays(today, -6), today);
  const last30 = rangeTotals(habits, completions, addDays(today, -29), today);

  const perHabit = habits.map((habit) => ({
    habit,
    current: currentStreak(habit, completions, since, today),
    best: bestStreak(habit, completions, since, today),
    last30: rangeTotals([habit], completions, addDays(today, -29), today),
  }));
  const topStreak = perHabit.reduce((top, row) => (row.current > top.current ? row : top));

  const weeks: WeekPoint[] = Array.from({ length: CHART_WEEKS }, (_, i) => {
    const weekStart = addDays(thisWeek, -7 * (CHART_WEEKS - 1 - i));
    const sunday = addDays(weekStart, 6);
    const weekEnd = sunday > today ? today : sunday;
    return { weekStart, weekEnd, totals: rangeTotals(habits, completions, weekStart, weekEnd) };
  });

  const days: DayPoint[] = [];
  for (let day = addDays(thisWeek, -7 * (HEATMAP_WEEKS - 1)); day <= today; day = addDays(day, 1)) {
    days.push({ day, totals: rangeTotals(habits, completions, day, day) });
  }

  return (
    <div className="flex flex-col gap-4">
      <div className="grid grid-cols-2 gap-3 lg:grid-cols-4">
        <StatTile
          label="Hoy"
          value={
            todayTotals.scheduled === 0 ? "—" : `${todayTotals.done} de ${todayTotals.scheduled}`
          }
          detail={todayTotals.scheduled === 0 ? "Sin hábitos programados" : "hábitos completados"}
        />
        <StatTile
          label="Últimos 7 días"
          value={formatPercent(last7)}
          detail={`${last7.done} de ${last7.scheduled} completados`}
        />
        <StatTile
          label="Últimos 30 días"
          value={formatPercent(last30)}
          detail={`${last30.done} de ${last30.scheduled} completados`}
        />
        <StatTile
          label="Mejor racha activa"
          value={formatDays(topStreak.current)}
          detail={topStreak.current > 0 ? topStreak.habit.name : "Completa un hábito para empezar"}
        />
      </div>

      <ChartCard title="Cumplimiento por semana">
        <WeeklyCompletionChart weeks={weeks} />
      </ChartCard>

      <ChartCard title="Día a día">
        <CompletionHeatmap days={days} today={today} />
      </ChartCard>

      <ChartCard title="Por hábito">
        <div className="overflow-x-auto">
          <table className="w-full min-w-[26rem] text-left text-sm">
            <thead>
              <tr className="border-b border-border text-xs text-ink-muted">
                <th scope="col" className="pb-2 pr-3 font-medium">
                  Hábito
                </th>
                <th scope="col" className="pb-2 pr-3 text-right font-medium">
                  Racha actual
                </th>
                <th scope="col" className="pb-2 pr-3 text-right font-medium">
                  Mejor racha
                </th>
                <th scope="col" className="pb-2 font-medium">
                  Últimos 30 días
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {perHabit.map(({ habit, current, best, last30 }) => {
                const rate = percent(last30);
                return (
                  <tr key={habit.id}>
                    <th scope="row" className="max-w-40 truncate py-2.5 pr-3 font-medium text-ink">
                      {habit.name}
                    </th>
                    <td className="py-2.5 pr-3 text-right tabular-nums text-ink">
                      {formatDays(current)}
                    </td>
                    <td className="py-2.5 pr-3 text-right tabular-nums text-ink-muted">
                      {formatDays(best)}
                    </td>
                    <td className="py-2.5">
                      <div className="flex items-center gap-2">
                        <div className="h-1.5 w-24 overflow-hidden rounded-full bg-accent/20">
                          <div
                            className="h-full rounded-full bg-accent"
                            style={{ width: `${rate ?? 0}%` }}
                          />
                        </div>
                        <span className="w-9 text-right text-xs tabular-nums text-ink-muted">
                          {rate === null ? "—" : `${rate}%`}
                        </span>
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </ChartCard>
    </div>
  );
}
