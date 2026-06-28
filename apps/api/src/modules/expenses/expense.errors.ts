import { AppError } from "../../shared/app-error.js";

export const EXPENSE_ERROR_CODES = {
  unauthorized: "UNAUTHORIZED",
  forbidden: "FORBIDDEN",
  fixedExpenseNotFound: "FIXED_EXPENSE_NOT_FOUND",
  variableExpenseNotFound: "VARIABLE_EXPENSE_NOT_FOUND",
  validationError: "VALIDATION_ERROR",
  amountMustBePositive: "EXPENSE_AMOUNT_MUST_BE_POSITIVE",
  amountOverflow: "EXPENSE_AMOUNT_OVERFLOW",
  titleTooLong: "EXPENSE_TITLE_TOO_LONG"
} as const;

export function unauthorizedError(): AppError {
  return new AppError("Unauthenticated.", EXPENSE_ERROR_CODES.unauthorized, 401);
}

export function forbiddenError(): AppError {
  return new AppError("Operation not allowed.", EXPENSE_ERROR_CODES.forbidden, 403);
}

export function fixedExpenseNotFoundError(): AppError {
  return new AppError("Fixed expense not found.", EXPENSE_ERROR_CODES.fixedExpenseNotFound, 404);
}

export function variableExpenseNotFoundError(): AppError {
  return new AppError("Variable expense not found.", EXPENSE_ERROR_CODES.variableExpenseNotFound, 404);
}

export function validationError(): AppError {
  return new AppError("Invalid expense data.", EXPENSE_ERROR_CODES.validationError, 400);
}

export function amountMustBePositiveError(): AppError {
  return new AppError(
    "Expense amount must be positive.",
    EXPENSE_ERROR_CODES.amountMustBePositive,
    400
  );
}

export function amountOverflowError(): AppError {
  return new AppError("Expense amount is too high.", EXPENSE_ERROR_CODES.amountOverflow, 400);
}

export function titleTooLongError(): AppError {
  return new AppError("Expense title is too long.", EXPENSE_ERROR_CODES.titleTooLong, 400);
}
