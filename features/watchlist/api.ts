import type { SupabaseClient } from "@supabase/supabase-js";
import type { MediaType, WatchlistItem, WatchlistItemInput, WatchStatus } from "./types";

/*
 * All Supabase queries for the watchlist module. Every function receives the
 * client (browser or server) and throws on error; RLS scopes rows to the
 * signed-in user, so no query filters by user_id.
 */

type ItemRow = {
  id: string;
  title: string;
  media_type: MediaType;
  status: WatchStatus;
  rating: number | null;
  finished_on: string | null;
  note: string | null;
  created_at: string;
};

const ITEM_COLUMNS = "id, title, media_type, status, rating, finished_on, note, created_at";

function toItem(row: ItemRow): WatchlistItem {
  return {
    id: row.id,
    title: row.title,
    mediaType: row.media_type,
    status: row.status,
    rating: row.rating,
    finishedOn: row.finished_on,
    note: row.note,
    createdAt: row.created_at,
  };
}

function toItemRow(input: Partial<WatchlistItemInput>) {
  return {
    title: input.title,
    media_type: input.mediaType,
    status: input.status,
    rating: input.rating,
    finished_on: input.finishedOn,
    note: input.note,
  };
}

// Supabase returns at most 1000 rows per request by default.
const PAGE_SIZE = 1000;

/** Every item, newest first. */
export async function listWatchlistItems(supabase: SupabaseClient): Promise<WatchlistItem[]> {
  const rows: ItemRow[] = [];
  for (let offset = 0; ; offset += PAGE_SIZE) {
    const { data, error } = await supabase
      .from("watchlist_items")
      .select(ITEM_COLUMNS)
      .order("created_at", { ascending: false })
      .order("id", { ascending: true })
      .range(offset, offset + PAGE_SIZE - 1)
      .overrideTypes<ItemRow[], { merge: false }>();
    if (error) throw error;
    rows.push(...data);
    if (data.length < PAGE_SIZE) break;
  }
  return rows.map(toItem);
}

export async function createWatchlistItem(
  supabase: SupabaseClient,
  input: WatchlistItemInput,
): Promise<WatchlistItem> {
  const { data, error } = await supabase
    .from("watchlist_items")
    .insert(toItemRow(input))
    .select(ITEM_COLUMNS)
    .single()
    .overrideTypes<ItemRow, { merge: false }>();
  if (error) throw error;
  return toItem(data);
}

/** Updates only the fields present in `change`. */
export async function updateWatchlistItem(
  supabase: SupabaseClient,
  id: string,
  change: Partial<WatchlistItemInput>,
): Promise<WatchlistItem> {
  const { data, error } = await supabase
    .from("watchlist_items")
    // JSON drops the undefined fields, so they keep their value
    .update(toItemRow(change))
    .eq("id", id)
    .select(ITEM_COLUMNS)
    .single()
    .overrideTypes<ItemRow, { merge: false }>();
  if (error) throw error;
  return toItem(data);
}

export async function deleteWatchlistItem(supabase: SupabaseClient, id: string): Promise<void> {
  const { error } = await supabase.from("watchlist_items").delete().eq("id", id);
  if (error) throw error;
}
