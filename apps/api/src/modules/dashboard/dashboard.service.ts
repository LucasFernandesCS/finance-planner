import {
  calculateCashFlow,
  calculateCompletionPercentage,
  calculateDashboardPeriod,
  calculateDebtSummary,
  calculateExpenses,
  calculateIncome,
  calculateRates,
  currentReferenceMonth,
  generateDashboardAlerts,
  parseDashboardMonth,
  toPeriodDateRange
} from "./dashboard-policy.js";
import {
  findPrimaryGoal,
  findReserve,
  findUserProfile,
  getExpenseTotals,
  getIncomeTotals,
  listDebts
} from "./dashboard.repository.js";
import type { DashboardProfile, DashboardSummary } from "./dashboard.types.js";

const DEFAULT_PROFILE: DashboardProfile = {
  timezone: "America/Recife",
  financialMonthStartDay: 1,
  primaryGoalId: null
};

export async function getDashboardSummary(
  userId: string,
  month?: string,
  now = new Date()
): Promise<DashboardSummary> {
  const profile = (await findUserProfile(userId)) ?? DEFAULT_PROFILE;
  const referenceMonth = month ? parseDashboardMonth(month) : currentReferenceMonth(now);
  const period = calculateDashboardPeriod({
    referenceMonth,
    timezone: profile.timezone,
    financialMonthStartDay: profile.financialMonthStartDay
  });
  const range = toPeriodDateRange(period);

  const [incomeTotals, expenseTotals, debtsRaw, reserveRaw, primaryGoalRaw] = await Promise.all([
    getIncomeTotals(userId, referenceMonth),
    getExpenseTotals(userId, referenceMonth),
    listDebts(userId),
    findReserve(userId),
    profile.primaryGoalId ? findPrimaryGoal(userId, profile.primaryGoalId) : Promise.resolve(null)
  ]);

  const income = calculateIncome(incomeTotals);
  const expenses = calculateExpenses(expenseTotals);
  const cashFlowBase = calculateCashFlow({
    monthlyIncomeInCents: income.monthlyIncomeInCents,
    totalIncomeInCents: income.totalIncomeInCents,
    fixedExpensesInCents: expenses.fixedExpensesInCents,
    totalExpensesInCents: expenses.totalExpensesInCents
  });
  const rates = calculateRates({
    totalIncomeInCents: income.totalIncomeInCents,
    fixedExpensesInCents: expenses.fixedExpensesInCents,
    totalExpensesInCents: expenses.totalExpensesInCents
  });
  const debts = calculateDebtSummary(debtsRaw);
  const reserve = reserveRaw
    ? {
        currentBalanceInCents: reserveRaw.currentBalanceInCents,
        monthlyFixedExpensesInCents: expenses.fixedExpensesInCents,
        targetAmountInCents: expenses.fixedExpensesInCents * reserveRaw.protectionMonths,
        completionPercentage: calculateCompletionPercentage(
          reserveRaw.currentBalanceInCents,
          expenses.fixedExpensesInCents * reserveRaw.protectionMonths
        ),
        status: reserveRaw.status
      }
    : null;
  const primaryGoal = primaryGoalRaw
    ? {
        ...primaryGoalRaw,
        completionPercentage: calculateCompletionPercentage(
          primaryGoalRaw.currentAmountInCents,
          primaryGoalRaw.targetAmountInCents
        )
      }
    : null;
  const reserveSetupRequired = reserve === null;
  const primaryGoalSetupRequired = primaryGoal === null;
  const cashFlow = { ...cashFlowBase, ...rates };

  return {
    period,
    income,
    expenses,
    cashFlow,
    debts,
    reserve,
    reserveSetupRequired,
    primaryGoal,
    primaryGoalSetupRequired,
    alerts: generateDashboardAlerts({
      expectedSurplusInCents: cashFlow.expectedSurplusInCents,
      overdueDebtsCount: debts.overdueDebtsCount,
      reserveSetupRequired,
      reserveStatus: reserve?.status ?? null,
      primaryGoalSetupRequired,
      monthlyIncomeInCents: income.monthlyIncomeInCents,
      totalIncomeInCents: income.totalIncomeInCents,
      fixedExpensesInCents: expenses.fixedExpensesInCents
    })
  };
}
