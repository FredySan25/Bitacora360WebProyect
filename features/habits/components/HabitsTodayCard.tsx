import { ModuleCard, ModuleCardEmpty } from "@/core/components/ModuleCard";
import { HabitsIcon } from "@/core/components/icons";

/** Today's habits summary. Empty state until the habits module has data. */
export function HabitsTodayCard() {
  return (
    <ModuleCard title="Hábitos" icon={<HabitsIcon />} href="/habits">
      <ModuleCardEmpty
        message="Aún no registras hábitos. Empieza con uno pequeño."
        actionLabel="+ Crear hábito"
        actionHref="/habits"
      />
    </ModuleCard>
  );
}
