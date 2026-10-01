import type { SupabaseClient } from "@supabase/supabase-js";
import type {
  DateKey,
  Exercise,
  Habit,
  HabitCompletion,
  HabitInput,
  Workout,
  WorkoutInput,
  WorkoutSet,
} from "./types";

/*
 * All Supabase queries for the habits module. Every function receives the
 * client (browser or server) and throws on error; RLS scopes rows to the
 * signed-in user, so no query filters by user_id.
 */

// --- Habits ----------------------------------------------------------------

type HabitRow = {
  id: string;
  name: string;
  weekdays: number[];
  archived_at: string | null;
  created_at: string;
};

const HABIT_COLUMNS = "id, name, weekdays, archived_at, created_at";

function toHabit(row: HabitRow): Habit {
  return {
    id: row.id,
    name: row.name,
    weekdays: row.weekdays,
    archivedAt: row.archived_at,
    createdAt: row.created_at,
  };
}

/** Active and archived habits, oldest first. */
export async function listHabits(supabase: SupabaseClient): Promise<Habit[]> {
  const { data, error } = await supabase
    .from("habits")
    .select(HABIT_COLUMNS)
    .order("created_at", { ascending: true })
    .overrideTypes<HabitRow[], { merge: false }>();
  if (error) throw error;
  return data.map(toHabit);
}

export async function createHabit(supabase: SupabaseClient, input: HabitInput): Promise<Habit> {
  const { data, error } = await supabase
    .from("habits")
    .insert({ name: input.name, weekdays: input.weekdays })
    .select(HABIT_COLUMNS)
    .single()
    .overrideTypes<HabitRow, { merge: false }>();
  if (error) throw error;
  return toHabit(data);
}

export async function updateHabit(
  supabase: SupabaseClient,
  id: string,
  input: HabitInput,
): Promise<Habit> {
  const { data, error } = await supabase
    .from("habits")
    .update({ name: input.name, weekdays: input.weekdays })
    .eq("id", id)
    .select(HABIT_COLUMNS)
    .single()
    .overrideTypes<HabitRow, { merge: false }>();
  if (error) throw error;
  return toHabit(data);
}

export async function setHabitArchived(
  supabase: SupabaseClient,
  id: string,
  archived: boolean,
): Promise<Habit> {
  const { data, error } = await supabase
    .from("habits")
    .update({ archived_at: archived ? new Date().toISOString() : null })
    .eq("id", id)
    .select(HABIT_COLUMNS)
    .single()
    .overrideTypes<HabitRow, { merge: false }>();
  if (error) throw error;
  return toHabit(data);
}

/** Deletes the habit and, by cascade, all its completions. */
export async function deleteHabit(supabase: SupabaseClient, id: string): Promise<void> {
  const { error } = await supabase.from("habits").delete().eq("id", id);
  if (error) throw error;
}

// --- Habit completions -----------------------------------------------------

type CompletionRow = { habit_id: string; completed_on: string };

// Supabase returns at most 1000 rows per request by default.
const PAGE_SIZE = 1000;

/** Every completion on or after `since`. */
export async function listCompletions(
  supabase: SupabaseClient,
  since: DateKey,
): Promise<HabitCompletion[]> {
  const rows: CompletionRow[] = [];
  for (let from = 0; ; from += PAGE_SIZE) {
    const { data, error } = await supabase
      .from("habit_completions")
      .select("habit_id, completed_on")
      .gte("completed_on", since)
      .order("completed_on", { ascending: true })
      .order("habit_id", { ascending: true })
      .range(from, from + PAGE_SIZE - 1)
      .overrideTypes<CompletionRow[], { merge: false }>();
    if (error) throw error;
    rows.push(...data);
    if (data.length < PAGE_SIZE) break;
  }
  return rows.map((row) => ({ habitId: row.habit_id, completedOn: row.completed_on }));
}

/** Marks or unmarks a habit as done on a given day. Safe to repeat. */
export async function setCompletion(
  supabase: SupabaseClient,
  habitId: string,
  day: DateKey,
  done: boolean,
): Promise<void> {
  const { error } = done
    ? await supabase
        .from("habit_completions")
        .upsert(
          { habit_id: habitId, completed_on: day },
          { onConflict: "habit_id,completed_on", ignoreDuplicates: true },
        )
    : await supabase
        .from("habit_completions")
        .delete()
        .eq("habit_id", habitId)
        .eq("completed_on", day);
  if (error) throw error;
}

// --- Gym log ---------------------------------------------------------------

type ExerciseRow = { id: string; name: string };

type WorkoutSetRow = {
  id: string;
  workout_id: string;
  exercise_id: string;
  reps: number;
  weight_kg: number;
};

type WorkoutRow = {
  id: string;
  performed_on: string;
  title: string | null;
  workout_sets: WorkoutSetRow[];
};

const SET_COLUMNS = "id, workout_id, exercise_id, reps, weight_kg";
const WORKOUT_COLUMNS = `id, performed_on, title, workout_sets(${SET_COLUMNS})`;

function toWorkoutSet(row: WorkoutSetRow): WorkoutSet {
  return {
    id: row.id,
    workoutId: row.workout_id,
    exerciseId: row.exercise_id,
    reps: row.reps,
    weightKg: Number(row.weight_kg),
  };
}

function toWorkout(row: WorkoutRow): Workout {
  return {
    id: row.id,
    performedOn: row.performed_on,
    title: row.title,
    sets: row.workout_sets.map(toWorkoutSet),
  };
}

export async function listExercises(supabase: SupabaseClient): Promise<Exercise[]> {
  const { data, error } = await supabase
    .from("exercises")
    .select("id, name")
    .order("name", { ascending: true })
    .overrideTypes<ExerciseRow[], { merge: false }>();
  if (error) throw error;
  return data;
}

export async function createExercise(supabase: SupabaseClient, name: string): Promise<Exercise> {
  const { data, error } = await supabase
    .from("exercises")
    .insert({ name })
    .select("id, name")
    .single()
    .overrideTypes<ExerciseRow, { merge: false }>();
  if (error) throw error;
  return data;
}

/** The most recent workouts with their sets, newest first. */
export async function listWorkouts(supabase: SupabaseClient, limit: number): Promise<Workout[]> {
  const { data, error } = await supabase
    .from("workouts")
    .select(WORKOUT_COLUMNS)
    .order("performed_on", { ascending: false })
    .order("created_at", { ascending: false })
    .order("created_at", { referencedTable: "workout_sets", ascending: true })
    .limit(limit)
    .overrideTypes<WorkoutRow[], { merge: false }>();
  if (error) throw error;
  return data.map(toWorkout);
}

export async function createWorkout(
  supabase: SupabaseClient,
  input: WorkoutInput,
): Promise<Workout> {
  const { data, error } = await supabase
    .from("workouts")
    .insert({ performed_on: input.performedOn, title: input.title })
    .select(WORKOUT_COLUMNS)
    .single()
    .overrideTypes<WorkoutRow, { merge: false }>();
  if (error) throw error;
  return toWorkout(data);
}

/** Deletes the workout and, by cascade, all its sets. */
export async function deleteWorkout(supabase: SupabaseClient, id: string): Promise<void> {
  const { error } = await supabase.from("workouts").delete().eq("id", id);
  if (error) throw error;
}

export async function createWorkoutSet(
  supabase: SupabaseClient,
  input: { workoutId: string; exerciseId: string; reps: number; weightKg: number },
): Promise<WorkoutSet> {
  const { data, error } = await supabase
    .from("workout_sets")
    .insert({
      workout_id: input.workoutId,
      exercise_id: input.exerciseId,
      reps: input.reps,
      weight_kg: input.weightKg,
    })
    .select(SET_COLUMNS)
    .single()
    .overrideTypes<WorkoutSetRow, { merge: false }>();
  if (error) throw error;
  return toWorkoutSet(data);
}

export async function deleteWorkoutSet(supabase: SupabaseClient, id: string): Promise<void> {
  const { error } = await supabase.from("workout_sets").delete().eq("id", id);
  if (error) throw error;
}
