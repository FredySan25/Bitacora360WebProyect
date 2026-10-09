"use client";

import { useEffect, useState } from "react";
import { createClient } from "@/core/lib/supabase-client";
import {
  createContribution,
  createSavingsGoal,
  deleteContribution,
  deleteSavingsGoal,
  listSavingsGoals,
  updateSavingsGoal,
} from "../api";
import type { ContributionInput, LoadStatus, SavingsGoal, SavingsGoalInput } from "../types";

const SAVE_ERROR = "No pudimos guardar el cambio. Revisa tu conexión e intenta de nuevo.";

/**
 * Loads the savings goals with their contributions and exposes the writes.
 * Every write resolves to `true` on success; on failure it resolves to
 * `false` and sets `actionError`.
 */
export function useSavingsGoals() {
  const [status, setStatus] = useState<LoadStatus>("loading");
  const [goals, setGoals] = useState<SavingsGoal[]>([]);
  const [actionError, setActionError] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;

    async function load() {
      try {
        const loaded = await listSavingsGoals(createClient());
        if (cancelled) return;
        setGoals(loaded);
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

  function updateGoal(id: string, change: (goal: SavingsGoal) => SavingsGoal) {
    setGoals((prev) => prev.map((goal) => (goal.id === id ? change(goal) : goal)));
  }

  function addGoal(input: SavingsGoalInput): Promise<boolean> {
    return attempt(async () => {
      const created = await createSavingsGoal(createClient(), input);
      setGoals((prev) => [...prev, created]);
    });
  }

  function editGoal(id: string, input: SavingsGoalInput): Promise<boolean> {
    return attempt(async () => {
      const updated = await updateSavingsGoal(createClient(), id, input);
      updateGoal(id, (goal) => ({ ...goal, ...updated }));
    });
  }

  /** Deletes the goal along with all its contributions. */
  function removeGoal(id: string): Promise<boolean> {
    return attempt(async () => {
      await deleteSavingsGoal(createClient(), id);
      setGoals((prev) => prev.filter((goal) => goal.id !== id));
    });
  }

  function addContribution(goalId: string, input: ContributionInput): Promise<boolean> {
    return attempt(async () => {
      const created = await createContribution(createClient(), goalId, input);
      updateGoal(goalId, (goal) => ({
        ...goal,
        // Newest day first; the stable sort keeps the new one on top of its day
        contributions: [created, ...goal.contributions].sort((a, b) =>
          b.contributedOn.localeCompare(a.contributedOn),
        ),
      }));
    });
  }

  function removeContribution(goalId: string, contributionId: string): Promise<boolean> {
    return attempt(async () => {
      await deleteContribution(createClient(), contributionId);
      updateGoal(goalId, (goal) => ({
        ...goal,
        contributions: goal.contributions.filter((c) => c.id !== contributionId),
      }));
    });
  }

  return {
    status,
    /** Oldest first. */
    goals,
    actionError,
    /** Dismisses `actionError`, e.g. when the form that failed is closed. */
    clearActionError: () => setActionError(null),
    addGoal,
    editGoal,
    removeGoal,
    addContribution,
    removeContribution,
  };
}
