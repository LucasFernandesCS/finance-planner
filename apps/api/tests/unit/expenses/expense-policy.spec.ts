import { describe, expect, it } from "vitest";

import { EXPENSE_ERROR_CODES } from "../../../src/modules/expenses/expense.errors.js";
import {
  EXPENSE_CATEGORIES,
  MAX_EXPENSE_AMOUNT_IN_CENTS,
  validateExpenseInput
} from "../../../src/modules/expenses/expense.policy.js";

const validExpense = {
  title: "Aluguel",
  amountInCents: 85000,
  category: "RENT",
  month: "2026-06",
  description: "Apartamento"
};

describe("validateExpenseInput", () => {
  it("accepts a valid expense", () => {
    expect(validateExpenseInput(validExpense)).toEqual(validExpense);
  });

  it("rejects a negative amount", () => {
    expect(() => validateExpenseInput({ ...validExpense, amountInCents: -1 })).toThrow(
      expect.objectContaining({ code: EXPENSE_ERROR_CODES.amountMustBePositive })
    );
  });

  it("rejects a zero amount", () => {
    expect(() => validateExpenseInput({ ...validExpense, amountInCents: 0 })).toThrow(
      expect.objectContaining({ code: EXPENSE_ERROR_CODES.amountMustBePositive })
    );
  });

  it("rejects an amount over the limit", () => {
    expect(() =>
      validateExpenseInput({ ...validExpense, amountInCents: MAX_EXPENSE_AMOUNT_IN_CENTS + 1 })
    ).toThrow(expect.objectContaining({ code: EXPENSE_ERROR_CODES.amountOverflow }));
  });

  it("rejects a missing title", () => {
    expect(() => validateExpenseInput({ ...validExpense, title: "" })).toThrow(
      expect.objectContaining({ code: EXPENSE_ERROR_CODES.validationError })
    );
  });

  it("rejects a title over 100 characters", () => {
    expect(() => validateExpenseInput({ ...validExpense, title: "a".repeat(101) })).toThrow(
      expect.objectContaining({ code: EXPENSE_ERROR_CODES.titleTooLong })
    );
  });

  it("rejects a missing category", () => {
    expect(() => validateExpenseInput({ ...validExpense, category: undefined })).toThrow(
      expect.objectContaining({ code: EXPENSE_ERROR_CODES.validationError })
    );
  });

  it("rejects an invalid category", () => {
    expect(() => validateExpenseInput({ ...validExpense, category: "INVALID" })).toThrow(
      expect.objectContaining({ code: EXPENSE_ERROR_CODES.validationError })
    );
  });

  it("accepts every initial category", () => {
    for (const category of EXPENSE_CATEGORIES) {
      expect(validateExpenseInput({ ...validExpense, category }).category).toBe(category);
    }
  });

  it("rejects a missing month", () => {
    expect(() => validateExpenseInput({ ...validExpense, month: undefined })).toThrow(
      expect.objectContaining({ code: EXPENSE_ERROR_CODES.validationError })
    );
  });

  it("rejects an invalid month", () => {
    expect(() => validateExpenseInput({ ...validExpense, month: "2026-13" })).toThrow(
      expect.objectContaining({ code: EXPENSE_ERROR_CODES.validationError })
    );
  });
});
