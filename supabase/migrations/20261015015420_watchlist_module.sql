-- Watchlist module: movies, series and books to watch or read, with a 1-5 star
-- rating once finished. Every row belongs to one user. Row Level Security
-- restricts the table to its owner, so the browser can query Supabase directly
-- with the anon key.

-- Replaces the first draft of the table, which was created by hand in the
-- dashboard with another shape (numeric ids, no finish date).
-- The draft is only dropped while it is empty: if it holds a single row, the
-- migration stops here and changes nothing, so it can never delete data.
do $$
declare
  has_rows boolean;
begin
  if to_regclass('public.watchlist_items') is not null then
    execute 'select exists (select 1 from public.watchlist_items)' into has_rows;
    if has_rows then
      raise exception
        'public.watchlist_items already holds rows: move them out before applying this migration';
    end if;
    drop table public.watchlist_items;
  end if;
end $$;

-- A movie, series or book. It starts pending, may be in progress, and once
-- done it records the day it was finished and, optionally, a whole-star rating.
-- Titles may repeat on purpose: remakes and new editions share them.
create table public.watchlist_items (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null default auth.uid() references auth.users (id) on delete cascade,
  title text not null check (char_length(btrim(title)) between 1 and 120),
  media_type text not null check (media_type in ('movie', 'series', 'book')),
  status text not null default 'pending' check (status in ('pending', 'in_progress', 'done')),
  rating smallint check (rating between 1 and 5),
  -- The user's local date, sent by the client, so it never shifts with time zones.
  finished_on date,
  note text check (note is null or char_length(btrim(note)) between 1 and 280),
  created_at timestamptz not null default now(),
  -- Only what was finished has a finish day, and everything finished has one.
  constraint watchlist_items_finished_on_matches_status check (
    (status = 'done') = (finished_on is not null)
  ),
  -- Only what was finished can be rated.
  constraint watchlist_items_rating_requires_done check (
    rating is null or status = 'done'
  )
);

create index watchlist_items_user_created_idx
  on public.watchlist_items (user_id, created_at desc);

alter table public.watchlist_items enable row level security;

create policy "watchlist_items: owner has full access"
  on public.watchlist_items
  for all
  to authenticated
  using ((select auth.uid()) = user_id)
  with check ((select auth.uid()) = user_id);

-- ---------------------------------------------------------------------------
-- Data API access: only signed-in users, and RLS narrows it to their own rows.
-- ---------------------------------------------------------------------------

grant select, insert, update, delete
  on public.watchlist_items
  to authenticated;
