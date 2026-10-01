"use client";

import { useEffect, useState } from "react";
import { createClient } from "@/core/lib/supabase-client";
import {
  createHabit,
  deleteHabit,
  listCompletions,
  listHabits,
  setCompletion,
  setHabitArchived,
  updateHabit,
} from "../api";
import { addDays, todayKey } from "../dates";
import { completionKey } from "../stats";
import type { DateKey, Habit, HabitInput, LoadStatus } from "../types";

/** How far back completions are loaded; streaks and charts can't see past it. */
const HISTORY_DAYS = 365;

const SAVE_ERROR = "No pudimos guardar el cambio. Revisa tu conexión e intenta de nuevo.";

/**
 * Loads the user's habits and recent completions, and exposes the writes.
 * Every write resolves to `true` on success; on failure it resolves to
 * `false` and sets `actionError`.
 */
export function useHabits() {
  const [today] = useState(todayKey);
  const since = addDays(today, -HISTORY_DAYS);

  const [status, setStatus] = useState<LoadStatus>("loading");
  const [allHabits, setAllHabits] = useState<Habit[]>([]);
  const [completions, setCompletions] = useState<ReadonlySet<string>>(new Set());
  const [actionError, setActionError] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;

    async function load() {
      try {
        const supabase = createClient();
        const [habits, completed] = await Promise.all([
          listHabits(supabase),
          listCompletions(supabase, since),
        ]);
        if (cancelled) return;
        setAllHabits(habits);
        setCompletions(new Set(completed.map((c) => completionKey(c.habitId, c.completedOn))));
        setStatus("ready");
      } catch {
        if (!cancelled) setStatus("error");
      }
    }

    load();
    return () => {
      cancelled = true;
    };
  }, [since]);

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

  function replaceHabit(updated: Habit) {
    setAllHabits((prev) => prev.map((habit) => (habit.id === updated.id ? updated : habit)));
  }

  /** Flips a habit's completion for a day. Optimistic: rolls back if the save fails. */
  async function toggleCompletion(habitId: string, day: DateKey): Promise<boolean> {
    const key = completionKey(habitId, day);
    const done = !completions.has(key);

    const apply = (value: boolean) =>
      setCompletions((prev) => {
        const next = new Set(prev);
        if (value) next.add(key);
        else next.delete(key);
        return next;
      });

    apply(done);
    const ok = await attempt(() => setCompletion(createClient(), habitId, day, done));
    if (!ok) apply(!done);
    return ok;
  }

  function addHabit(input: HabitInput): Promise<boolean> {
    return attempt(async () => {
      const created = await createHabit(createClient(), input);
      setAllHabits((prev) => [...prev, created]);
    });
  }

  function editHabit(id: string, input: HabitInput): Promise<boolean> {
    return attempt(async () => replaceHabit(await updateHabit(createClient(), id, input)));
  }

  function archiveHabit(id: string): Promise<boolean> {
    return attempt(async () => replaceHabit(await setHabitArchived(createClient(), id, true)));
  }

  function restoreHabit(id: string): Promise<boolean> {
    return attempt(async () => replaceHabit(await setHabitArchived(createClient(), id, false)));
  }

  /** Deletes the habit along with its whole history. */
  function removeHabit(id: string): Promise<boolean> {
    return attempt(async () => {
      await deleteHabit(createClient(), id);
      setAllHabits((prev) => prev.filter((habit) => habit.id !== id));
    });
  }

  return {
    status,
    /** Active (non-archived) habits, oldest first. */
    habits: allHabits.filter((habit) => !habit.archivedAt),
    archivedHabits: allHabits.filter((habit) => habit.archivedAt),
    /** Set of `completionKey(habitId, day)` for every completed day since `since`. */
    completions,
    today,
    since,
    actionError,
    toggleCompletion,
    addHabit,
    editHabit,
    archiveHabit,
    restoreHabit,
    removeHabit,
  };
}
