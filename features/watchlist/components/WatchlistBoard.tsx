"use client";

import Link from "next/link";
import { useState } from "react";
import { outlineButtonClassName } from "@/core/components/buttonStyles";
import { ConfirmDialog } from "@/core/components/ConfirmDialog";
import { FormAlert } from "@/core/components/FormAlert";
import { PlusIcon } from "@/core/components/icons";
import {
  emptyStateClassName,
  ruledHeadingClassName,
  sheetClassName,
} from "@/core/components/surfaces";
import { todayKey } from "@/core/lib/dates";
import { MEDIA_TYPES } from "../constants";
import { useWatchlist } from "../hooks/useWatchlist";
import { groupByStatus, statusChange } from "../items";
import type { MediaType, WatchlistItem, WatchStatus } from "../types";
import { SegmentedChoice } from "./SegmentedChoice";
import { WatchlistItemForm } from "./WatchlistItemForm";
import { WatchlistItemRow } from "./WatchlistItemRow";

type TypeFilter = MediaType | "all";

const FILTER_OPTIONS: { value: TypeFilter; label: string }[] = [
  { value: "all", label: "Todo" },
  ...MEDIA_TYPES.map((type) => ({ value: type.value, label: type.plural })),
];

/** Sections in the order they are shown: what's going on first. */
const SECTIONS: { status: WatchStatus; title: string }[] = [
  { status: "in_progress", title: "En curso" },
  { status: "pending", title: "Pendientes" },
  { status: "done", title: "Terminados" },
];

// A shelf of covers: as many 10rem columns as fit, two on a phone. What's in
// progress gets bigger covers, so it stands out at the top
function gridClassName(status: WatchStatus): string {
  const column = status === "in_progress" ? "minmax(12rem,1fr)" : "minmax(10rem,1fr)";
  return `grid grid-cols-[repeat(auto-fill,${column})] gap-x-4 gap-y-7 sm:gap-x-5`;
}

const emptyClassName = emptyStateClassName;

/** Movies, series and books: add, filter by type, move along, rate, edit and delete. */
export function WatchlistBoard() {
  const { status, items, actionError, clearActionError, addItem, editItem, removeItem } =
    useWatchlist();

  const [today] = useState(todayKey);
  const [filter, setFilter] = useState<TypeFilter>("all");
  const [creating, setCreating] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [deleting, setDeleting] = useState<WatchlistItem | null>(null);

  if (status === "loading") {
    return <p className="text-ink-muted">Cargando tu lista...</p>;
  }
  if (status === "error") {
    return (
      <FormAlert message="No pudimos cargar tu lista. Recarga la página para intentar de nuevo." />
    );
  }

  /** Runs a save and, if the filter would hide the item, switches it to the item's type. */
  async function save(mediaType: MediaType, write: () => Promise<boolean>): Promise<boolean> {
    const ok = await write();
    if (ok && filter !== "all" && filter !== mediaType) setFilter(mediaType);
    return ok;
  }

  const groups = groupByStatus(items, filter);
  const shown = SECTIONS.filter((section) => groups[section.status].length > 0);
  const filterLabel = FILTER_OPTIONS.find((option) => option.value === filter)?.label ?? "";

  return (
    <div className="flex flex-col gap-10">
      {actionError && <FormAlert message={actionError} />}

      <SegmentedChoice
        legend="Filtrar por tipo"
        hideLegend
        look="tabs"
        options={FILTER_OPTIONS}
        value={filter}
        onChange={setFilter}
      />

      {creating ? (
        <section className={`${sheetClassName} p-5 md:p-6`}>
          <h2 className="mb-4 font-display text-[1.3125rem] font-bold text-ink">Nuevo título</h2>
          <WatchlistItemForm
            defaultMediaType={filter === "all" ? "movie" : filter}
            today={today}
            submitLabel="Agregar"
            onSubmit={async (input) => {
              const ok = await save(input.mediaType, () => addItem(input));
              if (ok) setCreating(false);
              return ok;
            }}
            onCancel={() => {
              setCreating(false);
              clearActionError();
            }}
          />
        </section>
      ) : (
        <button type="button" onClick={() => setCreating(true)} className={outlineButtonClassName}>
          <PlusIcon className="h-4 w-4" />
          Agregar título
        </button>
      )}

      {shown.length > 0 ? (
        shown.map((section) => (
          <section key={section.status} className="flex flex-col gap-5">
            <h2 className={ruledHeadingClassName}>
              {section.title} ({groups[section.status].length})
            </h2>
            <ul className={gridClassName(section.status)}>
              {groups[section.status].map((item) => (
                <WatchlistItemRow
                  key={item.id}
                  item={item}
                  today={today}
                  editing={editingId === item.id}
                  onStartEdit={() => setEditingId(item.id)}
                  onCancelEdit={() => {
                    setEditingId(null);
                    clearActionError();
                  }}
                  onSave={async (input) => {
                    const ok = await save(input.mediaType, () => editItem(item.id, input));
                    if (ok) setEditingId(null);
                    return ok;
                  }}
                  onChangeStatus={(next) => editItem(item.id, statusChange(item, next, today))}
                  onRate={(rating) => editItem(item.id, { rating })}
                  onDelete={() => setDeleting(item)}
                />
              ))}
            </ul>
          </section>
        ))
      ) : (
        <p className={emptyClassName}>
          {items.length === 0
            ? "Tu lista está vacía. Agrega la próxima película, serie o libro."
            : `No tienes ${filterLabel.toLowerCase()} en tu lista.`}
        </p>
      )}

      <p className="text-sm text-ink-muted">
        Pósters y datos de TMDB, Google Books y Open Library ·{" "}
        <Link
          href="/about"
          className="font-bold text-accent underline underline-offset-[3px] hover:text-accent-hover"
        >
          Créditos
        </Link>
      </p>

      {deleting && (
        <ConfirmDialog
          title={`¿Eliminar "${deleting.title}"?`}
          message="Esta acción no se puede deshacer."
          confirmLabel="Eliminar"
          onConfirm={async () => {
            await removeItem(deleting.id);
            setDeleting(null);
          }}
          onCancel={() => setDeleting(null)}
        />
      )}
    </div>
  );
}
