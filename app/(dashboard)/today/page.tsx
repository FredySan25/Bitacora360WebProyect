import { CurrentDate } from "@/core/components/CurrentDate";
import { PageHeader } from "@/core/components/PageHeader";
import { HabitsTodayCard } from "@/features/habits/components/HabitsTodayCard";
import { FinanceMonthCard } from "@/features/finance/components/FinanceMonthCard";
import { WatchlistCard } from "@/features/watchlist/components/WatchlistCard";

export default function TodayPage() {
  return (
    <>
      <PageHeader
        eyebrow={<CurrentDate />}
        title="Entrada del día"
        description="Un vistazo rápido a cómo vas hoy."
      />

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        <HabitsTodayCard />
        <FinanceMonthCard />
        <WatchlistCard />
      </div>
    </>
  );
}
