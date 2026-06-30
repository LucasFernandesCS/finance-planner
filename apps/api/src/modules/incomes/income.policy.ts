import {
  amountMustBePositiveError,
  amountOverflowError,
  titleTooLongError,
  validationError
} from "./income.errors.js";
import { INCOME_TYPES, type IncomeInput } from "./income.types.js";

export const MAX_INCOME_AMOUNT_IN_CENTS = 99999999999;
export const MAX_INCOME_TITLE_LENGTH = 100;

function isValidReferenceMonth(referenceMonth: unknown): referenceMonth is string {
  if (typeof referenceMonth !== "string" || !/^\d{4}-\d{2}$/.test(referenceMonth)) {
    return false;
  }

  const month = Number(referenceMonth.slice(5, 7));
  return month >= 1 && month <= 12;
}

export function toReferenceMonthDate(referenceMonth: string): Date {
  return new Date(`${referenceMonth}-01T00:00:00.000Z`);
}

export function fromReferenceMonthDate(referenceMonth: Date): string {
  return referenceMonth.toISOString().slice(0, 7);
}

export function isIncomeApplicableToMonth(input: {
  type: "MONTHLY" | "EXTRA";
  incomeReferenceMonth: string;
  queryReferenceMonth: string;
}): boolean {
  if (input.type === "MONTHLY") {
    return input.incomeReferenceMonth <= input.queryReferenceMonth;
  }

  return input.incomeReferenceMonth === input.queryReferenceMonth;
}

export function validateIncomeInput(input: unknown): IncomeInput {
  if (!input || typeof input !== "object") {
    throw validationError();
  }

  const candidate = input as Partial<IncomeInput>;

  if (typeof candidate.title !== "string" || candidate.title.trim().length === 0) {
    throw validationError();
  }

  const title = candidate.title.trim();

  if (title.length > MAX_INCOME_TITLE_LENGTH) {
    throw titleTooLongError();
  }

  const amountInCents = candidate.amountInCents;

  if (typeof amountInCents !== "number" || !Number.isInteger(amountInCents)) {
    throw validationError();
  }

  if (amountInCents <= 0) {
    throw amountMustBePositiveError();
  }

  if (amountInCents > MAX_INCOME_AMOUNT_IN_CENTS) {
    throw amountOverflowError();
  }

  const type = candidate.type;

  if (type !== "MONTHLY" && type !== "EXTRA") {
    throw validationError();
  }

  if (!isValidReferenceMonth(candidate.referenceMonth)) {
    throw validationError();
  }

  return {
    title,
    amountInCents,
    type,
    referenceMonth: candidate.referenceMonth,
    description: candidate.description ?? null
  };
}
