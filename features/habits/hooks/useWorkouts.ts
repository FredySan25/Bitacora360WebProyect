"use client";

import { useEffect, useState } from "react";
import { createClient } from "@/core/lib/supabase-client";
import {
  createExercise,
  createWorkout,
  createWorkoutSet,
  deleteWorkout,
  deleteWorkoutSet,
  listExercises,
  listWorkouts,
} from "../api";
import type { Exercise, LoadStatus, Workout, WorkoutInput, WorkoutSetInput } from "../types";

/** How many of the most recent workouts are loaded (list and progress chart). */
const WORKOUT_LIMIT = 150;

const SAVE_ERROR = "No pudimos guardar el cambio. Revisa tu conexión e intenta de nuevo.";

/**
 * Loads the gym log (workouts with their sets, plus the exercise catalog) and
 * exposes the writes. Every write resolves to `true` on success; on failure
 * it resolves to `false` and sets `actionError`.
 */
export function useWorkouts() {
  const [status, setStatus] = useState<LoadStatus>("loading");
  const [exercises, setExercises] = useState<Exercise[]>([]);
  const [workouts, setWorkouts] = useState<Workout[]>([]);
  const [actionError, setActionError] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;

    async function load() {
      try {
        const supabase = createClient();
        const [loadedExercises, loadedWorkouts] = await Promise.all([
          listExercises(supabase),
          listWorkouts(supabase, WORKOUT_LIMIT),
        ]);
        if (cancelled) return;
        setExercises(loadedExercises);
        setWorkouts(loadedWorkouts);
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

  function addWorkout(input: WorkoutInput): Promise<boolean> {
    return attempt(async () => {
      const created = await createWorkout(createClient(), input);
      // Newest day first; the stable sort keeps the new one on top of its day
      setWorkouts((prev) =>
        [created, ...prev].sort((a, b) => b.performedOn.localeCompare(a.performedOn)),
      );
    });
  }

  /** Deletes the workout along with all its sets. */
  function removeWorkout(id: string): Promise<boolean> {
    return attempt(async () => {
      await deleteWorkout(createClient(), id);
      setWorkouts((prev) => prev.filter((workout) => workout.id !== id));
    });
  }

  /** Logs a set; the exercise is created on the fly if it's a new name. */
  function addSet(workoutId: string, input: WorkoutSetInput): Promise<boolean> {
    return attempt(async () => {
      const supabase = createClient();
      const name = input.exerciseName.trim();

      let exercise = exercises.find((e) => e.name.toLowerCase() === name.toLowerCase());
      if (!exercise) {
        const created = await createExercise(supabase, name);
        exercise = created;
        setExercises((prev) =>
          [...prev, created].sort((a, b) => a.name.localeCompare(b.name, "es")),
        );
      }

      const set = await createWorkoutSet(supabase, {
        workoutId,
        exerciseId: exercise.id,
        reps: input.reps,
        weightKg: input.weightKg,
      });
      setWorkouts((prev) =>
        prev.map((workout) =>
          workout.id === workoutId ? { ...workout, sets: [...workout.sets, set] } : workout,
        ),
      );
    });
  }

  function removeSet(workoutId: string, setId: string): Promise<boolean> {
    return attempt(async () => {
      await deleteWorkoutSet(createClient(), setId);
      setWorkouts((prev) =>
        prev.map((workout) =>
          workout.id === workoutId
            ? { ...workout, sets: workout.sets.filter((set) => set.id !== setId) }
            : workout,
        ),
      );
    });
  }

  return {
    status,
    exercises,
    /** Newest first. */
    workouts,
    actionError,
    addWorkout,
    removeWorkout,
    addSet,
    removeSet,
  };
}
