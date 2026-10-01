import { PageHeader } from "@/core/components/PageHeader";
import { HabitsTabs } from "@/features/habits/components/HabitsTabs";

export default function HabitsLayout({ children }: { children: React.ReactNode }) {
  return (
    <>
      <PageHeader title="Hábitos" description="Tu rutina diaria y el gym, día a día." />
      <HabitsTabs />
      {children}
    </>
  );
}
