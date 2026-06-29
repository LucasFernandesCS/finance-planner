import { describe, expect, it } from "vitest";

import { DEBT_ERROR_CODES } from "../../../src/modules/debts/debt.errors.js";
import {
  calculateDebtPayment,
  getDebtStatusAfterPayment,
  getDebtStatusForCurrentMonth,
  MAX_DEBT_AMOUNT_IN_CENTS,
  validateDebtInput,
  validateDebtPaymentInput
} from "../../../src/modules/debts/debt-policy.js";

const validDebt = {
  title: "Financiamento do carro",
  creditor: "Banco",
  type: "FINANCING",
  originalAmountInCents: 200000,
  installmentAmountInCents: 50000,
  monthlyDueDay: 10,
  description: "Contrato 123"
};

describe("debt policy", () => {
  it("accepts a valid debt", () => {
    expect(validateDebtInput(validDebt)).toEqual(validDebt);
  });

  it("rejects a negative debt amount", () => {
    expect(() => validateDebtInput({ ...validDebt, originalAmountInCents: -1 })).toThrow(
      expect.objectContaining({ code: DEBT_ERROR_CODES.amountMustBePositive })
    );
  });

  it("rejects a zero debt amount", () => {
    expect(() => validateDebtInput({ ...validDebt, originalAmountInCents: 0 })).toThrow(
      expect.objectContaining({ code: DEBT_ERROR_CODES.amountMustBePositive })
    );
  });

  it("rejects a debt amount over the limit", () => {
    expect(() =>
      validateDebtInput({ ...validDebt, originalAmountInCents: MAX_DEBT_AMOUNT_IN_CENTS + 1 })
    ).toThrow(expect.objectContaining({ code: DEBT_ERROR_CODES.amountOverflow }));
  });

  it("rejects a title over 100 characters", () => {
    expect(() => validateDebtInput({ ...validDebt, title: "a".repeat(101) })).toThrow(
      expect.objectContaining({ code: DEBT_ERROR_CODES.titleTooLong })
    );
  });

  it("rejects a creditor over 100 characters", () => {
    expect(() => validateDebtInput({ ...validDebt, creditor: "a".repeat(101) })).toThrow(
      expect.objectContaining({ code: DEBT_ERROR_CODES.creditorTooLong })
    );
  });

  it("rejects an invalid type", () => {
    expect(() => validateDebtInput({ ...validDebt, type: "INVALID" })).toThrow(
      expect.objectContaining({ code: DEBT_ERROR_CODES.validationError })
    );
  });

  it("rejects a monthly due day lower than 1", () => {
    expect(() => validateDebtInput({ ...validDebt, monthlyDueDay: 0 })).toThrow(
      expect.objectContaining({ code: DEBT_ERROR_CODES.invalidMonthlyDueDay })
    );
  });

  it("rejects a monthly due day greater than 28", () => {
    expect(() => validateDebtInput({ ...validDebt, monthlyDueDay: 29 })).toThrow(
      expect.objectContaining({ code: DEBT_ERROR_CODES.invalidMonthlyDueDay })
    );
  });

  it("calculates a successful amortization", () => {
    expect(calculateDebtPayment({ currentBalanceInCents: 200000, amountInCents: 50000 })).toEqual({
      currentBalanceInCents: 150000
    });
  });

  it("rejects a negative payment", () => {
    expect(() => validateDebtPaymentInput({ amountInCents: -1 })).toThrow(
      expect.objectContaining({ code: DEBT_ERROR_CODES.paymentAmountMustBePositive })
    );
  });

  it("rejects a zero payment", () => {
    expect(() => validateDebtPaymentInput({ amountInCents: 0 })).toThrow(
      expect.objectContaining({ code: DEBT_ERROR_CODES.paymentAmountMustBePositive })
    );
  });

  it("rejects a payment greater than the current balance", () => {
    expect(() => calculateDebtPayment({ currentBalanceInCents: 50000, amountInCents: 60000 })).toThrow(
      expect.objectContaining({ code: DEBT_ERROR_CODES.paymentExceedsBalance })
    );
  });

  it("returns PAID when balance reaches zero", () => {
    expect(getDebtStatusAfterPayment(0)).toBe("PAID");
  });

  it("returns OVERDUE when due day passed and there was no payment in the month", () => {
    expect(
      getDebtStatusForCurrentMonth({
        currentStatus: "IN_PROGRESS",
        currentBalanceInCents: 100000,
        monthlyDueDay: 10,
        hasPaymentInCurrentMonth: false,
        today: new Date("2026-06-29T00:00:00.000Z")
      })
    ).toBe("OVERDUE");
  });

  it("returns IN_PROGRESS after a regular partial payment", () => {
    expect(getDebtStatusAfterPayment(50000)).toBe("IN_PROGRESS");
  });
});
