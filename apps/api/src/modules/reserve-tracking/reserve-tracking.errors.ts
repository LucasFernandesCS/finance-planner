import { AppError } from "../../shared/app-error.js";

export const RESERVE_ERROR_CODES = {
  unauthorized: "UNAUTHORIZED",
  forbidden: "FORBIDDEN",
  reserveNotFound: "RESERVE_NOT_FOUND",
  reserveAlreadyConfigured: "RESERVE_ALREADY_CONFIGURED",
  validationError: "VALIDATION_ERROR",
  invalidProtectionMonths: "INVALID_PROTECTION_MONTHS",
  fixedExpensesRequired: "RESERVE_FIXED_EXPENSES_REQUIRED",
  transactionAmountMustBePositive: "RESERVE_TRANSACTION_AMOUNT_MUST_BE_POSITIVE",
  transactionAmountOverflow: "RESERVE_TRANSACTION_AMOUNT_OVERFLOW",
  withdrawalExceedsBalance: "RESERVE_WITHDRAWAL_EXCEEDS_BALANCE"
} as const;

export function unauthorizedError(): AppError {
  return new AppError("Unauthenticated.", RESERVE_ERROR_CODES.unauthorized, 401);
}

export function forbiddenError(): AppError {
  return new AppError("Operation not allowed.", RESERVE_ERROR_CODES.forbidden, 403);
}

export function reserveNotFoundError(): AppError {
  return new AppError("Reserve not found.", RESERVE_ERROR_CODES.reserveNotFound, 404);
}

export function reserveAlreadyConfiguredError(): AppError {
  return new AppError("Reserve is already configured.", RESERVE_ERROR_CODES.reserveAlreadyConfigured, 400);
}

export function validationError(): AppError {
  return new AppError("Invalid reserve data.", RESERVE_ERROR_CODES.validationError, 400);
}

export function invalidProtectionMonthsError(): AppError {
  return new AppError("Protection months must be at least 1.", RESERVE_ERROR_CODES.invalidProtectionMonths, 400);
}

export function fixedExpensesRequiredError(): AppError {
  return new AppError(
    "Fixed expenses are required to configure reserve.",
    RESERVE_ERROR_CODES.fixedExpensesRequired,
    400
  );
}

export function transactionAmountMustBePositiveError(): AppError {
  return new AppError(
    "Reserve transaction amount must be positive.",
    RESERVE_ERROR_CODES.transactionAmountMustBePositive,
    400
  );
}

export function transactionAmountOverflowError(): AppError {
  return new AppError("Reserve transaction amount is too high.", RESERVE_ERROR_CODES.transactionAmountOverflow, 400);
}

export function withdrawalExceedsBalanceError(): AppError {
  return new AppError("Reserve withdrawal exceeds current balance.", RESERVE_ERROR_CODES.withdrawalExceedsBalance, 400);
}
