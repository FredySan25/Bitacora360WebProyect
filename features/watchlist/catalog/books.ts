import { SEARCH_MAX_RESULTS } from "../constants";
import {
  CATALOG_TIMEOUT_MS,
  cleanCatalogId,
  cleanPosterUrl,
  cleanTitle,
  yearOf,
} from "./normalize";
import type { CatalogResult } from "./types";

/*
 * Books from Google Books, and from Open Library when Google fails or finds
 * nothing. Server only: the Google key must never reach the browser.
 */

// Without a key Google shares one daily quota among every caller, so the key
// is optional but keeps the searches working.
const GOOGLE_BOOKS_URL = "https://www.googleapis.com/books/v1/volumes";
const OPEN_LIBRARY_URL = "https://openlibrary.org/search.json";
const OPEN_LIBRARY_COVERS_URL = "https://covers.openlibrary.org/b/id";

function byline(authors: string[] | undefined): string | null {
  return authors?.length ? authors.slice(0, 2).join(", ") : null;
}

type GoogleVolume = {
  id: string;
  volumeInfo?: {
    title?: string;
    authors?: string[];
    publishedDate?: string;
    imageLinks?: { thumbnail?: string; smallThumbnail?: string };
  };
};

async function searchGoogleBooks(query: string): Promise<CatalogResult[]> {
  const params = new URLSearchParams({
    q: query,
    maxResults: String(SEARCH_MAX_RESULTS),
    printType: "books",
    fields: "items(id,volumeInfo(title,authors,publishedDate,imageLinks))",
  });
  const key = process.env.GOOGLE_BOOKS_API_KEY;
  if (key) params.set("key", key);

  const response = await fetch(`${GOOGLE_BOOKS_URL}?${params}`, {
    signal: AbortSignal.timeout(CATALOG_TIMEOUT_MS),
  });
  if (!response.ok) throw new Error(`Google Books answered ${response.status}`);

  const body = (await response.json()) as { items?: GoogleVolume[] };
  const results: CatalogResult[] = [];
  for (const volume of body.items ?? []) {
    const info = volume.volumeInfo ?? {};
    const title = cleanTitle(info.title);
    const catalogId = cleanCatalogId(volume.id);
    if (!title || !catalogId) continue;
    const thumbnail = info.imageLinks?.thumbnail ?? info.imageLinks?.smallThumbnail;
    results.push({
      source: "google_books",
      catalogId,
      title,
      year: yearOf(info.publishedDate),
      // The curled page corner is drawn into the image unless it is asked away
      posterUrl: cleanPosterUrl(thumbnail?.replace("&edge=curl", "")),
      byline: byline(info.authors),
    });
  }
  return results;
}

type OpenLibraryDoc = {
  key?: string;
  title?: string;
  author_name?: string[];
  first_publish_year?: number;
  cover_i?: number;
};

async function searchOpenLibrary(query: string): Promise<CatalogResult[]> {
  const params = new URLSearchParams({
    q: query,
    fields: "key,title,author_name,first_publish_year,cover_i",
    limit: String(SEARCH_MAX_RESULTS),
  });
  const response = await fetch(`${OPEN_LIBRARY_URL}?${params}`, {
    // Open Library asks callers to name themselves
    headers: { "User-Agent": "Bitacora360 (personal, non-commercial project)" },
    signal: AbortSignal.timeout(CATALOG_TIMEOUT_MS),
  });
  if (!response.ok) throw new Error(`Open Library answered ${response.status}`);

  const body = (await response.json()) as { docs?: OpenLibraryDoc[] };
  const results: CatalogResult[] = [];
  for (const doc of body.docs ?? []) {
    const title = cleanTitle(doc.title);
    // "/works/OL274505W" -> "OL274505W"
    const catalogId = cleanCatalogId(doc.key?.replace(/^\/works\//, ""));
    if (!title || !catalogId) continue;
    results.push({
      source: "open_library",
      catalogId,
      title,
      year: yearOf(doc.first_publish_year),
      posterUrl: doc.cover_i
        ? cleanPosterUrl(`${OPEN_LIBRARY_COVERS_URL}/${doc.cover_i}-M.jpg`)
        : null,
      byline: byline(doc.author_name),
    });
  }
  return results;
}

/** Google Books first; Open Library when Google fails or finds nothing. */
export async function searchBooks(query: string): Promise<CatalogResult[]> {
  try {
    const results = await searchGoogleBooks(query);
    if (results.length > 0) return results;
  } catch (error) {
    console.warn("Google Books search failed, falling back to Open Library:", error);
  }
  return searchOpenLibrary(query);
}
