"use client";

import { useEffect, useState } from "react";
import { createClient } from "@/core/lib/supabase-client";
import {
  createWatchlistItem,
  deleteWatchlistItem,
  listWatchlistItems,
  updateWatchlistItem,
} from "../api";
import type { LoadStatus, WatchlistItem, WatchlistItemInput } from "../types";

const SAVE_ERROR = "No pudimos guardar el cambio. Revisa tu conexión e intenta de nuevo.";

/**
 * Loads the watchlist and exposes the writes. Every write resolves to `true`
 * on success; on failure it resolves to `false` and sets `actionError`.
 */
export function useWatchlist() {
  const [status, setStatus] = useState<LoadStatus>("loading");
  const [items, setItems] = useState<WatchlistItem[]>([]);
  const [actionError, setActionError] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;

    async function load() {
      try {
        const loaded = await listWatchlistItems(createClient());
        if (cancelled) return;
        setItems(loaded);
        setStatus("ready");
      } catch {
        if (!cancelled) setStatus("error");
      }
    }

    load();
    return () => {
      cancelled = true;
    };
  }, []);

  async function attempt(write: () => Promise<void>): Promise<boolean> {
    setActionError(null);
    try {
      await write();
      return true;
    } catch {
      setActionError(SAVE_ERROR);
      return false;
    }
  }

  function addItem(input: WatchlistItemInput): Promise<boolean> {
    return attempt(async () => {
      const created = await createWatchlistItem(createClient(), input);
      setItems((prev) => [created, ...prev]);
    });
  }

  /** Saves only the fields in `change`: a full edit, a new status or a rating. */
  function editItem(id: string, change: Partial<WatchlistItemInput>): Promise<boolean> {
    return attempt(async () => {
      const updated = await updateWatchlistItem(createClient(), id, change);
      setItems((prev) => prev.map((item) => (item.id === id ? updated : item)));
    });
  }

  function removeItem(id: string): Promise<boolean> {
    return attempt(async () => {
      await deleteWatchlistItem(createClient(), id);
      setItems((prev) => prev.filter((item) => item.id !== id));
    });
  }

  return {
    status,
    /** Newest first. */
    items,
    actionError,
    /** Dismisses `actionError`, e.g. when the form that failed is closed. */
    clearActionError: () => setActionError(null),
    addItem,
    editItem,
    removeItem,
  };
}
