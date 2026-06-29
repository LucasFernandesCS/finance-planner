import { AppError } from "../../shared/app-error.js";

export const DEBT_ERROR_CODES = {
  unauthorized: "UNAUTHORIZED",
  forbidden: "FORBIDDEN",
  debtNotFound: "DEBT_NOT_FOUND",
  validationError: "VALIDATION_ERROR",
  amountMustBePositive: "DEBT_AMOUNT_MUST_BE_POSITIVE",
  amountOverflow: "DEBT_AMOUNT_OVERFLOW",
  titleTooLong: "DEBT_TITLE_TOO_LONG",
  creditorTooLong: "DEBT_CREDITOR_TOO_LONG",
  invalidMonthlyDueDay: "INVALID_DEBT_MONTHLY_DUE_DAY",
  paymentAmountMustBePositive: "DEBT_PAYMENT_AMOUNT_MUST_BE_POSITIVE",
  paymentExceedsBalance: "DEBT_PAYMENT_EXCEEDS_BALANCE",
  debtAlreadyPaid: "DEBT_ALREADY_PAID"
} as const;

export function unauthorizedError(): AppError {
  return new AppError("Unauthenticated.", DEBT_ERROR_CODES.unauthorized, 401);
}

export function forbiddenError(): AppError {
  return new AppError("Operation not allowed.", DEBT_ERROR_CODES.forbidden, 403);
}

export function debtNotFoundError(): AppError {
  return new AppError("Debt not found.", DEBT_ERROR_CODES.debtNotFound, 404);
}

export function validationError(): AppError {
  return new AppError("Invalid debt data.", DEBT_ERROR_CODES.validationError, 400);
}

export function amountMustBePositiveError(): AppError {
  return new AppError("Debt amount must be positive.", DEBT_ERROR_CODES.amountMustBePositive, 400);
}

export function amountOverflowError(): AppError {
  return new AppError("Debt amount is too high.", DEBT_ERROR_CODES.amountOverflow, 400);
}

export function titleTooLongError(): AppError {
  return new AppError("Debt title is too long.", DEBT_ERROR_CODES.titleTooLong, 400);
}

export function creditorTooLongError(): AppError {
  return new AppError("Debt creditor is too long.", DEBT_ERROR_CODES.creditorTooLong, 400);
}

export function invalidMonthlyDueDayError(): AppError {
  return new AppError("Debt monthly due day must be between 1 and 28.", DEBT_ERROR_CODES.invalidMonthlyDueDay, 400);
}

export function paymentAmountMustBePositiveError(): AppError {
  return new AppError(
    "Debt payment amount must be positive.",
    DEBT_ERROR_CODES.paymentAmountMustBePositive,
    400
  );
}

export function paymentExceedsBalanceError(): AppError {
  return new AppError("Debt payment exceeds current balance.", DEBT_ERROR_CODES.paymentExceedsBalance, 400);
}

export function debtAlreadyPaidError(): AppError {
  return new AppError("Debt is already paid.", DEBT_ERROR_CODES.debtAlreadyPaid, 400);
}
