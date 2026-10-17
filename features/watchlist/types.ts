import type { DateKey } from "@/core/lib/dates";
import type { CatalogSource } from "./catalog/types";

export type MediaType = "movie" | "series" | "book";

/** Pending, then optionally in progress, then done. */
export type WatchStatus = "pending" | "in_progress" | "done";

export type WatchlistItem = {
  id: string;
  title: string;
  mediaType: MediaType;
  status: WatchStatus;
  /** Whole stars from 1 to 5; only a done item can have one. */
  rating: number | null;
  /** Day it was finished: set exactly when the status is "done". */
  finishedOn: DateKey | null;
  /** A short review. */
  note: string | null;
  /** Poster or cover from the catalog it was picked from. */
  posterUrl: string | null;
  releaseYear: number | null;
  /** Catalog the item was picked from; null when it was typed by hand. */
  catalogSource: CatalogSource | null;
  /** Id of the item in that catalog: set exactly when `catalogSource` is. */
  catalogId: string | null;
  createdAt: string;
};

export type WatchlistItemInput = {
  title: string;
  mediaType: MediaType;
  status: WatchStatus;
  rating: number | null;
  finishedOn: DateKey | null;
  note: string | null;
  posterUrl: string | null;
  releaseYear: number | null;
  catalogSource: CatalogSource | null;
  catalogId: string | null;
};

export type LoadStatus = "loading" | "ready" | "error";
