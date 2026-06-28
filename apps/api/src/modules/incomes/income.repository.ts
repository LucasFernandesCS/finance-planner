import { prisma } from "../../shared/infra/prisma.js";
import {
  fromReferenceMonthDate,
  toReferenceMonthDate
} from "./income.policy.js";
import type { Income, IncomeInput, PublicIncome } from "./income.types.js";

function toIncome(record: {
  id: string;
  userId: string;
  title: string;
  amountInCents: bigint;
  type: "MONTHLY" | "EXTRA";
  referenceMonth: Date;
  description: string | null;
}): Income {
  return {
    id: record.id,
    userId: record.userId,
    title: record.title,
    amountInCents: Number(record.amountInCents),
    type: record.type,
    referenceMonth: fromReferenceMonthDate(record.referenceMonth),
    description: record.description
  };
}

export function toPublicIncome(income: Income): PublicIncome {
  const { userId: _userId, ...publicIncome } = income;
  return publicIncome;
}

export async function createIncome(userId: string, input: IncomeInput): Promise<Income> {
  const income = await prisma.income.create({
    data: {
      userId,
      title: input.title,
      amountInCents: BigInt(input.amountInCents),
      type: input.type,
      referenceMonth: toReferenceMonthDate(input.referenceMonth),
      description: input.description
    }
  });

  return toIncome(income);
}

export async function listIncomesByUserAndMonth(userId: string, referenceMonth: string): Promise<Income[]> {
  const incomes = await prisma.income.findMany({
    where: {
      userId,
      referenceMonth: toReferenceMonthDate(referenceMonth)
    },
    orderBy: {
      createdAt: "asc"
    }
  });

  return incomes.map(toIncome);
}

export async function findIncomeById(incomeId: string): Promise<Income | null> {
  const income = await prisma.income.findUnique({
    where: { id: incomeId }
  });

  return income ? toIncome(income) : null;
}

export async function updateIncome(incomeId: string, input: IncomeInput): Promise<Income> {
  const income = await prisma.income.update({
    where: { id: incomeId },
    data: {
      title: input.title,
      amountInCents: BigInt(input.amountInCents),
      type: input.type,
      referenceMonth: toReferenceMonthDate(input.referenceMonth),
      description: input.description
    }
  });

  return toIncome(income);
}

export async function deleteIncome(incomeId: string): Promise<void> {
  await prisma.income.delete({
    where: { id: incomeId }
  });
}
