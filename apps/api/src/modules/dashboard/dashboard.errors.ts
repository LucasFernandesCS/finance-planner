import { AppError } from "../../shared/app-error.js";

export const DASHBOARD_ERROR_CODES = {
  unauthorized: "UNAUTHORIZED",
  invalidMonth: "INVALID_DASHBOARD_MONTH"
} as const;

export function unauthorizedError(): AppError {
  return new AppError("Unauthenticated.", DASHBOARD_ERROR_CODES.unauthorized, 401);
}

export function invalidDashboardMonthError(): AppError {
  return new AppError("Invalid dashboard month.", DASHBOARD_ERROR_CODES.invalidMonth, 400);
}
