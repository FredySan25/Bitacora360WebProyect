"use client";

import { useEffect, useState } from "react";
import { addMonths, firstDayOf, lastDayOf, type MonthKey } from "@/core/lib/dates";
import { createClient } from "@/core/lib/supabase-client";
import { createTransaction, deleteTransaction, listTransactions, updateTransaction } from "../api";
import { TREND_MONTHS } from "../constants";
import type { LoadStatus, Transaction, TransactionInput } from "../types";

const SAVE_ERROR = "No pudimos guardar el cambio. Revisa tu conexión e intenta de nuevo.";

/** Newest day first; on the same day, the one registered last goes first. */
function byNewest(a: Transaction, b: Transaction): number {
  return b.occurredOn.localeCompare(a.occurredOn) || b.createdAt.localeCompare(a.createdAt);
}

/**
 * Loads the transactions of the `months` months that end on `month` (the
 * selected one plus what the comparisons and the trend look back on) and
 * exposes the writes. Every write resolves to `true` on success; on failure
 * it resolves to `false` and sets `actionError`.
 */
export function useTransactions(month: MonthKey, months: number = TREND_MONTHS) {
  const [status, setStatus] = useState<LoadStatus>("loading");
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [loadedMonth, setLoadedMonth] = useState<MonthKey | null>(null);
  const [actionError, setActionError] = useState<string | null>(null);

  const from = firstDayOf(addMonths(month, -(months - 1)));
  const to = lastDayOf(month);

  useEffect(() => {
    let cancelled = false;

    async function load() {
      try {
        const loaded = await listTransactions(createClient(), from, to);
        if (cancelled) return;
        setTransactions(loaded);
        setLoadedMonth(month);
        setStatus("ready");
      } catch {
        if (!cancelled) setStatus("error");
      }
    }

    load();
    return () => {
      cancelled = true;
    };
  }, [month, from, to]);

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

  /** Keeps only what the loaded window covers, in order. */
  function arrange(list: Transaction[]): Transaction[] {
    return list.filter((t) => t.occurredOn >= from && t.occurredOn <= to).sort(byNewest);
  }

  function addTransaction(input: TransactionInput): Promise<boolean> {
    return attempt(async () => {
      const created = await createTransaction(createClient(), input);
      setTransactions((prev) => arrange([created, ...prev]));
    });
  }

  function editTransaction(id: string, input: TransactionInput): Promise<boolean> {
    return attempt(async () => {
      const updated = await updateTransaction(createClient(), id, input);
      setTransactions((prev) => arrange(prev.map((t) => (t.id === id ? updated : t))));
    });
  }

  function removeTransaction(id: string): Promise<boolean> {
    return attempt(async () => {
      await deleteTransaction(createClient(), id);
      setTransactions((prev) => prev.filter((t) => t.id !== id));
    });
  }

  return {
    status,
    /** Newest first. While `refreshing`, they still belong to `loadedMonth`. */
    transactions,
    /**
     * The month the transactions on hand were loaded for. After a change of
     * month it lags behind until the new ones arrive, so a view can hold what
     * it was showing instead of flashing an empty month.
     */
    loadedMonth: loadedMonth ?? month,
    /** True from a change of month until its transactions arrive. */
    refreshing: status === "ready" && loadedMonth !== month,
    actionError,
    /** Dismisses `actionError`, e.g. when the form that failed is closed. */
    clearActionError: () => setActionError(null),
    addTransaction,
    editTransaction,
    removeTransaction,
  };
}
