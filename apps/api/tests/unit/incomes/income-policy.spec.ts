import { describe, expect, it } from "vitest";

import { INCOME_ERROR_CODES } from "../../../src/modules/incomes/income.errors.js";
import { isIncomeApplicableToMonth, validateIncomeInput } from "../../../src/modules/incomes/income.policy.js";

const validIncome = {
  title: "Salario",
  amountInCents: 212000,
  type: "MONTHLY",
  referenceMonth: "2026-06",
  description: "Salario atual"
};

describe("income policy", () => {
  it("accepts a valid income", () => {
    expect(validateIncomeInput(validIncome)).toEqual({
      title: "Salario",
      amountInCents: 212000,
      type: "MONTHLY",
      referenceMonth: "2026-06",
      description: "Salario atual"
    });
  });

  it("rejects a negative amount", () => {
    expect(() => validateIncomeInput({ ...validIncome, amountInCents: -1 })).toThrowError(
      expect.objectContaining({ code: INCOME_ERROR_CODES.amountMustBePositive })
    );
  });

  it("rejects a zero amount", () => {
    expect(() => validateIncomeInput({ ...validIncome, amountInCents: 0 })).toThrowError(
      expect.objectContaining({ code: INCOME_ERROR_CODES.amountMustBePositive })
    );
  });

  it("rejects an amount over the limit", () => {
    expect(() => validateIncomeInput({ ...validIncome, amountInCents: 100000000000 })).toThrowError(
      expect.objectContaining({ code: INCOME_ERROR_CODES.amountOverflow })
    );
  });

  it("rejects an empty title", () => {
    expect(() => validateIncomeInput({ ...validIncome, title: " " })).toThrowError(
      expect.objectContaining({ code: INCOME_ERROR_CODES.validationError })
    );
  });

  it("rejects a title longer than 100 characters", () => {
    expect(() => validateIncomeInput({ ...validIncome, title: "a".repeat(101) })).toThrowError(
      expect.objectContaining({ code: INCOME_ERROR_CODES.titleTooLong })
    );
  });

  it("rejects a missing type", () => {
    const { type: _type, ...input } = validIncome;

    expect(() => validateIncomeInput(input)).toThrowError(
      expect.objectContaining({ code: INCOME_ERROR_CODES.validationError })
    );
  });

  it("rejects an invalid type", () => {
    expect(() => validateIncomeInput({ ...validIncome, type: "BONUS" })).toThrowError(
      expect.objectContaining({ code: INCOME_ERROR_CODES.validationError })
    );
  });

  it("rejects a missing reference month", () => {
    const { referenceMonth: _referenceMonth, ...input } = validIncome;

    expect(() => validateIncomeInput(input)).toThrowError(
      expect.objectContaining({ code: INCOME_ERROR_CODES.validationError })
    );
  });

  it("rejects an invalid reference month", () => {
    expect(() => validateIncomeInput({ ...validIncome, referenceMonth: "2026-13" })).toThrowError(
      expect.objectContaining({ code: INCOME_ERROR_CODES.validationError })
    );
  });

  it("includes monthly income in its reference month", () => {
    expect(
      isIncomeApplicableToMonth({
        type: "MONTHLY",
        incomeReferenceMonth: "2026-06",
        queryReferenceMonth: "2026-06"
      })
    ).toBe(true);
  });

  it("includes monthly income in future months", () => {
    expect(
      isIncomeApplicableToMonth({
        type: "MONTHLY",
        incomeReferenceMonth: "2026-06",
        queryReferenceMonth: "2026-07"
      })
    ).toBe(true);
  });

  it("includes extra income only in its reference month", () => {
    expect(
      isIncomeApplicableToMonth({
        type: "EXTRA",
        incomeReferenceMonth: "2026-06",
        queryReferenceMonth: "2026-06"
      })
    ).toBe(true);
  });

  it("does not include extra income in future months", () => {
    expect(
      isIncomeApplicableToMonth({
        type: "EXTRA",
        incomeReferenceMonth: "2026-06",
        queryReferenceMonth: "2026-07"
      })
    ).toBe(false);
  });
});
