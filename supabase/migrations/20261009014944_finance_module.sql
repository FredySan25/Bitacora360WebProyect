-- Finance module: transactions, budgets per category and savings goals.
-- Every row belongs to one user. Row Level Security restricts each table to
-- its owner, so the browser can query Supabase directly with the anon key.

-- Replaces the first draft of the finance tables, which were created by hand in
-- the dashboard with another shape (numeric ids, no versions for budgets).
-- A draft is only dropped while it is empty: if it holds a single row, the
-- migration stops here and changes nothing, so it can never delete data.
do $$
declare
  draft text;
  has_rows boolean;
begin
  foreach draft in array array['transactions', 'budgets'] loop
    if to_regclass(format('public.%I', draft)) is not null then
      execute format('select exists (select 1 from public.%I)', draft) into has_rows;
      if has_rows then
        raise exception
          'public.% already holds rows: move them out before applying this migration', draft;
      end if;
      execute format('drop table public.%I', draft);
    end if;
  end loop;
end $$;

-- ---------------------------------------------------------------------------
-- Transactions
-- ---------------------------------------------------------------------------

-- Money in or out on a calendar day. The amount is always positive: the type
-- gives it its sign. Categories are fixed keys (labels live in the app, in
-- features/finance/constants.ts), so "food" can never be saved as "Food".
create table public.transactions (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null default auth.uid() references auth.users (id) on delete cascade,
  type text not null check (type in ('income', 'expense')),
  category text not null,
  amount numeric(12, 2) not null check (amount > 0),
  -- The user's local date, sent by the client, so it never shifts with time zones.
  occurred_on date not null,
  note text check (note is null or char_length(btrim(note)) between 1 and 200),
  created_at timestamptz not null default now(),
  constraint transactions_category_matches_type check (
    (
      type = 'expense'
      and category in (
        'food', 'transport', 'housing', 'utilities', 'health', 'education',
        'debt', 'entertainment', 'shopping', 'subscriptions', 'other'
      )
    )
    or (
      type = 'income'
      and category in ('salary', 'freelance', 'gift', 'other')
    )
  )
);

create index transactions_user_date_idx
  on public.transactions (user_id, occurred_on desc);

alter table public.transactions enable row level security;

create policy "transactions: owner has full access"
  on public.transactions
  for all
  to authenticated
  using ((select auth.uid()) = user_id)
  with check ((select auth.uid()) = user_id);

-- ---------------------------------------------------------------------------
-- Budgets
-- ---------------------------------------------------------------------------

-- A monthly spending limit for one expense category. Each row is a version:
-- it applies from its month onwards, until a later row of the same category
-- replaces it. Editing a budget in a month adds (or updates) that month's row,
-- so earlier months keep the limit they had.
create table public.budgets (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null default auth.uid() references auth.users (id) on delete cascade,
  category text not null check (
    category in (
      'food', 'transport', 'housing', 'utilities', 'health', 'education',
      'debt', 'entertainment', 'shopping', 'subscriptions', 'other'
    )
  ),
  -- First day of the month the limit starts to apply.
  effective_from date not null check (extract(day from effective_from) = 1),
  monthly_limit numeric(12, 2) not null check (monthly_limit > 0),
  created_at timestamptz not null default now()
);

-- One version per category per month. It also covers lookups by user_id.
create unique index budgets_user_category_month_key
  on public.budgets (user_id, category, effective_from);

alter table public.budgets enable row level security;

create policy "budgets: owner has full access"
  on public.budgets
  for all
  to authenticated
  using ((select auth.uid()) = user_id)
  with check ((select auth.uid()) = user_id);

-- ---------------------------------------------------------------------------
-- Savings goals
-- ---------------------------------------------------------------------------

-- Something to save for ("Fondo de emergencia", "Viaje"), with an optional deadline.
create table public.savings_goals (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null default auth.uid() references auth.users (id) on delete cascade,
  name text not null check (char_length(btrim(name)) between 1 and 60),
  target_amount numeric(12, 2) not null check (target_amount > 0),
  target_date date,
  created_at timestamptz not null default now()
);

create index savings_goals_user_id_idx on public.savings_goals (user_id);

alter table public.savings_goals enable row level security;

create policy "savings_goals: owner has full access"
  on public.savings_goals
  for all
  to authenticated
  using ((select auth.uid()) = user_id)
  with check ((select auth.uid()) = user_id);

-- Money set aside for a goal on a given day. Goals are tracked apart from
-- transactions: a contribution is not an expense.
create table public.savings_contributions (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null default auth.uid() references auth.users (id) on delete cascade,
  goal_id uuid not null references public.savings_goals (id) on delete cascade,
  amount numeric(12, 2) not null check (amount > 0),
  contributed_on date not null,
  created_at timestamptz not null default now()
);

create index savings_contributions_goal_id_idx on public.savings_contributions (goal_id);
create index savings_contributions_user_id_idx on public.savings_contributions (user_id);

alter table public.savings_contributions enable row level security;

create policy "savings_contributions: owner has full access"
  on public.savings_contributions
  for all
  to authenticated
  using ((select auth.uid()) = user_id)
  with check (
    (select auth.uid()) = user_id
    and exists (
      select 1
      from public.savings_goals g
      where g.id = goal_id
        and g.user_id = (select auth.uid())
    )
  );

-- ---------------------------------------------------------------------------
-- Data API access: only signed-in users, and RLS narrows it to their own rows.
-- ---------------------------------------------------------------------------

grant select, insert, update, delete
  on public.transactions,
     public.budgets,
     public.savings_goals,
     public.savings_contributions
  to authenticated;
