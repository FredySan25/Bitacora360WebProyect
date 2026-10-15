"use client";

import { ModuleCard, ModuleCardEmpty } from "@/core/components/ModuleCard";
import { WatchlistIcon } from "@/core/components/icons";
import { mediaTypeLabel } from "../constants";
import { useWatchlist } from "../hooks/useWatchlist";
import { groupByStatus } from "../items";

/** Titles shown under "En curso"; the rest only count. */
const IN_PROGRESS_SHOWN = 3;

/** Watchlist summary for the Today page: what's in progress, and how many are pending and done. */
export function WatchlistCard() {
  const { status, items } = useWatchlist();
  const groups = groupByStatus(items, "all");
  const inProgress = groups.in_progress.slice(0, IN_PROGRESS_SHOWN);
  const moreInProgress = groups.in_progress.length - inProgress.length;

  return (
    <ModuleCard title="Watchlist" icon={<WatchlistIcon />} href="/watchlist">
      {status === "loading" && <p className="text-sm text-ink-muted">Cargando...</p>}

      {status === "error" && <p className="text-sm text-ink-muted">No pudimos cargar tu lista.</p>}

      {status === "ready" && items.length === 0 && (
        <ModuleCardEmpty
          message="Tu lista está vacía. ¿Qué quieres ver o leer después?"
          actionLabel="+ Agregar título"
          actionHref="/watchlist"
        />
      )}

      {status === "ready" && items.length > 0 && (
        <div className="flex flex-col gap-3">
          <div>
            <p className="text-xs font-medium text-ink-muted">En curso</p>
            {inProgress.length > 0 ? (
              <ul className="mt-1 flex flex-col gap-0.5">
                {inProgress.map((item) => (
                  <li key={item.id} className="flex items-baseline gap-2">
                    <span className="min-w-0 flex-1 truncate font-display text-lg text-ink">
                      {item.title}
                    </span>
                    <span className="shrink-0 text-xs text-ink-muted">
                      {mediaTypeLabel(item.mediaType)}
                    </span>
                  </li>
                ))}
                {moreInProgress > 0 && (
                  <li className="text-xs text-ink-muted">y {moreInProgress} más</li>
                )}
              </ul>
            ) : (
              <p className="mt-1 font-display text-lg text-ink">Nada en curso por ahora.</p>
            )}
          </div>
          <dl className="flex flex-col gap-1 text-sm">
            <div className="flex justify-between gap-3">
              <dt className="text-ink-muted">Pendientes</dt>
              <dd className="font-medium tabular-nums text-ink">{groups.pending.length}</dd>
            </div>
            <div className="flex justify-between gap-3">
              <dt className="text-ink-muted">Terminados</dt>
              <dd className="font-medium tabular-nums text-ink">{groups.done.length}</dd>
            </div>
          </dl>
        </div>
      )}
    </ModuleCard>
  );
}
