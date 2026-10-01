-- Habits module: daily habits (with completions) and the gym log.
-- Every row belongs to one user. Row Level Security restricts each table to
-- its owner, so the browser can query Supabase directly with the anon key.

-- Replaces the first draft of the habits tables, which were created by hand in
-- the dashboard and never held data. Dropping a table also drops its policies,
-- indexes and constraints. habit_logs goes first because it references habits.
drop table if exists public.habit_logs;
drop table if exists public.habits;

-- ---------------------------------------------------------------------------
-- Habits
-- ---------------------------------------------------------------------------

create table public.habits (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null default auth.uid() references auth.users (id) on delete cascade,
  name text not null check (char_length(btrim(name)) between 1 and 80),
  -- Days of the week the habit is scheduled: 0 = Sunday ... 6 = Saturday
  -- (same numbering as JavaScript's Date.getDay()).
  weekdays smallint[] not null default '{0,1,2,3,4,5,6}'
    check (
      cardinality(weekdays) between 1 and 7
      and weekdays <@ '{0,1,2,3,4,5,6}'::smallint[]
    ),
  -- Archived habits keep their history but leave the daily list.
  archived_at timestamptz,
  created_at timestamptz not null default now()
);

create index habits_user_id_idx on public.habits (user_id);

alter table public.habits enable row level security;

create policy "habits: owner has full access"
  on public.habits
  for all
  to authenticated
  using ((select auth.uid()) = user_id)
  with check ((select auth.uid()) = user_id);

-- One row per habit per calendar day it was completed. The day is the user's
-- local date, sent by the client, so it never shifts with time zones.
create table public.habit_completions (
  habit_id uuid not null references public.habits (id) on delete cascade,
  user_id uuid not null default auth.uid() references auth.users (id) on delete cascade,
  completed_on date not null,
  created_at timestamptz not null default now(),
  primary key (habit_id, completed_on)
);

create index habit_completions_user_date_idx
  on public.habit_completions (user_id, completed_on);

alter table public.habit_completions enable row level security;

create policy "habit_completions: owner has full access"
  on public.habit_completions
  for all
  to authenticated
  using ((select auth.uid()) = user_id)
  with check (
    (select auth.uid()) = user_id
    and exists (
      select 1
      from public.habits h
      where h.id = habit_id
        and h.user_id = (select auth.uid())
    )
  );

-- ---------------------------------------------------------------------------
-- Gym log
-- ---------------------------------------------------------------------------

-- The user's own exercise catalog ("Sentadilla", "Press banca", ...).
create table public.exercises (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null default auth.uid() references auth.users (id) on delete cascade,
  name text not null check (char_length(btrim(name)) between 1 and 60),
  created_at timestamptz not null default now()
);

create unique index exercises_user_name_key
  on public.exercises (user_id, lower(name));

alter table public.exercises enable row level security;

create policy "exercises: owner has full access"
  on public.exercises
  for all
  to authenticated
  using ((select auth.uid()) = user_id)
  with check ((select auth.uid()) = user_id);

-- A training session on a given day.
create table public.workouts (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null default auth.uid() references auth.users (id) on delete cascade,
  performed_on date not null,
  title text check (title is null or char_length(btrim(title)) between 1 and 60),
  created_at timestamptz not null default now()
);

create index workouts_user_date_idx
  on public.workouts (user_id, performed_on desc);

alter table public.workouts enable row level security;

create policy "workouts: owner has full access"
  on public.workouts
  for all
  to authenticated
  using ((select auth.uid()) = user_id)
  with check ((select auth.uid()) = user_id);

-- One set of one exercise inside a workout: reps x weight.
create table public.workout_sets (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null default auth.uid() references auth.users (id) on delete cascade,
  workout_id uuid not null references public.workouts (id) on delete cascade,
  -- "restrict" so deleting an exercise can never silently erase logged sets.
  exercise_id uuid not null references public.exercises (id) on delete restrict,
  reps smallint not null check (reps between 1 and 1000),
  -- 0 means bodyweight.
  weight_kg numeric(6, 2) not null default 0 check (weight_kg >= 0),
  created_at timestamptz not null default now()
);

create index workout_sets_workout_id_idx on public.workout_sets (workout_id);
create index workout_sets_exercise_id_idx on public.workout_sets (exercise_id);

alter table public.workout_sets enable row level security;

create policy "workout_sets: owner has full access"
  on public.workout_sets
  for all
  to authenticated
  using ((select auth.uid()) = user_id)
  with check (
    (select auth.uid()) = user_id
    and exists (
      select 1
      from public.workouts w
      where w.id = workout_id
        and w.user_id = (select auth.uid())
    )
    and exists (
      select 1
      from public.exercises e
      where e.id = exercise_id
        and e.user_id = (select auth.uid())
    )
  );

-- ---------------------------------------------------------------------------
-- Data API access: only signed-in users, and RLS narrows it to their own rows.
-- ---------------------------------------------------------------------------

grant select, insert, update, delete
  on public.habits,
     public.habit_completions,
     public.exercises,
     public.workouts,
     public.workout_sets
  to authenticated;
