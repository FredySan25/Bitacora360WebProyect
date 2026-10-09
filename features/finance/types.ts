import type { DateKey } from "@/core/lib/dates";

export type TransactionType = "income" | "expense";

export type Transaction = {
  id: string;
  type: TransactionType;
  /** A category key of its type (see `constants.ts`). */
  category: string;
  /** Always positive; the type gives it its sign. */
  amount: number;
  occurredOn: DateKey;
  note: string | null;
  createdAt: string;
};

export type TransactionInput = {
  type: TransactionType;
  category: string;
  amount: number;
  occurredOn: DateKey;
  note: string | null;
};

/**
 * One version of a category's monthly limit: it applies from the month of
 * `effectiveFrom` until a later version of the same category replaces it.
 */
export type Budget = {
  id: string;
  /** An expense category key. */
  category: string;
  /** First day of the month the limit starts to apply. */
  effectiveFrom: DateKey;
  monthlyLimit: number;
};

export type SavingsContribution = {
  id: string;
  goalId: string;
  amount: number;
  contributedOn: DateKey;
};

export type SavingsGoal = {
  id: string;
  name: string;
  targetAmount: number;
  targetDate: DateKey | null;
  /** Newest first. */
  contributions: SavingsContribution[];
};

export type SavingsGoalInput = {
  name: string;
  targetAmount: number;
  targetDate: DateKey | null;
};

export type ContributionInput = {
  amount: number;
  contributedOn: DateKey;
};

export type LoadStatus = "loading" | "ready" | "error";
