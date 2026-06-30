import { beforeEach, describe, expect, it, vi } from "vitest";

import { getDashboardSummary } from "../../../src/modules/dashboard/dashboard.service.js";

vi.mock("../../../src/modules/dashboard/dashboard.repository.js", () => ({
  findUserProfile: vi.fn(async () => ({ timezone: "America/Recife", financialMonthStartDay: 1, primaryGoalId: "goal-id" })),
  getIncomeTotals: vi.fn(async () => ({ monthlyIncomeInCents: 750000, extraIncomeInCents: 100000 })),
  getExpenseTotals: vi.fn(async () => ({ fixedExpensesInCents: 350000, variableExpensesInCents: 120000, debtPaymentsInCents: 50000 })),
  listDebts: vi.fn(async () => [{ currentBalanceInCents: 1200000, status: "OVERDUE" }]),
  findReserve: vi.fn(async () => ({ currentBalanceInCents: 500000, protectionMonths: 6, status: "BUILDING" })),
  findPrimaryGoal: vi.fn(async () => ({ id: "goal-id", userId: "user-id", title: "Notebook", targetAmountInCents: 1500000, currentAmountInCents: 500000, status: "IN_PROGRESS", deadlineDate: "2027-06-30" }))
}));

describe("DashboardService", () => {
  beforeEach(() => vi.clearAllMocks());

  it("returns summary for authenticated user", async () => {
    const result = await getDashboardSummary("user-id", "2026-06");
    expect(result.income.totalIncomeInCents).toBe(850000);
    expect(result.expenses.totalExpensesInCents).toBe(470000);
    expect(result.debts.openDebtBalanceInCents).toBe(1200000);
  });

  it("uses current month when query month is not provided", async () => {
    const result = await getDashboardSummary("user-id", undefined, new Date("2026-06-30T00:00:00.000Z"));
    expect(result.period.referenceMonth).toBe("2026-06");
  });

  it("uses query month when provided", async () => {
    const result = await getDashboardSummary("user-id", "2026-05");
    expect(result.period.referenceMonth).toBe("2026-05");
  });

  it("uses profile timezone and financial month start day", async () => {
    const repository = await import("../../../src/modules/dashboard/dashboard.repository.js");
    vi.mocked(repository.findUserProfile).mockResolvedValueOnce({ timezone: "America/Recife", financialMonthStartDay: 5, primaryGoalId: null });
    const result = await getDashboardSummary("user-id", "2026-06");
    expect(result.period.startDate).toBe("2026-06-05");
    expect(result.period.endDate).toBe("2026-07-04");
  });

  it("uses profile fallback when profile does not exist", async () => {
    const repository = await import("../../../src/modules/dashboard/dashboard.repository.js");
    vi.mocked(repository.findUserProfile).mockResolvedValueOnce(null);
    const result = await getDashboardSummary("user-id", "2026-06");
    expect(result.period.timezone).toBe("America/Recife");
    expect(result.period.financialMonthStartDay).toBe(1);
  });

  it("aggregates authenticated user income and expenses", async () => {
    const result = await getDashboardSummary("user-id", "2026-06");
    expect(result.income).toEqual({ monthlyIncomeInCents: 750000, extraIncomeInCents: 100000, totalIncomeInCents: 850000 });
    expect(result.expenses.totalExpensesInCents).toBe(470000);
  });

  it("returns reserve with calculated target", async () => {
    const result = await getDashboardSummary("user-id", "2026-06");
    expect(result.reserve).toEqual(expect.objectContaining({ targetAmountInCents: 2100000, completionPercentage: 23.81 }));
    expect(result.reserveSetupRequired).toBe(false);
  });

  it("sets reserveSetupRequired when reserve does not exist", async () => {
    const repository = await import("../../../src/modules/dashboard/dashboard.repository.js");
    vi.mocked(repository.findReserve).mockResolvedValueOnce(null);
    const result = await getDashboardSummary("user-id", "2026-06");
    expect(result.reserve).toBeNull();
    expect(result.reserveSetupRequired).toBe(true);
  });

  it("returns configured primary goal", async () => {
    const result = await getDashboardSummary("user-id", "2026-06");
    expect(result.primaryGoal).toEqual(expect.objectContaining({ id: "goal-id", completionPercentage: 33.33 }));
    expect(result.primaryGoalSetupRequired).toBe(false);
  });

  it("sets primaryGoalSetupRequired when there is no primary goal", async () => {
    const repository = await import("../../../src/modules/dashboard/dashboard.repository.js");
    vi.mocked(repository.findUserProfile).mockResolvedValueOnce({ timezone: "America/Recife", financialMonthStartDay: 1, primaryGoalId: null });
    const result = await getDashboardSummary("user-id", "2026-06");
    expect(result.primaryGoal).toBeNull();
    expect(result.primaryGoalSetupRequired).toBe(true);
  });

  it("does not return another user's primary goal", async () => {
    const repository = await import("../../../src/modules/dashboard/dashboard.repository.js");
    vi.mocked(repository.findPrimaryGoal).mockResolvedValueOnce(null);
    const result = await getDashboardSummary("user-id", "2026-06");
    expect(result.primaryGoal).toBeNull();
    expect(result.primaryGoalSetupRequired).toBe(true);
  });

  it("generates basic alerts", async () => {
    const result = await getDashboardSummary("user-id", "2026-06");
    expect(result.alerts.map((alert) => alert.type)).toEqual(expect.arrayContaining(["OVERDUE_DEBT", "RESERVE_BELOW_TARGET"]));
  });
});
