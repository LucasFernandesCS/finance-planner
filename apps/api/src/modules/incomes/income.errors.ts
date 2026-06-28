import { AppError } from "../../shared/app-error.js";

export const INCOME_ERROR_CODES = {
  unauthorized: "UNAUTHORIZED",
  forbidden: "FORBIDDEN",
  incomeNotFound: "INCOME_NOT_FOUND",
  validationError: "VALIDATION_ERROR",
  amountMustBePositive: "INCOME_AMOUNT_MUST_BE_POSITIVE",
  amountOverflow: "INCOME_AMOUNT_OVERFLOW",
  titleTooLong: "INCOME_TITLE_TOO_LONG"
} as const;

export function unauthorizedError(): AppError {
  return new AppError("Não autenticado.", INCOME_ERROR_CODES.unauthorized, 401);
}

export function forbiddenError(): AppError {
  return new AppError("Operação não permitida.", INCOME_ERROR_CODES.forbidden, 403);
}

export function incomeNotFoundError(): AppError {
  return new AppError("Renda não encontrada.", INCOME_ERROR_CODES.incomeNotFound, 404);
}

export function validationError(): AppError {
  return new AppError("Requisição inválida.", INCOME_ERROR_CODES.validationError, 400);
}

export function amountMustBePositiveError(): AppError {
  return new AppError(
    "O valor da renda deve ser maior que zero.",
    INCOME_ERROR_CODES.amountMustBePositive,
    400
  );
}

export function amountOverflowError(): AppError {
  return new AppError("O valor da renda excede o limite permitido.", INCOME_ERROR_CODES.amountOverflow, 400);
}

export function titleTooLongError(): AppError {
  return new AppError("O título da renda deve ter no máximo 100 caracteres.", INCOME_ERROR_CODES.titleTooLong, 400);
}
