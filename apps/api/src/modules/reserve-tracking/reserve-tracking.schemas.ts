import { validationError } from "./reserve-tracking.errors.js";

export function parseReserveInput(input: unknown): { protectionMonths: unknown } {
  if (!input || typeof input !== "object") {
    throw validationError();
  }

  return input as { protectionMonths: unknown };
}
