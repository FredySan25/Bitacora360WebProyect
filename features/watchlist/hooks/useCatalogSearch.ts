"use client";

import { useEffect, useState } from "react";
import type { CatalogResult } from "../catalog/types";
import { SEARCH_MIN_LENGTH } from "../constants";
import type { MediaType } from "../types";

/** Waits for the user to stop typing before searching. */
const DEBOUNCE_MS = 300;

export type CatalogSearch =
  | { status: "idle" | "loading" | "error"; results: [] }
  | { status: "ready"; results: CatalogResult[] };

type Answer = { key: string } & CatalogSearch;

const IDLE: CatalogSearch = { status: "idle", results: [] };
const LOADING: CatalogSearch = { status: "loading", results: [] };

/**
 * Searches the catalog of `type` for `query` once the user stops typing.
 * Idle while `enabled` is false or the query is too short; a newer query
 * cancels the request of the previous one.
 */
export function useCatalogSearch(type: MediaType, query: string, enabled: boolean): CatalogSearch {
  const q = query.trim();
  const key = enabled && q.length >= SEARCH_MIN_LENGTH ? `${type}\n${q}` : null;
  const [answer, setAnswer] = useState<Answer | null>(null);

  useEffect(() => {
    if (!key) return;
    const controller = new AbortController();

    const timer = setTimeout(async () => {
      try {
        const response = await fetch(`/api/watchlist/search?${new URLSearchParams({ type, q })}`, {
          signal: controller.signal,
        });
        if (!response.ok) throw new Error(`Search answered ${response.status}`);
        const body = (await response.json()) as { results: CatalogResult[] };
        setAnswer({ key, status: "ready", results: body.results });
      } catch {
        if (!controller.signal.aborted) setAnswer({ key, status: "error", results: [] });
      }
    }, DEBOUNCE_MS);

    return () => {
      clearTimeout(timer);
      controller.abort();
    };
  }, [key, type, q]);

  if (!key) return IDLE;
  // Until the answer to this very query arrives, it is searching
  if (answer?.key !== key) return LOADING;
  return answer;
}
