export const EXPENSE_CATEGORIES = [
  "WATER",
  "ENERGY",
  "CONDOMINIUM",
  "RENT",
  "IPVA",
  "IPTU",
  "INTERNET",
  "HEALTH",
  "EDUCATION",
  "TRANSPORT",
  "FOOD",
  "GROCERIES",
  "SHOPPING",
  "LEISURE",
  "SUBSCRIPTION",
  "MAINTENANCE",
  "TAX",
  "OTHER"
] as const;

export type ExpenseCategory = (typeof EXPENSE_CATEGORIES)[number];

export type ExpenseInput = {
  title: string;
  amountInCents: number;
  category: ExpenseCategory;
  month: string;
  description?: string | null;
};

export type FixedExpense = {
  id: string;
  userId: string;
  title: string;
  amountInCents: number;
  category: ExpenseCategory;
  startMonth: string;
  description?: string | null;
};

export type VariableExpense = {
  id: string;
  userId: string;
  title: string;
  amountInCents: number;
  category: ExpenseCategory;
  referenceMonth: string;
  description?: string | null;
};

export type PublicFixedExpense = Omit<FixedExpense, "userId">;
export type PublicVariableExpense = Omit<VariableExpense, "userId">;
