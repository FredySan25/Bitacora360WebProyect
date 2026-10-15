"use client";

import { useState, type FormEvent } from "react";
import { ghostButtonClassName } from "@/core/components/buttonStyles";
import { SelectField } from "@/core/components/SelectField";
import { SubmitButton } from "@/core/components/SubmitButton";
import { TextField } from "@/core/components/TextField";
import type { DateKey } from "@/core/lib/dates";
import {
  MEDIA_TYPES,
  NOTE_MAX_LENGTH,
  TITLE_MAX_LENGTH,
  WATCH_STATUSES,
  statusLabel,
} from "../constants";
import { statusChange } from "../items";
import type { MediaType, WatchlistItemInput, WatchStatus } from "../types";
import { SegmentedChoice } from "./SegmentedChoice";
import { StarRating } from "./StarRating";

type WatchlistItemFormProps = {
  /** Current values when editing; omit to add a new item. */
  initial?: WatchlistItemInput;
  /** Type a new item starts with. */
  defaultMediaType: MediaType;
  /** Latest finish day accepted, and the one a newly finished item gets. */
  today: DateKey;
  submitLabel: string;
  /** Resolves to true when saved; the parent is expected to close the form then. */
  onSubmit: (input: WatchlistItemInput) => Promise<boolean>;
  onCancel: () => void;
};

/** Title, type, status and, once finished, its day, rating and review; used to add and to edit. */
export function WatchlistItemForm({
  initial,
  defaultMediaType,
  today,
  submitLabel,
  onSubmit,
  onCancel,
}: WatchlistItemFormProps) {
  const [title, setTitle] = useState(initial?.title ?? "");
  const [mediaType, setMediaType] = useState<MediaType>(initial?.mediaType ?? defaultMediaType);
  const [status, setStatus] = useState<WatchStatus>(initial?.status ?? "pending");
  const [finishedOn, setFinishedOn] = useState(initial?.finishedOn ?? today);
  const [rating, setRating] = useState<number | null>(initial?.rating ?? null);
  const [note, setNote] = useState(initial?.note ?? "");
  const [saving, setSaving] = useState(false);

  const done = status === "done";

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    setSaving(true);
    await onSubmit({
      title: title.trim(),
      mediaType,
      ...statusChange({ finishedOn, rating }, status, today),
      note: note.trim() || null,
    });
    setSaving(false);
  }

  return (
    <form onSubmit={handleSubmit} className="grid items-start gap-4 sm:grid-cols-2">
      <div className="sm:col-span-2">
        <SegmentedChoice
          legend="Tipo"
          options={MEDIA_TYPES}
          value={mediaType}
          onChange={setMediaType}
          disabled={saving}
        />
      </div>

      <div className="sm:col-span-2">
        <TextField
          label="Título"
          placeholder={mediaType === "book" ? "Cien años de soledad" : "El viaje de Chihiro"}
          required
          // At least one character that isn't a space, as the database asks
          pattern=".*\S.*"
          title="Escribe un título."
          maxLength={TITLE_MAX_LENGTH}
          autoFocus
          disabled={saving}
          value={title}
          onChange={(e) => setTitle(e.target.value)}
        />
      </div>

      <SelectField
        label="Estado"
        disabled={saving}
        value={status}
        onChange={(e) => setStatus(e.target.value as WatchStatus)}
      >
        {WATCH_STATUSES.map((option) => (
          <option key={option} value={option}>
            {statusLabel(option, mediaType)}
          </option>
        ))}
      </SelectField>

      {done && (
        <TextField
          label="Terminado el"
          type="date"
          required
          max={today}
          disabled={saving}
          value={finishedOn}
          onChange={(e) => setFinishedOn(e.target.value)}
        />
      )}

      {done && (
        <div className="sm:col-span-2">
          <StarRating
            label="Calificación (opcional)"
            value={rating}
            onChange={setRating}
            disabled={saving}
          />
        </div>
      )}

      <div className="sm:col-span-2">
        <TextField
          label="Reseña (opcional)"
          placeholder="Lo que te gustó, o lo que no"
          maxLength={NOTE_MAX_LENGTH}
          disabled={saving}
          value={note}
          onChange={(e) => setNote(e.target.value)}
        />
      </div>

      <div className="flex flex-wrap items-center gap-2 sm:col-span-2">
        <SubmitButton loading={saving} loadingLabel="Guardando...">
          {submitLabel}
        </SubmitButton>
        <button
          type="button"
          onClick={onCancel}
          disabled={saving}
          className={ghostButtonClassName}
        >
          Cancelar
        </button>
      </div>
    </form>
  );
}
