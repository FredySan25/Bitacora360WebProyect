import { MEDIA_TYPES, SEARCH_MIN_LENGTH, TITLE_MAX_LENGTH } from "../constants";
import type { MediaType } from "../types";
import { searchBooks } from "./books";
import { searchTmdb } from "./tmdb";
import type { CatalogResult } from "./types";

/*
 * Catalog search for the /api/watchlist/search route handler. Server only:
 * the providers read keys that must never reach the browser, so no client
 * component imports this file.
 */

export type CatalogQuery = { type: MediaType; q: string };

/** The type and the text of a search, or null when either isn't valid. */
export function parseCatalogQuery(params: URLSearchParams): CatalogQuery | null {
  const type = MEDIA_TYPES.find((option) => option.value === params.get("type"))?.value;
  const q = params.get("q")?.trim() ?? "";
  if (!type || q.length < SEARCH_MIN_LENGTH || q.length > TITLE_MAX_LENGTH) return null;
  return { type, q };
}

/** Throws when the catalog of that type can't answer. */
export function searchCatalog({ type, q }: CatalogQuery): Promise<CatalogResult[]> {
  return type === "book" ? searchBooks(q) : searchTmdb(type, q);
}
