import { validationError } from "./expense.errors.js";
import { validateExpenseInput } from "./expense.policy.js";
import type { ExpenseInput } from "./expense.types.js";

export function parseExpenseInput(input: unknown): ExpenseInput {
  return validateExpenseInput(input);
}

export function parseFixedExpenseInput(input: unknown): ExpenseInput {
  if (!input || typeof input !== "object") {
    throw validationError();
  }

  const candidate = input as Record<string, unknown>;

  return validateExpenseInput({
    ...candidate,
    month: candidate.startMonth
  });
}

export function parseVariableExpenseInput(input: unknown): ExpenseInput {
  if (!input || typeof input !== "object") {
    throw validationError();
  }

  const candidate = input as Record<string, unknown>;

  return validateExpenseInput({
    ...candidate,
    month: candidate.referenceMonth
  });
}

export function parseMonth(input: unknown): string {
  if (!input || typeof input !== "string") {
    throw validationError();
  }

  return validateExpenseInput({
    title: "month-validation",
    amountInCents: 1,
    category: "OTHER",
    month: input
  }).month;
}
