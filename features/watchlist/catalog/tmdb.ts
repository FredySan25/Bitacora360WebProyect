import { CATALOG_LANGUAGE, SEARCH_MAX_RESULTS } from "../constants";
import {
  CATALOG_TIMEOUT_MS,
  cleanCatalogId,
  cleanPosterUrl,
  cleanTitle,
  yearOf,
} from "./normalize";
import type { CatalogResult } from "./types";

/*
 * Movies and series from TMDB (themoviedb.org). Free for non-commercial use
 * with its attribution, which the /about page shows. Server only: the token
 * must never reach the browser.
 */

const API_URL = "https://api.themoviedb.org/3";
// w342 is wide enough for a card in the grid
const POSTER_BASE_URL = "https://image.tmdb.org/t/p/w342";

// Movies have a title and a release date; series a name and a first air date.
type TmdbResult = {
  id: number;
  title?: string;
  name?: string;
  release_date?: string;
  first_air_date?: string;
  poster_path?: string | null;
};

export async function searchTmdb(
  type: "movie" | "series",
  query: string,
): Promise<CatalogResult[]> {
  const token = process.env.TMDB_READ_ACCESS_TOKEN;
  if (!token) throw new Error("TMDB_READ_ACCESS_TOKEN is not set");

  const params = new URLSearchParams({
    query,
    language: CATALOG_LANGUAGE,
    include_adult: "false",
    page: "1",
  });
  const response = await fetch(`${API_URL}/search/${type === "movie" ? "movie" : "tv"}?${params}`, {
    headers: { Authorization: `Bearer ${token}`, Accept: "application/json" },
    signal: AbortSignal.timeout(CATALOG_TIMEOUT_MS),
  });
  if (!response.ok) throw new Error(`TMDB answered ${response.status}`);

  const body = (await response.json()) as { results?: TmdbResult[] };
  const results: CatalogResult[] = [];
  for (const result of body.results ?? []) {
    const title = cleanTitle(result.title ?? result.name);
    const catalogId = cleanCatalogId(result.id);
    if (!title || !catalogId) continue;
    results.push({
      source: "tmdb",
      catalogId,
      title,
      year: yearOf(result.release_date ?? result.first_air_date),
      posterUrl: result.poster_path
        ? cleanPosterUrl(`${POSTER_BASE_URL}${result.poster_path}`)
        : null,
      byline: null,
    });
  }
  return results.slice(0, SEARCH_MAX_RESULTS);
}
