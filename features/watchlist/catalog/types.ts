/** Catalogs an item can be picked from; the migration checks these keys. */
export type CatalogSource = "tmdb" | "google_books" | "open_library";

/** One search result, the same whatever catalog it came from. */
export type CatalogResult = {
  source: CatalogSource;
  catalogId: string;
  title: string;
  year: number | null;
  posterUrl: string | null;
  /** The authors of a book, only to tell editions apart; never saved. */
  byline: string | null;
};

/** What an item keeps of the result it was picked from. */
export type CatalogLink = {
  catalogSource: CatalogSource;
  catalogId: string;
  posterUrl: string | null;
  releaseYear: number | null;
};
