"use client";

import { useEffect, useState } from "react";
import { firstDayOf, type MonthKey } from "@/core/lib/dates";
import { createClient } from "@/core/lib/supabase-client";
import { createBudget, deleteBudgets, listBudgets, updateBudgetLimit } from "../api";
import type { Budget, LoadStatus } from "../types";

const SAVE_ERROR = "No pudimos guardar el cambio. Revisa tu conexión e intenta de nuevo.";

/**
 * Loads every version of the user's budgets and exposes the writes. Every
 * write resolves to `true` on success; on failure it resolves to `false` and
 * sets `actionError`. `activeBudgets` in `stats.ts` picks the ones of a month.
 */
export function useBudgets() {
  const [status, setStatus] = useState<LoadStatus>("loading");
  const [budgets, setBudgets] = useState<Budget[]>([]);
  const [actionError, setActionError] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;

    async function load() {
      try {
        const loaded = await listBudgets(createClient());
        if (cancelled) return;
        setBudgets(loaded);
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

  /**
   * Sets a category's limit from `month` onwards. Earlier months keep the
   * limit they had: the change is saved as that month's own version.
   */
  function saveBudget(category: string, month: MonthKey, monthlyLimit: number): Promise<boolean> {
    return attempt(async () => {
      const supabase = createClient();
      const effectiveFrom = firstDayOf(month);
      const existing = budgets.find(
        (budget) => budget.category === category && budget.effectiveFrom === effectiveFrom,
      );

      if (existing) {
        const updated = await updateBudgetLimit(supabase, existing.id, monthlyLimit);
        setBudgets((prev) => prev.map((budget) => (budget.id === updated.id ? updated : budget)));
      } else {
        const created = await createBudget(supabase, { category, effectiveFrom, monthlyLimit });
        setBudgets((prev) => [...prev, created]);
      }
    });
  }

  /** Deletes a category's budget from every month. */
  function removeBudget(category: string): Promise<boolean> {
    return attempt(async () => {
      await deleteBudgets(createClient(), category);
      setBudgets((prev) => prev.filter((budget) => budget.category !== category));
    });
  }

  return {
    status,
    budgets,
    actionError,
    /** Dismisses `actionError`, e.g. when the form that failed is closed. */
    clearActionError: () => setActionError(null),
    saveBudget,
    removeBudget,
  };
}
