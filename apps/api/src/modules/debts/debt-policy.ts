import {
  amountMustBePositiveError,
  amountOverflowError,
  creditorTooLongError,
  invalidMonthlyDueDayError,
  paymentAmountMustBePositiveError,
  paymentExceedsBalanceError,
  titleTooLongError,
  validationError
} from "./debt.errors.js";
import { DEBT_TYPES, type DebtInput, type DebtPaymentInput, type DebtStatus, type DebtType } from "./debt.types.js";

export { DEBT_TYPES };

export const MAX_DEBT_AMOUNT_IN_CENTS = 99999999999;
export const MAX_DEBT_TITLE_LENGTH = 100;
export const MAX_DEBT_CREDITOR_LENGTH = 100;

function validateMoney(value: unknown, positiveError: () => Error): number {
  if (typeof value !== "number" || !Number.isInteger(value)) {
    throw validationError();
  }

  if (value <= 0) {
    throw positiveError();
  }

  if (value > MAX_DEBT_AMOUNT_IN_CENTS) {
    throw amountOverflowError();
  }

  return value;
}

function validateMonthlyDueDay(value: unknown): number {
  if (typeof value !== "number" || !Number.isInteger(value) || value < 1 || value > 28) {
    throw invalidMonthlyDueDayError();
  }

  return value;
}

export function validateDebtInput(input: unknown): DebtInput {
  if (!input || typeof input !== "object") {
    throw validationError();
  }

  const candidate = input as Partial<DebtInput>;

  if (typeof candidate.title !== "string" || candidate.title.trim().length === 0) {
    throw validationError();
  }

  const title = candidate.title.trim();
  if (title.length > MAX_DEBT_TITLE_LENGTH) {
    throw titleTooLongError();
  }

  if (typeof candidate.creditor !== "string" || candidate.creditor.trim().length === 0) {
    throw validationError();
  }

  const creditor = candidate.creditor.trim();
  if (creditor.length > MAX_DEBT_CREDITOR_LENGTH) {
    throw creditorTooLongError();
  }

  if (!DEBT_TYPES.includes(candidate.type as DebtType)) {
    throw validationError();
  }

  const originalAmountInCents = validateMoney(candidate.originalAmountInCents, amountMustBePositiveError);
  const installmentAmountInCents =
    candidate.installmentAmountInCents === undefined || candidate.installmentAmountInCents === null
      ? null
      : validateMoney(candidate.installmentAmountInCents, amountMustBePositiveError);

  return {
    title,
    creditor,
    type: candidate.type as DebtType,
    originalAmountInCents,
    installmentAmountInCents,
    monthlyDueDay: validateMonthlyDueDay(candidate.monthlyDueDay),
    description: candidate.description ?? null
  };
}

export function validateDebtPaymentInput(input: unknown): DebtPaymentInput {
  if (!input || typeof input !== "object") {
    throw validationError();
  }

  const candidate = input as Partial<DebtPaymentInput>;

  return {
    amountInCents: validateMoney(candidate.amountInCents, paymentAmountMustBePositiveError),
    note: candidate.note ?? null,
    paidAt: candidate.paidAt
  };
}

export function calculateDebtPayment(input: { currentBalanceInCents: number; amountInCents: number }): {
  currentBalanceInCents: number;
} {
  if (input.amountInCents > input.currentBalanceInCents) {
    throw paymentExceedsBalanceError();
  }

  return {
    currentBalanceInCents: input.currentBalanceInCents - input.amountInCents
  };
}

export function getDebtStatusAfterPayment(currentBalanceInCents: number): DebtStatus {
  return currentBalanceInCents <= 0 ? "PAID" : "IN_PROGRESS";
}

function monthStart(date: Date): Date {
  return new Date(Date.UTC(date.getUTCFullYear(), date.getUTCMonth(), 1));
}

function nextMonthStart(date: Date): Date {
  return new Date(Date.UTC(date.getUTCFullYear(), date.getUTCMonth() + 1, 1));
}

export function getCurrentMonthRange(today = new Date()): { startsAt: Date; endsBefore: Date } {
  return {
    startsAt: monthStart(today),
    endsBefore: nextMonthStart(today)
  };
}

export function getDebtStatusForCurrentMonth(input: {
  currentStatus: DebtStatus;
  currentBalanceInCents: number;
  monthlyDueDay: number;
  hasPaymentInCurrentMonth: boolean;
  today?: Date;
}): DebtStatus {
  if (input.currentStatus === "PAID" || input.currentBalanceInCents <= 0) {
    return "PAID";
  }

  const today = input.today ?? new Date();
  const dueDate = new Date(Date.UTC(today.getUTCFullYear(), today.getUTCMonth(), input.monthlyDueDay));

  if (today.getTime() > dueDate.getTime() && !input.hasPaymentInCurrentMonth) {
    return "OVERDUE";
  }

  return input.currentStatus === "OVERDUE" && input.hasPaymentInCurrentMonth ? "IN_PROGRESS" : input.currentStatus;
}
