import { describe, expect, it } from "vitest";

import { GOAL_ERROR_CODES } from "../../../src/modules/goals/goal.errors.js";
import {
  calculateAvailableMonthlyAmount,
  calculateMaxTargetAmountForDeadline,
  calculateMinimumViableMonths,
  calculateMonthsUntilDeadline,
  calculateSuggestedMonthlyAmount,
  MAX_GOAL_AMOUNT_IN_CENTS,
  validateGoalInput,
  validateGoalStatusTransition,
  validateGoalViability
} from "../../../src/modules/goals/goal-policy.js";

const today = new Date("2026-06-29T12:00:00.000Z");

const validGoal = {
  title: "Comprar notebook",
  targetAmountInCents: 1500000,
  monthlyAmountInCents: 125000,
  deadlineDate: "2027-06-30",
  description: "Notebook para trabalho"
};

describe("goal policy", () => {
  it("calculates the suggested monthly amount rounded up", () => {
    expect(calculateSuggestedMonthlyAmount(100000, 3)).toBe(33334);
  });

  it("calculates months until deadline", () => {
    expect(calculateMonthsUntilDeadline("2027-02-28", today)).toBe(8);
  });

  it("calculates available monthly amount", () => {
    expect(
      calculateAvailableMonthlyAmount({
        monthlyIncomeInCents: 500000,
        fixedExpensesInCents: 350000,
        activeGoalCommitmentsInCents: 50000
      })
    ).toBe(100000);
  });

  it("accepts a financially feasible goal", () => {
    expect(
      validateGoalViability({
        targetAmountInCents: 1200000,
        monthlyAmountInCents: 100000,
        deadlineDate: "2027-06-30",
        availableMonthlyAmountInCents: 150000,
        today
      }).isFeasible
    ).toBe(true);
  });

  it("rejects a financially unfeasible goal", () => {
    expect(() =>
      validateGoalViability({
        targetAmountInCents: 1500000,
        monthlyAmountInCents: 187500,
        deadlineDate: "2027-02-28",
        availableMonthlyAmountInCents: 150000,
        today
      })
    ).toThrow(expect.objectContaining({ code: GOAL_ERROR_CODES.notFinanciallyFeasible }));
  });

  it("calculates the minimum viable months", () => {
    expect(calculateMinimumViableMonths(1500000, 150000)).toBe(10);
  });

  it("calculates the max target amount for the current deadline", () => {
    expect(calculateMaxTargetAmountForDeadline(150000, 8)).toBe(1200000);
  });

  it("rejects a negative target amount", () => {
    expect(() => validateGoalInput({ ...validGoal, targetAmountInCents: -1 }, today)).toThrow(
      expect.objectContaining({ code: GOAL_ERROR_CODES.targetAmountMustBePositive })
    );
  });

  it("rejects a zero target amount", () => {
    expect(() => validateGoalInput({ ...validGoal, targetAmountInCents: 0 }, today)).toThrow(
      expect.objectContaining({ code: GOAL_ERROR_CODES.targetAmountMustBePositive })
    );
  });

  it("rejects an amount over the limit", () => {
    expect(() =>
      validateGoalInput({ ...validGoal, targetAmountInCents: MAX_GOAL_AMOUNT_IN_CENTS + 1 }, today)
    ).toThrow(expect.objectContaining({ code: GOAL_ERROR_CODES.amountOverflow }));
  });

  it("rejects a too long title", () => {
    expect(() => validateGoalInput({ ...validGoal, title: "a".repeat(101) }, today)).toThrow(
      expect.objectContaining({ code: GOAL_ERROR_CODES.titleTooLong })
    );
  });

  it("rejects a past deadline", () => {
    expect(() => validateGoalInput({ ...validGoal, deadlineDate: "2026-06-28" }, today)).toThrow(
      expect.objectContaining({ code: GOAL_ERROR_CODES.deadlineMustBeFuture })
    );
  });

  it("rejects today's deadline", () => {
    expect(() => validateGoalInput({ ...validGoal, deadlineDate: "2026-06-29" }, today)).toThrow(
      expect.objectContaining({ code: GOAL_ERROR_CODES.deadlineMustBeFuture })
    );
  });

  it("rejects manually achieving a goal below the target amount", () => {
    expect(() =>
      validateGoalStatusTransition({
        nextStatus: "ACHIEVED",
        currentAmountInCents: 1000,
        targetAmountInCents: 2000
      })
    ).toThrow(expect.objectContaining({ code: GOAL_ERROR_CODES.invalidStatusTransition }));
  });
});
