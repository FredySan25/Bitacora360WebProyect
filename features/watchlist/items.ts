import type { DateKey } from "@/core/lib/dates";
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
