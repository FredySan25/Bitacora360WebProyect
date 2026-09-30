import { ModuleCard, ModuleCardEmpty } from "@/core/components/ModuleCard";
import { WatchlistIcon } from "@/core/components/icons";

/** Watchlist summary. Empty state until the watchlist module has data. */
export function WatchlistCard() {
  return (
    <ModuleCard title="Watchlist" icon={<WatchlistIcon />} href="/watchlist">
      <ModuleCardEmpty
        message="Tu lista está vacía. ¿Qué quieres ver después?"
        actionLabel="+ Agregar título"
        actionHref="/watchlist"
      />
    </ModuleCard>
  );
}
