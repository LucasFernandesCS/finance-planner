import { describe, expect, it } from "vitest";

import { RESERVE_ERROR_CODES } from "../../../src/modules/reserve-tracking/reserve-tracking.errors.js";
import {
  calculateCompletionPercentage,
  calculateReserveTarget,
  calculateReserveTransaction,
  getReserveStatus,
  MAX_RESERVE_TRANSACTION_AMOUNT_IN_CENTS,
  validateMonthlyFixedExpenses,
  validateProtectionMonths,
  validateReserveTransactionInput
} from "../../../src/modules/reserve-tracking/reserve-policy.js";

describe("reserve policy", () => {
  it("calculates the reserve target", () => {
    expect(calculateReserveTarget({ monthlyFixedExpensesInCents: 350000, protectionMonths: 6 })).toBe(2100000);
  });

  it("calculates completion percentage", () => {
    expect(calculateCompletionPercentage({ currentBalanceInCents: 1050000, targetAmountInCents: 2100000 })).toBe(50);
  });

  it("allows completion percentage above 100%", () => {
    expect(calculateCompletionPercentage({ currentBalanceInCents: 2500000, targetAmountInCents: 2100000 })).toBe(
      119.05
    );
  });

  it("accepts valid protection months", () => {
    expect(validateProtectionMonths(6)).toBe(6);
  });

  it("rejects zero protection months", () => {
    expect(() => validateProtectionMonths(0)).toThrow(
      expect.objectContaining({ code: RESERVE_ERROR_CODES.invalidProtectionMonths })
    );
  });

  it("rejects negative protection months", () => {
    expect(() => validateProtectionMonths(-1)).toThrow(
      expect.objectContaining({ code: RESERVE_ERROR_CODES.invalidProtectionMonths })
    );
  });

  it("rejects zero fixed expenses", () => {
    expect(() => validateMonthlyFixedExpenses(0)).toThrow(
      expect.objectContaining({ code: RESERVE_ERROR_CODES.fixedExpensesRequired })
    );
  });

  it("calculates a successful deposit", () => {
    expect(calculateReserveTransaction({ currentBalanceInCents: 100000, amountInCents: 50000, type: "DEPOSIT" })).toBe(
      150000
    );
  });

  it("calculates a successful withdrawal", () => {
    expect(
      calculateReserveTransaction({ currentBalanceInCents: 100000, amountInCents: 30000, type: "WITHDRAWAL" })
    ).toBe(70000);
  });

  it("rejects a negative deposit", () => {
    expect(() => validateReserveTransactionInput({ amountInCents: -1 })).toThrow(
      expect.objectContaining({ code: RESERVE_ERROR_CODES.transactionAmountMustBePositive })
    );
  });

  it("rejects a zero deposit", () => {
    expect(() => validateReserveTransactionInput({ amountInCents: 0 })).toThrow(
      expect.objectContaining({ code: RESERVE_ERROR_CODES.transactionAmountMustBePositive })
    );
  });

  it("rejects a negative withdrawal", () => {
    expect(() => validateReserveTransactionInput({ amountInCents: -1 })).toThrow(
      expect.objectContaining({ code: RESERVE_ERROR_CODES.transactionAmountMustBePositive })
    );
  });

  it("rejects a zero withdrawal", () => {
    expect(() => validateReserveTransactionInput({ amountInCents: 0 })).toThrow(
      expect.objectContaining({ code: RESERVE_ERROR_CODES.transactionAmountMustBePositive })
    );
  });

  it("rejects a withdrawal greater than current balance", () => {
    expect(() =>
      calculateReserveTransaction({ currentBalanceInCents: 100000, amountInCents: 150000, type: "WITHDRAWAL" })
    ).toThrow(expect.objectContaining({ code: RESERVE_ERROR_CODES.withdrawalExceedsBalance }));
  });

  it("rejects transaction amount over the limit", () => {
    expect(() => validateReserveTransactionInput({ amountInCents: MAX_RESERVE_TRANSACTION_AMOUNT_IN_CENTS + 1 })).toThrow(
      expect.objectContaining({ code: RESERVE_ERROR_CODES.transactionAmountOverflow })
    );
  });

  it("transitions to PROTECTED", () => {
    expect(getReserveStatus({ previousStatus: "BUILDING", currentBalanceInCents: 2100000, targetAmountInCents: 2100000 })).toBe(
      "PROTECTED"
    );
  });

  it("transitions to REPLENISHING after withdrawal", () => {
    expect(getReserveStatus({ previousStatus: "PROTECTED", currentBalanceInCents: 2000000, targetAmountInCents: 2100000 })).toBe(
      "REPLENISHING"
    );
  });

  it("transitions to REPLENISHING after target increase", () => {
    expect(getReserveStatus({ previousStatus: "PROTECTED", currentBalanceInCents: 2100000, targetAmountInCents: 2400000 })).toBe(
      "REPLENISHING"
    );
  });

  it("transitions to PROTECTED after target reduction", () => {
    expect(getReserveStatus({ previousStatus: "REPLENISHING", currentBalanceInCents: 2100000, targetAmountInCents: 2100000 })).toBe(
      "PROTECTED"
    );
  });

  it("keeps BUILDING when the reserve was never protected", () => {
    expect(getReserveStatus({ previousStatus: "BUILDING", currentBalanceInCents: 1000000, targetAmountInCents: 2100000 })).toBe(
      "BUILDING"
    );
  });
});
