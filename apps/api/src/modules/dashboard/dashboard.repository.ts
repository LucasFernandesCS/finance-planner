import { prisma } from "../../shared/infra/prisma.js";
import { toMonthDate } from "../expenses/expense.policy.js";
import type { DashboardProfile } from "./dashboard.types.js";

export async function findUserProfile(userId: string): Promise<DashboardProfile | null> {
  return prisma.userProfile.findUnique({
    where: { userId },
    select: { timezone: true, financialMonthStartDay: true, primaryGoalId: true }
  });
}

export async function getIncomeTotals(userId: string, referenceMonth: string) {
  const monthDate = toMonthDate(referenceMonth);
  const [monthly, extra] = await Promise.all([
    prisma.income.aggregate({
      where: { userId, type: "MONTHLY", referenceMonth: { lte: monthDate } },
      _sum: { amountInCents: true }
    }),
    prisma.income.aggregate({
      where: { userId, type: "EXTRA", referenceMonth: monthDate },
      _sum: { amountInCents: true }
    })
  ]);
  return {
    monthlyIncomeInCents: Number(monthly._sum.amountInCents ?? 0),
    extraIncomeInCents: Number(extra._sum.amountInCents ?? 0)
  };
}

export async function getExpenseTotals(userId: string, referenceMonth: string) {
  const [fixed, variable, debtPayments] = await Promise.all([
    prisma.fixedExpense.aggregate({
      where: { userId, startMonth: { lte: toMonthDate(referenceMonth) } },
      _sum: { amountInCents: true }
    }),
    prisma.variableExpense.aggregate({
      where: { userId, referenceMonth: toMonthDate(referenceMonth) },
      _sum: { amountInCents: true }
    }),
    prisma.variableExpense.aggregate({
      where: { userId, referenceMonth: toMonthDate(referenceMonth), category: "DEBT_PAYMENT" },
      _sum: { amountInCents: true }
    })
  ]);
  return {
    fixedExpensesInCents: Number(fixed._sum.amountInCents ?? 0),
    variableExpensesInCents: Number(variable._sum.amountInCents ?? 0),
    debtPaymentsInCents: Number(debtPayments._sum.amountInCents ?? 0)
  };
}

export async function listDebts(userId: string) {
  const debts = await prisma.debt.findMany({
    where: { userId },
    select: { currentBalanceInCents: true, status: true }
  });
  return debts.map((debt) => ({ currentBalanceInCents: Number(debt.currentBalanceInCents), status: debt.status }));
}

export async function findReserve(userId: string) {
  const reserve = await prisma.emergencyReserve.findUnique({
    where: { userId },
    select: { currentBalanceInCents: true, protectionMonths: true, status: true }
  });
  return reserve
    ? {
        currentBalanceInCents: Number(reserve.currentBalanceInCents),
        protectionMonths: reserve.protectionMonths,
        status: reserve.status
      }
    : null;
}

export async function findPrimaryGoal(userId: string, goalId: string) {
  const goal = await prisma.goal.findFirst({
    where: { id: goalId, userId },
    select: {
      id: true,
      title: true,
      targetAmountInCents: true,
      currentAmountInCents: true,
      status: true,
      deadlineDate: true
    }
  });
  return goal
    ? {
        id: goal.id,
        title: goal.title,
        targetAmountInCents: Number(goal.targetAmountInCents),
        currentAmountInCents: Number(goal.currentAmountInCents),
        status: goal.status,
        deadlineDate: goal.deadlineDate.toISOString().slice(0, 10)
      }
    : null;
}
