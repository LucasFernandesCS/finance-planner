import { invalidDashboardMonthError } from "./dashboard.errors.js";
import type { DashboardAlert, DashboardPeriod } from "./dashboard.types.js";

export function roundPercentage(value: number): number {
  return Math.round(value * 100) / 100;
}

export function parseDashboardMonth(input: unknown): string {
  if (typeof input !== "string" || !/^\d{4}-\d{2}$/.test(input)) {
    throw invalidDashboardMonthError();
  }
  const month = Number(input.slice(5, 7));
  if (month < 1 || month > 12) {
    throw invalidDashboardMonthError();
  }
  return input;
}

function dateOnly(date: Date): string {
  return date.toISOString().slice(0, 10);
}

export function currentReferenceMonth(now = new Date()): string {
  return now.toISOString().slice(0, 7);
}

export function calculateDashboardPeriod(input: {
  referenceMonth: string;
  timezone: string;
  financialMonthStartDay: number;
}): DashboardPeriod {
  const [year, month] = input.referenceMonth.split("-").map(Number);
  const start = new Date(Date.UTC(year, month - 1, input.financialMonthStartDay));
  const end = new Date(Date.UTC(year, month, input.financialMonthStartDay - 1));

  return {
    referenceMonth: input.referenceMonth,
    startDate: dateOnly(start),
    endDate: dateOnly(end),
    timezone: input.timezone,
    financialMonthStartDay: input.financialMonthStartDay
  };
}

export function toPeriodDateRange(period: DashboardPeriod): { startsAt: Date; endsAt: Date; endsBefore: Date } {
  const startsAt = new Date(`${period.startDate}T00:00:00.000Z`);
  const endsAt = new Date(`${period.endDate}T00:00:00.000Z`);
  const endsBefore = new Date(endsAt);
  endsBefore.setUTCDate(endsBefore.getUTCDate() + 1);
  return { startsAt, endsAt, endsBefore };
}

export function calculateIncome(input: { monthlyIncomeInCents: number; extraIncomeInCents: number }) {
  return { ...input, totalIncomeInCents: input.monthlyIncomeInCents + input.extraIncomeInCents };
}

export function calculateExpenses(input: {
  fixedExpensesInCents: number;
  variableExpensesInCents: number;
  debtPaymentsInCents: number;
}) {
  return { ...input, totalExpensesInCents: input.fixedExpensesInCents + input.variableExpensesInCents };
}

export function calculateCashFlow(input: {
  monthlyIncomeInCents: number;
  totalIncomeInCents: number;
  fixedExpensesInCents: number;
  totalExpensesInCents: number;
}) {
  return {
    expectedSurplusInCents: input.totalIncomeInCents - input.totalExpensesInCents,
    recurringSurplusInCents: input.monthlyIncomeInCents - input.fixedExpensesInCents
  };
}

export function calculateRates(input: {
  totalIncomeInCents: number;
  fixedExpensesInCents: number;
  totalExpensesInCents: number;
}) {
  if (input.totalIncomeInCents <= 0) {
    return { fixedCommitmentRate: 0, expenseRate: 0 };
  }
  return {
    fixedCommitmentRate: roundPercentage((input.fixedExpensesInCents / input.totalIncomeInCents) * 100),
    expenseRate: roundPercentage((input.totalExpensesInCents / input.totalIncomeInCents) * 100)
  };
}

export function calculateCompletionPercentage(currentAmountInCents: number, targetAmountInCents: number): number {
  return targetAmountInCents <= 0 ? 0 : roundPercentage((currentAmountInCents / targetAmountInCents) * 100);
}

export function calculateDebtSummary(debts: Array<{ currentBalanceInCents: number; status: string }>) {
  const openDebts = debts.filter((debt) => debt.status !== "PAID");
  return {
    openDebtBalanceInCents: openDebts.reduce((total, debt) => total + debt.currentBalanceInCents, 0),
    openDebtsCount: openDebts.length,
    overdueDebtsCount: openDebts.filter((debt) => debt.status === "OVERDUE").length
  };
}

export function generateDashboardAlerts(input: {
  expectedSurplusInCents: number;
  overdueDebtsCount: number;
  reserveSetupRequired: boolean;
  reserveStatus: string | null;
  primaryGoalSetupRequired: boolean;
  monthlyIncomeInCents: number;
  totalIncomeInCents: number;
  fixedExpensesInCents: number;
}): DashboardAlert[] {
  const alerts: DashboardAlert[] = [];
  if (input.expectedSurplusInCents < 0) {
    alerts.push({ type: "NEGATIVE_SURPLUS", severity: "HIGH", message: "Sua previsão do mês está negativa." });
  }
  if (input.overdueDebtsCount > 0) {
    alerts.push({ type: "OVERDUE_DEBT", severity: "HIGH", message: `Você possui ${input.overdueDebtsCount} dívida(s) atrasada(s).` });
  }
  if (input.reserveSetupRequired) {
    alerts.push({ type: "RESERVE_SETUP_REQUIRED", severity: "MEDIUM", message: "Configure sua reserva de emergência." });
  } else if (input.reserveStatus !== "PROTECTED") {
    alerts.push({ type: "RESERVE_BELOW_TARGET", severity: "MEDIUM", message: "Sua reserva ainda está abaixo da meta de proteção." });
  }
  if (input.primaryGoalSetupRequired) {
    alerts.push({ type: "PRIMARY_GOAL_SETUP_REQUIRED", severity: "LOW", message: "Defina um objetivo principal para acompanhar no dashboard." });
  }
  if (input.totalIncomeInCents === 0) {
    alerts.push({ type: "NO_INCOME_REGISTERED", severity: "MEDIUM", message: "Cadastre sua renda para visualizar melhor seu resumo financeiro." });
  }
  if (input.monthlyIncomeInCents > 0 && input.fixedExpensesInCents > input.monthlyIncomeInCents) {
    alerts.push({ type: "FIXED_EXPENSES_EXCEED_MONTHLY_INCOME", severity: "HIGH", message: "Suas despesas fixas superam sua renda mensal." });
  }
  return alerts;
}
