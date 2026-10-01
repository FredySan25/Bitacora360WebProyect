/** A calendar day as a local "YYYY-MM-DD" string (see `dates.ts`). */
export type DateKey = string;

export type Habit = {
  id: string;
  name: string;
  /** Scheduled days of the week: 0 = Sunday ... 6 = Saturday (as `Date.getDay()`). */
  weekdays: number[];
  archivedAt: string | null;
  createdAt: string;
};

export type HabitInput = {
  name: string;
  weekdays: number[];
};

export type HabitCompletion = {
  habitId: string;
  completedOn: DateKey;
};

export type Exercise = {
  id: string;
  name: string;
};

export type WorkoutSet = {
  id: string;
  workoutId: string;
  exerciseId: string;
  reps: number;
  /** 0 means bodyweight. */
  weightKg: number;
};

export type WorkoutSetInput = {
  exerciseName: string;
  reps: number;
  weightKg: number;
};

export type Workout = {
  id: string;
  performedOn: DateKey;
  title: string | null;
  /** In the order they were logged. */
  sets: WorkoutSet[];
};

export type WorkoutInput = {
  performedOn: DateKey;
  title: string | null;
};

export type LoadStatus = "loading" | "ready" | "error";
