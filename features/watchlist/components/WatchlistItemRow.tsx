"use client";

import { useState } from "react";
import { ghostButtonClassName, iconButtonClassName } from "@/core/components/buttonStyles";
import { PencilIcon, TrashIcon } from "@/core/components/icons";
import { formatDateKey, type DateKey } from "@/core/lib/dates";
import { mediaTypeLabel, statusLabel } from "../constants";
import type { WatchlistItem, WatchlistItemInput, WatchStatus } from "../types";
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

/** One item: its title, type and status, the next step, and its rating once finished. */
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
      <li className="px-4 py-4">
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
    <li className="flex flex-col gap-2 px-4 py-3">
      <div className="flex items-start gap-2">
        <div className="min-w-0 flex-1">
          <p className="truncate font-medium text-ink">{item.title}</p>
          <p className="truncate text-xs text-ink-muted">
            {mediaTypeLabel(item.mediaType)} · {status}
          </p>
        </div>
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

      {item.note && <p className="text-sm italic text-ink-muted">“{item.note}”</p>}

      {item.status === "done" ? (
        <StarRating
          label={`Calificación de ${item.title}`}
          hideLabel
          value={item.rating}
          onChange={(rating) => run(() => onRate(rating))}
          disabled={saving}
        />
      ) : (
        <div className="-ml-3 flex flex-wrap gap-1">
          {nextSteps(item).map((step) => (
            <button
              key={step.status}
              type="button"
              onClick={() => run(() => onChangeStatus(step.status))}
              disabled={saving}
              className={ghostButtonClassName}
            >
              {step.label}
            </button>
          ))}
        </div>
      )}
    </li>
  );
}
