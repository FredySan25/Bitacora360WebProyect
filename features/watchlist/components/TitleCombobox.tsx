"use client";

import { useId, useState, type InputHTMLAttributes, type KeyboardEvent } from "react";
import { TextField } from "@/core/components/TextField";
import type { CatalogResult } from "../catalog/types";
import { useCatalogSearch } from "../hooks/useCatalogSearch";
import type { MediaType } from "../types";
import { Poster } from "./Poster";

type TitleComboboxProps = Omit<
  InputHTMLAttributes<HTMLInputElement>,
  "value" | "onChange" | "role"
> & {
  label: string;
  value: string;
  onChange: (value: string) => void;
  /** Catalog to search: TMDB for movies and series, the book catalogs for books. */
  mediaType: MediaType;
  /** False once a result is picked: then the title is only edited, not searched. */
  searchEnabled: boolean;
  onPick: (result: CatalogResult) => void;
};

const STATUS_MESSAGES = {
  loading: "Buscando en el catálogo...",
  empty: "Sin resultados en el catálogo; puedes agregarlo igual.",
  error: "No pudimos buscar en el catálogo. Puedes escribir el título a mano.",
};

/**
 * The title field, which suggests matches from the catalog as the user
 * types. Picking one is optional: the typed title saves just the same.
 */
export function TitleCombobox({
  label,
  value,
  onChange,
  mediaType,
  searchEnabled,
  onPick,
  disabled,
  ...inputProps
}: TitleComboboxProps) {
  const listboxId = useId();
  // Open while the user types; closed by a pick, Escape or leaving the field
  const [open, setOpen] = useState(false);
  const [active, setActive] = useState(-1);
  const search = useCatalogSearch(mediaType, value, searchEnabled && open && !disabled);

  const results = search.results;
  const expanded = open && search.status === "ready" && results.length > 0;
  const message =
    !open || search.status === "idle"
      ? null
      : search.status === "ready"
        ? results.length === 0
          ? STATUS_MESSAGES.empty
          : null
        : STATUS_MESSAGES[search.status];

  function pick(result: CatalogResult) {
    onPick(result);
    setOpen(false);
    setActive(-1);
  }

  function handleKeyDown(e: KeyboardEvent<HTMLInputElement>) {
    if (e.key === "Escape" && open) {
      e.preventDefault();
      setOpen(false);
      return;
    }
    if (!expanded) return;
    if (e.key === "ArrowDown" || e.key === "ArrowUp") {
      e.preventDefault();
      const step = e.key === "ArrowDown" ? 1 : -1;
      // With none highlighted, down starts at the first one and up at the last one
      const next =
        active < 0
          ? step === 1
            ? 0
            : results.length - 1
          : (active + step + results.length) % results.length;
      setActive(next);
      // The list scrolls, so the highlighted result is brought into sight
      document.getElementById(`${listboxId}-${next}`)?.scrollIntoView({ block: "nearest" });
    } else if (e.key === "Enter" && active >= 0 && active < results.length) {
      // Picks the highlighted result instead of submitting the form
      e.preventDefault();
      pick(results[active]);
    }
  }

  return (
    <div className="relative">
      <TextField
        {...inputProps}
        label={label}
        disabled={disabled}
        value={value}
        onChange={(e) => {
          onChange(e.target.value);
          setOpen(true);
          setActive(-1);
        }}
        onKeyDown={handleKeyDown}
        onBlur={() => setOpen(false)}
        role="combobox"
        autoComplete="off"
        aria-autocomplete="list"
        aria-expanded={expanded}
        aria-controls={listboxId}
        aria-activedescendant={expanded && active >= 0 ? `${listboxId}-${active}` : undefined}
      />

      <div
        className={`absolute inset-x-0 top-full z-30 mt-1 overflow-hidden rounded-xl border border-border bg-paper-elevated shadow-card ${
          expanded || message ? "" : "hidden"
        }`}
      >
        {message && (
          <p role="status" className="px-3 py-2.5 text-sm text-ink-muted">
            {message}
          </p>
        )}
        {/* About four results tall: it scrolls instead of covering the whole form */}
        <ul
          id={listboxId}
          role="listbox"
          aria-label={`Sugerencias para ${label.toLowerCase()}`}
          className="max-h-60 overflow-y-auto overscroll-contain"
        >
          {expanded &&
            results.map((result, index) => (
              <li
                key={`${result.source}-${result.catalogId}`}
                id={`${listboxId}-${index}`}
                role="option"
                aria-selected={index === active}
                // Keeps the focus in the field, so the blur doesn't close the list before the click
                onMouseDown={(e) => e.preventDefault()}
                onClick={() => pick(result)}
                onMouseEnter={() => setActive(index)}
                className={`flex cursor-pointer items-center gap-3 px-3 py-2 ${
                  index === active ? "bg-accent/10" : ""
                }`}
              >
                <Poster
                  url={result.posterUrl}
                  title={result.title}
                  mediaType={mediaType}
                  sizes="40px"
                  decorative
                  className="w-10 shrink-0 rounded-md"
                />
                <span className="min-w-0 flex-1">
                  <span className="block truncate text-sm font-medium text-ink">
                    {result.title}
                  </span>
                  <span className="block truncate text-xs text-ink-muted">
                    {[result.year, result.byline].filter(Boolean).join(" · ")}
                  </span>
                </span>
              </li>
            ))}
        </ul>
      </div>
    </div>
  );
}
