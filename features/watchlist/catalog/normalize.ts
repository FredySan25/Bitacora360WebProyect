import { TITLE_MAX_LENGTH } from "../constants";

/*
 * Turns what a catalog answers into values the migration accepts, so picking
 * a result can never fail to save: a value that doesn't fit is dropped.
 */

// Same hosts and limit as the poster_url check of the migration.
const POSTER_URL_PATTERN =
  /^https:\/\/(image\.tmdb\.org|books\.google\.com|covers\.openlibrary\.org)\//;
const POSTER_URL_MAX_LENGTH = 500;
const CATALOG_ID_MAX_LENGTH = 64;

/** Requests to a catalog give up after this long. */
export const CATALOG_TIMEOUT_MS = 5000;

export function cleanTitle(title: string | undefined): string | null {
  const trimmed = title?.trim();
  return trimmed ? trimmed.slice(0, TITLE_MAX_LENGTH) : null;
}

export function cleanCatalogId(id: string | number | undefined): string | null {
  const text = id === undefined ? "" : String(id).trim();
  return text && text.length <= CATALOG_ID_MAX_LENGTH ? text : null;
}

/** The year of a "2001-07-20", "2001-07" or "2001" date. */
export function yearOf(date: string | number | undefined): number | null {
  const year = Number(String(date ?? "").slice(0, 4));
  return Number.isInteger(year) && year >= 1 && year <= 2100 ? year : null;
}

export function cleanPosterUrl(url: string | undefined): string | null {
  if (!url) return null;
  const https = url.replace(/^http:\/\//, "https://");
  return https.length <= POSTER_URL_MAX_LENGTH && POSTER_URL_PATTERN.test(https) ? https : null;
}
