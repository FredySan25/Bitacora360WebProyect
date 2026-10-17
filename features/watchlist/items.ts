import type { DateKey } from "@/core/lib/dates";
import type { CatalogLink, CatalogResult } from "./catalog/types";
import type { MediaType, WatchlistItem, WatchlistItemInput, WatchStatus } from "./types";

/**
 * The fields that change when an item moves to `status`, keeping what the
 * migration asks for: only a done item has a finish day and a rating.
 */
export function statusChange(
  item: Pick<WatchlistItem, "finishedOn" | "rating">,
  status: WatchStatus,
  today: DateKey,
): Pick<WatchlistItemInput, "status" | "finishedOn" | "rating"> {
  if (status === "done") {
    return { status, finishedOn: item.finishedOn ?? today, rating: item.rating };
  }
  return { status, finishedOn: null, rating: null };
}

/** The catalog fields of an item typed by hand, or unlinked from its catalog. */
export const NO_CATALOG_LINK: Record<keyof CatalogLink, null> = {
  catalogSource: null,
  catalogId: null,
  posterUrl: null,
  releaseYear: null,
};

/** What an item keeps of a picked search result. */
export function catalogLink(result: CatalogResult): CatalogLink {
  return {
    catalogSource: result.source,
    catalogId: result.catalogId,
    posterUrl: result.posterUrl,
    releaseYear: result.year,
  };
}

/** The catalog link of an item, or null when it was typed by hand. */
export function linkOf(item: Pick<WatchlistItemInput, keyof CatalogLink>): CatalogLink | null {
  if (!item.catalogSource || !item.catalogId) return null;
  return {
    catalogSource: item.catalogSource,
    catalogId: item.catalogId,
    posterUrl: item.posterUrl,
    releaseYear: item.releaseYear,
  };
}

export type WatchlistGroups = Record<WatchStatus, WatchlistItem[]>;

/**
 * Items of one type (or all of them) split by status. Pending and in progress
 * keep the order they were added in, newest first; done goes by finish day,
 * latest first.
 */
export function groupByStatus(items: WatchlistItem[], type: MediaType | "all"): WatchlistGroups {
  const groups: WatchlistGroups = { pending: [], in_progress: [], done: [] };
  for (const item of items) {
    if (type === "all" || item.mediaType === type) groups[item.status].push(item);
  }
  // Stable sort: items finished the same day keep their newest-first order
  groups.done.sort((a, b) => (b.finishedOn ?? "").localeCompare(a.finishedOn ?? ""));
  return groups;
}
