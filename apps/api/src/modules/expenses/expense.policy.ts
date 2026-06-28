import {
  amountMustBePositiveError,
  amountOverflowError,
  titleTooLongError,
  validationError
} from "./expense.errors.js";
import { EXPENSE_CATEGORIES, type ExpenseCategory, type ExpenseInput } from "./expense.types.js";

export { EXPENSE_CATEGORIES };

export const MAX_EXPENSE_AMOUNT_IN_CENTS = 99999999999;
export const MAX_EXPENSE_TITLE_LENGTH = 100;

function isValidMonth(month: unknown): month is string {
  if (typeof month !== "string" || !/^\d{4}-\d{2}$/.test(month)) {
    return false;
  }

  const monthNumber = Number(month.slice(5, 7));
  return monthNumber >= 1 && monthNumber <= 12;
}

export function toMonthDate(month: string): Date {
  return new Date(`${month}-01T00:00:00.000Z`);
}

export function fromMonthDate(month: Date): string {
  return month.toISOString().slice(0, 7);
}

export function validateExpenseInput(input: unknown): ExpenseInput {
  if (!input || typeof input !== "object") {
    throw validationError();
  }

  const candidate = input as Partial<ExpenseInput>;

  if (typeof candidate.title !== "string" || candidate.title.trim().length === 0) {
    throw validationError();
  }

  const title = candidate.title.trim();

  if (title.length > MAX_EXPENSE_TITLE_LENGTH) {
    throw titleTooLongError();
  }

  const amountInCents = candidate.amountInCents;

  if (typeof amountInCents !== "number" || !Number.isInteger(amountInCents)) {
    throw validationError();
  }

  if (amountInCents <= 0) {
    throw amountMustBePositiveError();
  }

  if (amountInCents > MAX_EXPENSE_AMOUNT_IN_CENTS) {
    throw amountOverflowError();
  }

  const category = candidate.category;

  if (!EXPENSE_CATEGORIES.includes(category as ExpenseCategory)) {
    throw validationError();
  }

  if (!isValidMonth(candidate.month)) {
    throw validationError();
  }

  return {
    title,
    amountInCents,
    category: category as ExpenseCategory,
    month: candidate.month,
    description: candidate.description ?? null
  };
}
