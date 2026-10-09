import type { TransactionType } from "./types";

/** The app works in a single currency. */
export const CURRENCY = "USD";

/** Where an expense goes in the 50/30/20 rule; savings is what's left of the income. */
export type SpendingGroup = "needs" | "wants";

export type Category = { key: string; label: string };
export type ExpenseCategory = Category & { group: SpendingGroup };

/*
 * Categories are fixed so the same one is never written two ways ("Comida"
 * vs "comida"). The keys are what gets saved, and the migration checks them:
 * adding a category here needs a migration too.
 */
export const EXPENSE_CATEGORIES: ExpenseCategory[] = [
  { key: "food", label: "Comida", group: "needs" },
  { key: "transport", label: "Transporte", group: "needs" },
  { key: "housing", label: "Vivienda", group: "needs" },
  { key: "utilities", label: "Servicios", group: "needs" },
  { key: "health", label: "Salud", group: "needs" },
  { key: "education", label: "Educación", group: "needs" },
  { key: "debt", label: "Deudas", group: "needs" },
  { key: "entertainment", label: "Entretenimiento", group: "wants" },
  { key: "shopping", label: "Compras", group: "wants" },
  { key: "subscriptions", label: "Suscripciones", group: "wants" },
  { key: "other", label: "Otros", group: "wants" },
];

export const INCOME_CATEGORIES: Category[] = [
  { key: "salary", label: "Salario" },
  { key: "freelance", label: "Freelance" },
  { key: "gift", label: "Regalos" },
  { key: "other", label: "Otros" },
];

export const TRANSACTION_TYPES: { value: TransactionType; label: string; plural: string }[] = [
  { value: "expense", label: "Gasto", plural: "Gastos" },
  { value: "income", label: "Ingreso", plural: "Ingresos" },
];

export function categoriesOf(type: TransactionType): Category[] {
  return type === "expense" ? EXPENSE_CATEGORIES : INCOME_CATEGORIES;
}

export function categoryLabel(type: TransactionType, key: string): string {
  return categoriesOf(type).find((category) => category.key === key)?.label ?? key;
}

/** Largest amount a numeric(12, 2) column holds. */
export const MAX_AMOUNT = 9_999_999_999.99;
export const NOTE_MAX_LENGTH = 200;
export const GOAL_NAME_MAX_LENGTH = 60;

/** A budget warns from this share of its limit, and is exceeded past 100%. */
export const BUDGET_WARNING_RATIO = 0.8;

/** Months plotted in the income vs expenses trend, ending on the selected one. */
export const TREND_MONTHS = 6;

/** Reference split of the income, in percent. */
export const BUDGET_RULE = { needs: 50, wants: 30, savings: 20 };
