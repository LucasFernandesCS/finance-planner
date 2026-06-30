import {
  fixedExpensesRequiredError,
  invalidProtectionMonthsError,
  transactionAmountMustBePositiveError,
  transactionAmountOverflowError,
  validationError,
  withdrawalExceedsBalanceError
} from "./reserve-tracking.errors.js";
import type { ReserveStatus, ReserveTransactionInput, ReserveTransactionType } from "./reserve-tracking.types.js";

export const MAX_RESERVE_TRANSACTION_AMOUNT_IN_CENTS = 99999999999;

export function validateProtectionMonths(value: unknown): number {
  if (typeof value !== "number" || !Number.isInteger(value) || value < 1) {
    throw invalidProtectionMonthsError();
  }

  return value;
}

export function validateMonthlyFixedExpenses(value: number): number {
  if (value <= 0) {
    throw fixedExpensesRequiredError();
  }

  return value;
}

export function calculateReserveTarget(input: {
  monthlyFixedExpensesInCents: number;
  protectionMonths: number;
}): number {
  return input.monthlyFixedExpensesInCents * input.protectionMonths;
}

export function calculateCompletionPercentage(input: {
  currentBalanceInCents: number;
  targetAmountInCents: number;
}): number {
  if (input.targetAmountInCents <= 0) {
    return 0;
  }

  return Math.round((input.currentBalanceInCents / input.targetAmountInCents) * 10000) / 100;
}

export function validateReserveTransactionInput(input: unknown): ReserveTransactionInput {
  if (!input || typeof input !== "object") {
    throw validationError();
  }

  const candidate = input as { amountInCents?: unknown; occurredAt?: unknown; note?: string | null };

  if (typeof candidate.amountInCents !== "number" || !Number.isInteger(candidate.amountInCents)) {
    throw validationError();
  }

  if (candidate.amountInCents <= 0) {
    throw transactionAmountMustBePositiveError();
  }

  if (candidate.amountInCents > MAX_RESERVE_TRANSACTION_AMOUNT_IN_CENTS) {
    throw transactionAmountOverflowError();
  }

  let occurredAt: Date | undefined;
  if (candidate.occurredAt !== undefined) {
    if (typeof candidate.occurredAt !== "string" || !/^\d{4}-\d{2}-\d{2}$/.test(candidate.occurredAt)) {
      throw validationError();
    }
    occurredAt = new Date(`${candidate.occurredAt}T00:00:00.000Z`);
    if (Number.isNaN(occurredAt.getTime())) {
      throw validationError();
    }
  }

  return {
    amountInCents: candidate.amountInCents,
    occurredAt,
    note: candidate.note ?? null
  };
}

export function calculateReserveTransaction(input: {
  currentBalanceInCents: number;
  amountInCents: number;
  type: ReserveTransactionType;
}): number {
  if (input.type === "DEPOSIT") {
    return input.currentBalanceInCents + input.amountInCents;
  }

  if (input.amountInCents > input.currentBalanceInCents) {
    throw withdrawalExceedsBalanceError();
  }

  return input.currentBalanceInCents - input.amountInCents;
}

export function getReserveStatus(input: {
  previousStatus: ReserveStatus;
  currentBalanceInCents: number;
  targetAmountInCents: number;
}): ReserveStatus {
  if (input.currentBalanceInCents >= input.targetAmountInCents) {
    return "PROTECTED";
  }

  if (input.previousStatus === "PROTECTED" || input.previousStatus === "REPLENISHING") {
    return "REPLENISHING";
  }

  return "BUILDING";
}
