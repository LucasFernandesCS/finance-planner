import { describe, expect, it } from "vitest";

import { DASHBOARD_ERROR_CODES } from "../../../src/modules/dashboard/dashboard.errors.js";
import {
  calculateCashFlow,
  calculateCompletionPercentage,
  calculateDashboardPeriod,
  calculateDebtSummary,
  calculateExpenses,
  calculateIncome,
  calculateRates,
  generateDashboardAlerts,
  parseDashboardMonth
} from "../../../src/modules/dashboard/dashboard-policy.js";

describe("dashboard policy", () => {
  it("calculates total income", () => {
    expect(calculateIncome({ monthlyIncomeInCents: 750000, extraIncomeInCents: 100000 })).toEqual({
      monthlyIncomeInCents: 750000,
      extraIncomeInCents: 100000,
      totalIncomeInCents: 850000
    });
  });

  it("calculates total expenses without duplicating debt payments", () => {
    expect(
      calculateExpenses({ fixedExpensesInCents: 350000, variableExpensesInCents: 120000, debtPaymentsInCents: 50000 })
    ).toEqual({
      fixedExpensesInCents: 350000,
      variableExpensesInCents: 120000,
      debtPaymentsInCents: 50000,
      totalExpensesInCents: 470000
    });
  });

  it("calculates positive expected surplus", () => {
    expect(calculateCashFlow({ monthlyIncomeInCents: 750000, totalIncomeInCents: 850000, fixedExpensesInCents: 350000, totalExpensesInCents: 470000 }).expectedSurplusInCents).toBe(380000);
  });

  it("calculates negative expected surplus", () => {
    expect(calculateCashFlow({ monthlyIncomeInCents: 100000, totalIncomeInCents: 100000, fixedExpensesInCents: 350000, totalExpensesInCents: 470000 }).expectedSurplusInCents).toBe(-370000);
  });

  it("calculates recurring surplus", () => {
    expect(calculateCashFlow({ monthlyIncomeInCents: 750000, totalIncomeInCents: 850000, fixedExpensesInCents: 350000, totalExpensesInCents: 470000 }).recurringSurplusInCents).toBe(400000);
  });

  it("calculates rates with positive income", () => {
    expect(calculateRates({ totalIncomeInCents: 850000, fixedExpensesInCents: 350000, totalExpensesInCents: 470000 })).toEqual({
      fixedCommitmentRate: 41.18,
      expenseRate: 55.29
    });
  });

  it("returns zero rates with zero income", () => {
    expect(calculateRates({ totalIncomeInCents: 0, fixedExpensesInCents: 350000, totalExpensesInCents: 470000 })).toEqual({
      fixedCommitmentRate: 0,
      expenseRate: 0
    });
  });

  it("calculates reserve completion percentage", () => {
    expect(calculateCompletionPercentage(500000, 2100000)).toBe(23.81);
  });

  it("calculates primary goal completion percentage", () => {
    expect(calculateCompletionPercentage(500000, 1500000)).toBe(33.33);
  });

  it("summarizes open debts excluding paid debts", () => {
    expect(
      calculateDebtSummary([
        { currentBalanceInCents: 1000000, status: "IN_PROGRESS" },
        { currentBalanceInCents: 200000, status: "OVERDUE" },
        { currentBalanceInCents: 0, status: "PAID" }
      ])
    ).toEqual({ openDebtBalanceInCents: 1200000, openDebtsCount: 2, overdueDebtsCount: 1 });
  });

  it("generates alert for negative surplus", () => {
    expect(generateDashboardAlerts({ expectedSurplusInCents: -1, overdueDebtsCount: 0, reserveSetupRequired: false, reserveStatus: "PROTECTED", primaryGoalSetupRequired: false, monthlyIncomeInCents: 1, totalIncomeInCents: 1, fixedExpensesInCents: 0 }).map((alert) => alert.type)).toContain("NEGATIVE_SURPLUS");
  });

  it("generates alert for overdue debt", () => {
    expect(generateDashboardAlerts({ expectedSurplusInCents: 0, overdueDebtsCount: 1, reserveSetupRequired: false, reserveStatus: "PROTECTED", primaryGoalSetupRequired: false, monthlyIncomeInCents: 1, totalIncomeInCents: 1, fixedExpensesInCents: 0 }).map((alert) => alert.type)).toContain("OVERDUE_DEBT");
  });

  it("generates alert for missing reserve", () => {
    expect(generateDashboardAlerts({ expectedSurplusInCents: 0, overdueDebtsCount: 0, reserveSetupRequired: true, reserveStatus: null, primaryGoalSetupRequired: false, monthlyIncomeInCents: 1, totalIncomeInCents: 1, fixedExpensesInCents: 0 }).map((alert) => alert.type)).toContain("RESERVE_SETUP_REQUIRED");
  });

  it("generates alert for reserve below target", () => {
    expect(generateDashboardAlerts({ expectedSurplusInCents: 0, overdueDebtsCount: 0, reserveSetupRequired: false, reserveStatus: "BUILDING", primaryGoalSetupRequired: false, monthlyIncomeInCents: 1, totalIncomeInCents: 1, fixedExpensesInCents: 0 }).map((alert) => alert.type)).toContain("RESERVE_BELOW_TARGET");
  });

  it("generates alert for missing primary goal", () => {
    expect(generateDashboardAlerts({ expectedSurplusInCents: 0, overdueDebtsCount: 0, reserveSetupRequired: false, reserveStatus: "PROTECTED", primaryGoalSetupRequired: true, monthlyIncomeInCents: 1, totalIncomeInCents: 1, fixedExpensesInCents: 0 }).map((alert) => alert.type)).toContain("PRIMARY_GOAL_SETUP_REQUIRED");
  });

  it("generates alert for no income", () => {
    expect(generateDashboardAlerts({ expectedSurplusInCents: 0, overdueDebtsCount: 0, reserveSetupRequired: false, reserveStatus: "PROTECTED", primaryGoalSetupRequired: false, monthlyIncomeInCents: 0, totalIncomeInCents: 0, fixedExpensesInCents: 0 }).map((alert) => alert.type)).toContain("NO_INCOME_REGISTERED");
  });

  it("generates alert when fixed expenses exceed monthly income", () => {
    expect(generateDashboardAlerts({ expectedSurplusInCents: 0, overdueDebtsCount: 0, reserveSetupRequired: false, reserveStatus: "PROTECTED", primaryGoalSetupRequired: false, monthlyIncomeInCents: 100000, totalIncomeInCents: 100000, fixedExpensesInCents: 150000 }).map((alert) => alert.type)).toContain("FIXED_EXPENSES_EXCEED_MONTHLY_INCOME");
  });

  it("calculates period with financialMonthStartDay equal to 1", () => {
    expect(calculateDashboardPeriod({ referenceMonth: "2026-06", timezone: "America/Recife", financialMonthStartDay: 1 })).toEqual({
      referenceMonth: "2026-06",
      startDate: "2026-06-01",
      endDate: "2026-06-30",
      timezone: "America/Recife",
      financialMonthStartDay: 1
    });
  });

  it("calculates period with financialMonthStartDay different from 1", () => {
    expect(calculateDashboardPeriod({ referenceMonth: "2026-06", timezone: "America/Recife", financialMonthStartDay: 5 })).toEqual({
      referenceMonth: "2026-06",
      startDate: "2026-06-05",
      endDate: "2026-07-04",
      timezone: "America/Recife",
      financialMonthStartDay: 5
    });
  });

  it("rejects invalid month query", () => {
    expect(() => parseDashboardMonth("06-2026")).toThrow(
      expect.objectContaining({ code: DASHBOARD_ERROR_CODES.invalidMonth })
    );
  });
});
