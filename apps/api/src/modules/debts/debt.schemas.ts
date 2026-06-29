import { validationError } from "./debt.errors.js";

export function parseDebtId(value: unknown): string {
  if (typeof value !== "string" || value.trim().length === 0) {
    throw validationError();
  }

  return value;
}
