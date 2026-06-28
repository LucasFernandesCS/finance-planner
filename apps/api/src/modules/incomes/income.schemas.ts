import { validateIncomeInput } from "./income.policy.js";
import { validationError } from "./income.errors.js";
import type { IncomeInput } from "./income.types.js";

export function parseIncomeInput(input: unknown): IncomeInput {
  return validateIncomeInput(input);
}

export function parseReferenceMonth(input: unknown): string {
  if (!input || typeof input !== "string") {
    throw validationError();
  }

  return validateIncomeInput({
    title: "reference-month-validation",
    amountInCents: 1,
    type: "MONTHLY",
    referenceMonth: input
  }).referenceMonth;
}
