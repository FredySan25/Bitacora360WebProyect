-- Catalog metadata for watchlist items: the poster or cover, the year and the
-- id in the catalog it came from (TMDB for movies and series, Google Books or
-- Open Library for books). Every column is optional: typing a title by hand
-- still works, and existing rows keep working without a poster.
-- Only adds nullable columns and checks, so no row changes.

alter table public.watchlist_items
  -- Only the image hosts of the catalogs, always over https.
  add column poster_url text check (
    poster_url is null or (
      char_length(poster_url) <= 500
      and poster_url ~ '^https://(image\.tmdb\.org|books\.google\.com|covers\.openlibrary\.org)/'
    )
  ),
  add column release_year smallint check (release_year between 1 and 2100),
  add column catalog_source text check (catalog_source in ('tmdb', 'google_books', 'open_library')),
  add column catalog_id text check (char_length(catalog_id) between 1 and 64),
  -- A catalog link has both its source and its id, or neither.
  add constraint watchlist_items_catalog_pair check (
    (catalog_source is null) = (catalog_id is null)
  ),
  -- TMDB is for movies and series; the book catalogs are for books.
  add constraint watchlist_items_catalog_matches_type check (
    catalog_source is null or (catalog_source = 'tmdb') = (media_type in ('movie', 'series'))
  ),
  -- Posters only come from a catalog.
  add constraint watchlist_items_poster_requires_catalog check (
    poster_url is null or catalog_source is not null
  );
