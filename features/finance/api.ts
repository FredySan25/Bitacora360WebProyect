import type { SupabaseClient } from "@supabase/supabase-js";
import type { DateKey } from "@/core/lib/dates";
import type {
  Budget,
  ContributionInput,
  SavingsContribution,
  SavingsGoal,
  SavingsGoalInput,
  Transaction,
  TransactionInput,
  TransactionType,
} from "./types";

/*
 * All Supabase queries for the finance module. Every function receives the
 * client (browser or server) and throws on error; RLS scopes rows to the
 * signed-in user, so no query filters by user_id.
 */

// --- Transactions ------------------------------------------------------------

type TransactionRow = {
  id: string;
  type: TransactionType;
  category: string;
  amount: number;
  occurred_on: string;
  note: string | null;
  created_at: string;
};

const TRANSACTION_COLUMNS = "id, type, category, amount, occurred_on, note, created_at";

function toTransaction(row: TransactionRow): Transaction {
  return {
    id: row.id,
    type: row.type,
    category: row.category,
    amount: Number(row.amount),
    occurredOn: row.occurred_on,
    note: row.note,
    createdAt: row.created_at,
  };
}

function toTransactionRow(input: TransactionInput) {
  return {
    type: input.type,
    category: input.category,
    amount: input.amount,
    occurred_on: input.occurredOn,
    note: input.note,
  };
}

// Supabase returns at most 1000 rows per request by default.
const PAGE_SIZE = 1000;

/** Every transaction within [from, to], newest first. */
export async function listTransactions(
  supabase: SupabaseClient,
  from: DateKey,
  to: DateKey,
): Promise<Transaction[]> {
  const rows: TransactionRow[] = [];
  for (let offset = 0; ; offset += PAGE_SIZE) {
    const { data, error } = await supabase
      .from("transactions")
      .select(TRANSACTION_COLUMNS)
      .gte("occurred_on", from)
      .lte("occurred_on", to)
      .order("occurred_on", { ascending: false })
      .order("created_at", { ascending: false })
      .order("id", { ascending: true })
      .range(offset, offset + PAGE_SIZE - 1)
      .overrideTypes<TransactionRow[], { merge: false }>();
    if (error) throw error;
    rows.push(...data);
    if (data.length < PAGE_SIZE) break;
  }
  return rows.map(toTransaction);
}

export async function createTransaction(
  supabase: SupabaseClient,
  input: TransactionInput,
): Promise<Transaction> {
  const { data, error } = await supabase
    .from("transactions")
    .insert(toTransactionRow(input))
    .select(TRANSACTION_COLUMNS)
    .single()
    .overrideTypes<TransactionRow, { merge: false }>();
  if (error) throw error;
  return toTransaction(data);
}

export async function updateTransaction(
  supabase: SupabaseClient,
  id: string,
  input: TransactionInput,
): Promise<Transaction> {
  const { data, error } = await supabase
    .from("transactions")
    .update(toTransactionRow(input))
    .eq("id", id)
    .select(TRANSACTION_COLUMNS)
    .single()
    .overrideTypes<TransactionRow, { merge: false }>();
  if (error) throw error;
  return toTransaction(data);
}

export async function deleteTransaction(supabase: SupabaseClient, id: string): Promise<void> {
  const { error } = await supabase.from("transactions").delete().eq("id", id);
  if (error) throw error;
}

// --- Budgets -----------------------------------------------------------------

type BudgetRow = {
  id: string;
  category: string;
  effective_from: string;
  monthly_limit: number;
};

const BUDGET_COLUMNS = "id, category, effective_from, monthly_limit";

function toBudget(row: BudgetRow): Budget {
  return {
    id: row.id,
    category: row.category,
    effectiveFrom: row.effective_from,
    monthlyLimit: Number(row.monthly_limit),
  };
}

/** Every version of every budget, oldest first. */
export async function listBudgets(supabase: SupabaseClient): Promise<Budget[]> {
  const { data, error } = await supabase
    .from("budgets")
    .select(BUDGET_COLUMNS)
    .order("effective_from", { ascending: true })
    .overrideTypes<BudgetRow[], { merge: false }>();
  if (error) throw error;
  return data.map(toBudget);
}

/** Adds the version of a category's limit that starts on `effectiveFrom`. */
export async function createBudget(
  supabase: SupabaseClient,
  input: { category: string; effectiveFrom: DateKey; monthlyLimit: number },
): Promise<Budget> {
  const { data, error } = await supabase
    .from("budgets")
    .insert({
      category: input.category,
      effective_from: input.effectiveFrom,
      monthly_limit: input.monthlyLimit,
    })
    .select(BUDGET_COLUMNS)
    .single()
    .overrideTypes<BudgetRow, { merge: false }>();
  if (error) throw error;
  return toBudget(data);
}

export async function updateBudgetLimit(
  supabase: SupabaseClient,
  id: string,
  monthlyLimit: number,
): Promise<Budget> {
  const { data, error } = await supabase
    .from("budgets")
    .update({ monthly_limit: monthlyLimit })
    .eq("id", id)
    .select(BUDGET_COLUMNS)
    .single()
    .overrideTypes<BudgetRow, { merge: false }>();
  if (error) throw error;
  return toBudget(data);
}

/** Deletes every version of a category's budget. */
export async function deleteBudgets(supabase: SupabaseClient, category: string): Promise<void> {
  const { error } = await supabase.from("budgets").delete().eq("category", category);
  if (error) throw error;
}

// --- Savings goals -----------------------------------------------------------

type ContributionRow = {
  id: string;
  goal_id: string;
  amount: number;
  contributed_on: string;
};

type GoalRow = {
  id: string;
  name: string;
  target_amount: number;
  target_date: string | null;
  savings_contributions: ContributionRow[];
};

const CONTRIBUTION_COLUMNS = "id, goal_id, amount, contributed_on";
const GOAL_COLUMNS = `id, name, target_amount, target_date, savings_contributions(${CONTRIBUTION_COLUMNS})`;

function toContribution(row: ContributionRow): SavingsContribution {
  return {
    id: row.id,
    goalId: row.goal_id,
    amount: Number(row.amount),
    contributedOn: row.contributed_on,
  };
}

function toGoal(row: GoalRow): SavingsGoal {
  return {
    id: row.id,
    name: row.name,
    targetAmount: Number(row.target_amount),
    targetDate: row.target_date,
    contributions: row.savings_contributions.map(toContribution),
  };
}

function toGoalRow(input: SavingsGoalInput) {
  return { name: input.name, target_amount: input.targetAmount, target_date: input.targetDate };
}

/** Every goal with its contributions (newest first), oldest goal first. */
export async function listSavingsGoals(supabase: SupabaseClient): Promise<SavingsGoal[]> {
  const { data, error } = await supabase
    .from("savings_goals")
    .select(GOAL_COLUMNS)
    .order("created_at", { ascending: true })
    .order("contributed_on", { referencedTable: "savings_contributions", ascending: false })
    .order("created_at", { referencedTable: "savings_contributions", ascending: false })
    .overrideTypes<GoalRow[], { merge: false }>();
  if (error) throw error;
  return data.map(toGoal);
}

export async function createSavingsGoal(
  supabase: SupabaseClient,
  input: SavingsGoalInput,
): Promise<SavingsGoal> {
  const { data, error } = await supabase
    .from("savings_goals")
    .insert(toGoalRow(input))
    .select(GOAL_COLUMNS)
    .single()
    .overrideTypes<GoalRow, { merge: false }>();
  if (error) throw error;
  return toGoal(data);
}

/** Updates the goal itself and returns it without its contributions. */
export async function updateSavingsGoal(
  supabase: SupabaseClient,
  id: string,
  input: SavingsGoalInput,
): Promise<Omit<SavingsGoal, "contributions">> {
  const { data, error } = await supabase
    .from("savings_goals")
    .update(toGoalRow(input))
    .eq("id", id)
    .select("id, name, target_amount, target_date")
    .single()
    .overrideTypes<Omit<GoalRow, "savings_contributions">, { merge: false }>();
  if (error) throw error;
  return {
    id: data.id,
    name: data.name,
    targetAmount: Number(data.target_amount),
    targetDate: data.target_date,
  };
}

/** Deletes the goal and, by cascade, all its contributions. */
export async function deleteSavingsGoal(supabase: SupabaseClient, id: string): Promise<void> {
  const { error } = await supabase.from("savings_goals").delete().eq("id", id);
  if (error) throw error;
}

export async function createContribution(
  supabase: SupabaseClient,
  goalId: string,
  input: ContributionInput,
): Promise<SavingsContribution> {
  const { data, error } = await supabase
    .from("savings_contributions")
    .insert({ goal_id: goalId, amount: input.amount, contributed_on: input.contributedOn })
    .select(CONTRIBUTION_COLUMNS)
    .single()
    .overrideTypes<ContributionRow, { merge: false }>();
  if (error) throw error;
  return toContribution(data);
}

export async function deleteContribution(supabase: SupabaseClient, id: string): Promise<void> {
  const { error } = await supabase.from("savings_contributions").delete().eq("id", id);
  if (error) throw error;
}
