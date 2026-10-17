import type { CatalogSource } from "./catalog/types";
import type { MediaType, WatchStatus } from "./types";

/*
 * Media types and statuses are fixed keys: the keys are what gets saved, and
 * the migration checks them. Adding one here needs a migration too.
 */
export const MEDIA_TYPES: { value: MediaType; label: string; plural: string }[] = [
  { value: "movie", label: "Película", plural: "Películas" },
  { value: "series", label: "Serie", plural: "Series" },
  { value: "book", label: "Libro", plural: "Libros" },
];

export const WATCH_STATUSES: WatchStatus[] = ["pending", "in_progress", "done"];

export function mediaTypeLabel(type: MediaType): string {
  return MEDIA_TYPES.find((option) => option.value === type)?.label ?? type;
}

/** How a status reads for each type: books are read, movies and series are watched. */
export function statusLabel(status: WatchStatus, type: MediaType): string {
  const isBook = type === "book";
  switch (status) {
    case "pending":
      return isBook ? "Por leer" : "Por ver";
    case "in_progress":
      return isBook ? "Leyendo" : "Viendo";
    case "done":
      // "la película", "la serie", "el libro"
      return isBook ? "Leído" : "Vista";
  }
}

/** Books have a cover; movies and series, a poster. */
export function posterLabel(title: string, type: MediaType): string {
  return `${type === "book" ? "Portada" : "Póster"} de ${title}`;
}

/** Names the stand-in shown when there is no poster or it fails to load. */
export function noPosterLabel(title: string, type: MediaType): string {
  return `${type === "book" ? "Sin portada" : "Sin póster"}: ${title}`;
}

export const TITLE_MAX_LENGTH = 120;
export const NOTE_MAX_LENGTH = 280;
export const MAX_RATING = 5;

export const CATALOG_SOURCE_LABELS: Record<CatalogSource, string> = {
  tmdb: "TMDB",
  google_books: "Google Books",
  open_library: "Open Library",
};

/** Language the catalogs answer in: titles and posters come localized when they have them. */
export const CATALOG_LANGUAGE = "es-MX";
/** Characters a title needs before the catalog is searched. */
export const SEARCH_MIN_LENGTH = 2;
/** Most results a search returns. */
export const SEARCH_MAX_RESULTS = 8;
