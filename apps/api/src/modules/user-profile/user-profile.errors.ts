import { AppError } from "../../shared/app-error.js";

export const USER_PROFILE_ERROR_CODES = {
  unauthorized: "UNAUTHORIZED",
  forbidden: "FORBIDDEN",
  goalNotFound: "GOAL_NOT_FOUND",
  validationError: "VALIDATION_ERROR",
  userNameTooLong: "USER_NAME_TOO_LONG",
  displayNameTooLong: "DISPLAY_NAME_TOO_LONG",
  invalidAvatarUrl: "INVALID_AVATAR_URL",
  invalidCurrencyCode: "INVALID_CURRENCY_CODE",
  invalidLocale: "INVALID_LOCALE",
  invalidTimezone: "INVALID_TIMEZONE",
  invalidFinancialMonthStartDay: "INVALID_FINANCIAL_MONTH_START_DAY"
} as const;

export function unauthorizedError(): AppError {
  return new AppError("Unauthenticated.", USER_PROFILE_ERROR_CODES.unauthorized, 401);
}

export function forbiddenError(): AppError {
  return new AppError("Operation not allowed.", USER_PROFILE_ERROR_CODES.forbidden, 403);
}

export function goalNotFoundError(): AppError {
  return new AppError("Goal not found.", USER_PROFILE_ERROR_CODES.goalNotFound, 404);
}

export function validationError(): AppError {
  return new AppError("Invalid profile data.", USER_PROFILE_ERROR_CODES.validationError, 400);
}

export function userNameTooLongError(): AppError {
  return new AppError("User name is too long.", USER_PROFILE_ERROR_CODES.userNameTooLong, 400);
}

export function displayNameTooLongError(): AppError {
  return new AppError("Display name is too long.", USER_PROFILE_ERROR_CODES.displayNameTooLong, 400);
}

export function invalidAvatarUrlError(): AppError {
  return new AppError("Invalid avatar URL.", USER_PROFILE_ERROR_CODES.invalidAvatarUrl, 400);
}

export function invalidCurrencyCodeError(): AppError {
  return new AppError("Invalid currency code.", USER_PROFILE_ERROR_CODES.invalidCurrencyCode, 400);
}

export function invalidLocaleError(): AppError {
  return new AppError("Invalid locale.", USER_PROFILE_ERROR_CODES.invalidLocale, 400);
}

export function invalidTimezoneError(): AppError {
  return new AppError("Invalid timezone.", USER_PROFILE_ERROR_CODES.invalidTimezone, 400);
}

export function invalidFinancialMonthStartDayError(): AppError {
  return new AppError(
    "Invalid financial month start day.",
    USER_PROFILE_ERROR_CODES.invalidFinancialMonthStartDay,
    400
  );
}
