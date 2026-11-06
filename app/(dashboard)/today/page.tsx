import { CurrentDate } from "@/core/components/CurrentDate";
import { DayOfYear } from "@/core/components/DayOfYear";
import { PageHeader } from "@/core/components/PageHeader";
import { HabitsTodayCard } from "@/features/habits/components/HabitsTodayCard";
import { FinanceMonthCard } from "@/features/finance/components/FinanceMonthCard";
import { WatchlistCard } from "@/features/watchlist/components/WatchlistCard";
import { TodayRose } from "./TodayRose";

export default function TodayPage() {
  return (
    <>
      <PageHeader
        eyebrow={<CurrentDate />}
        title="Entrada del día"
        description={<DayOfYear />}
        aside={<TodayRose />}
      />

      <div className="grid gap-10 lg:grid-cols-[minmax(0,3fr)_minmax(0,2fr)] lg:items-start">
        <HabitsTodayCard />
        <div className="flex flex-col gap-10">
          <FinanceMonthCard />
          <WatchlistCard />
        </div>
      </div>
    </>
  );
}
