"use client";

import { useState } from "react";
import { iconButtonClassName, outlineButtonClassName } from "@/core/components/buttonStyles";
import { sheetClassName } from "@/core/components/surfaces";
import { PencilIcon, TrashIcon } from "@/core/components/icons";
import { formatDateKey, type DateKey } from "@/core/lib/dates";
import { mediaTypeLabel, statusLabel } from "../constants";
import type { WatchlistItem, WatchlistItemInput, WatchStatus } from "../types";
import { Poster } from "./Poster";
import { StarRating } from "./StarRating";
import { WatchlistItemForm } from "./WatchlistItemForm";

/** The next step for an item that isn't done yet, worded for its type. */
function nextSteps(item: WatchlistItem): { status: WatchStatus; label: string }[] {
  const isBook = item.mediaType === "book";
  const finish = { status: "done" as const, label: isBook ? "Marcar como leído" : "Marcar como vista" };
  if (item.status === "pending") {
    return [{ status: "in_progress", label: isBook ? "Empezar a leer" : "Empezar a ver" }, finish];
  }
  if (item.status === "in_progress") return [finish];
  return [];
}



type WatchlistItemRowProps = {
  item: WatchlistItem;
  today: DateKey;
  editing: boolean;
  onStartEdit: () => void;
  onCancelEdit: () => void;
  onSave: (input: WatchlistItemInput) => Promise<boolean>;
  /** Moves the item to another status (it finishes today). */
  onChangeStatus: (status: WatchStatus) => Promise<boolean>;
  onRate: (rating: number | null) => Promise<boolean>;
  onDelete: () => void;
};

/** One card of the grid: poster, title, type and status, the next step, and the rating once finished. */
export function WatchlistItemRow({
  item,
  today,
  editing,
  onStartEdit,
  onCancelEdit,
  onSave,
  onChangeStatus,
  onRate,
  onDelete,
}: WatchlistItemRowProps) {
  const [saving, setSaving] = useState(false);

  if (editing) {
    return (
      <li className={`${sheetClassName} col-span-full p-5 md:p-6`}>
        <WatchlistItemForm
          initial={item}
          defaultMediaType={item.mediaType}
          today={today}
          submitLabel="Guardar"
          onSubmit={onSave}
          onCancel={onCancelEdit}
        />
      </li>
    );
  }

  async function run(write: () => Promise<boolean>) {
    setSaving(true);
    await write();
    setSaving(false);
  }

  const status = item.finishedOn
    ? `${statusLabel(item.status, item.mediaType)} el ${formatDateKey(item.finishedOn, {
        day: "numeric",
        month: "short",
        year: "numeric",
      })}`
    : statusLabel(item.status, item.mediaType);

  return (
    <li className="flex flex-col gap-2">
      <div className="relative">
        <Poster
          url={item.posterUrl}
          title={item.title}
          mediaType={item.mediaType}
          sizes="(min-width: 768px) 14rem, 50vw"
        />
        {/* Always visible, not on hover: phones have no hover */}
        <div className="absolute top-1.5 right-1.5 flex gap-0.5 rounded-lg border border-border bg-paper-elevated/95 backdrop-blur">
          <button
            type="button"
            onClick={onStartEdit}
            aria-label={`Editar ${item.title}`}
            className={iconButtonClassName}
          >
            <PencilIcon className="h-4 w-4" />
          </button>
          <button
            type="button"
            onClick={onDelete}
            aria-label={`Eliminar ${item.title}`}
            className={iconButtonClassName}
          >
            <TrashIcon className="h-4 w-4" />
          </button>
        </div>
      </div>

      <div className="min-w-0">
        <p className="line-clamp-2 text-[1.0625rem] leading-snug font-bold text-ink">{item.title}</p>
        {item.releaseYear && (
          <p className="text-sm tabular-nums text-ink-muted">{item.releaseYear}</p>
        )}
        <p className="mt-0.5 text-sm text-ink-muted">
          {mediaTypeLabel(item.mediaType)} · {status}
        </p>
      </div>

      {item.note && (
        <p className="line-clamp-3 text-sm text-ink-muted italic">“{item.note}”</p>
      )}

      {item.status === "done" ? (
        <StarRating
          label={`Calificación de ${item.title}`}
          hideLabel
          value={item.rating}
          onChange={(rating) => run(() => onRate(rating))}
          disabled={saving}
        />
      ) : (
        <div className="flex flex-col items-start">
          {nextSteps(item).map((step) => (
            <button
              key={step.status}
              type="button"
              onClick={() => run(() => onChangeStatus(step.status))}
              disabled={saving}
              className={outlineButtonClassName}
            >
              {step.label}
            </button>
          ))}
        </div>
      )}
    </li>
  );
}
