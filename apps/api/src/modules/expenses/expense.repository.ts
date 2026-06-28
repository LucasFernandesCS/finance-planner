import { prisma } from "../../shared/infra/prisma.js";
import { fromMonthDate, toMonthDate } from "./expense.policy.js";
import type {
  ExpenseCategory,
  ExpenseInput,
  FixedExpense,
  PublicFixedExpense,
  PublicVariableExpense,
  VariableExpense
} from "./expense.types.js";

type ExpenseRecord = {
  id: string;
  userId: string;
  title: string;
  amountInCents: bigint;
  category: ExpenseCategory;
  description: string | null;
};

function toFixedExpense(record: ExpenseRecord & { startMonth: Date }): FixedExpense {
  return {
    id: record.id,
    userId: record.userId,
    title: record.title,
    amountInCents: Number(record.amountInCents),
    category: record.category,
    startMonth: fromMonthDate(record.startMonth),
    description: record.description
  };
}

function toVariableExpense(record: ExpenseRecord & { referenceMonth: Date }): VariableExpense {
  return {
    id: record.id,
    userId: record.userId,
    title: record.title,
    amountInCents: Number(record.amountInCents),
    category: record.category,
    referenceMonth: fromMonthDate(record.referenceMonth),
    description: record.description
  };
}

export function toPublicFixedExpense(expense: FixedExpense): PublicFixedExpense {
  const { userId: _userId, ...publicExpense } = expense;
  return publicExpense;
}

export function toPublicVariableExpense(expense: VariableExpense): PublicVariableExpense {
  const { userId: _userId, ...publicExpense } = expense;
  return publicExpense;
}

export async function createFixedExpense(userId: string, input: ExpenseInput): Promise<FixedExpense> {
  const expense = await prisma.fixedExpense.create({
    data: {
      userId,
      title: input.title,
      amountInCents: BigInt(input.amountInCents),
      category: input.category,
      startMonth: toMonthDate(input.month),
      description: input.description
    }
  });

  return toFixedExpense(expense);
}

export async function listFixedExpensesByUser(userId: string): Promise<FixedExpense[]> {
  const expenses = await prisma.fixedExpense.findMany({
    where: { userId },
    orderBy: { createdAt: "asc" }
  });

  return expenses.map(toFixedExpense);
}

export async function findFixedExpenseById(fixedExpenseId: string): Promise<FixedExpense | null> {
  const expense = await prisma.fixedExpense.findUnique({
    where: { id: fixedExpenseId }
  });

  return expense ? toFixedExpense(expense) : null;
}

export async function updateFixedExpense(fixedExpenseId: string, input: ExpenseInput): Promise<FixedExpense> {
  const expense = await prisma.fixedExpense.update({
    where: { id: fixedExpenseId },
    data: {
      title: input.title,
      amountInCents: BigInt(input.amountInCents),
      category: input.category,
      startMonth: toMonthDate(input.month),
      description: input.description
    }
  });

  return toFixedExpense(expense);
}

export async function deleteFixedExpense(fixedExpenseId: string): Promise<void> {
  await prisma.fixedExpense.delete({
    where: { id: fixedExpenseId }
  });
}

export async function createVariableExpense(userId: string, input: ExpenseInput): Promise<VariableExpense> {
  const expense = await prisma.variableExpense.create({
    data: {
      userId,
      title: input.title,
      amountInCents: BigInt(input.amountInCents),
      category: input.category,
      referenceMonth: toMonthDate(input.month),
      description: input.description
    }
  });

  return toVariableExpense(expense);
}

export async function listVariableExpensesByUserAndMonth(
  userId: string,
  referenceMonth: string
): Promise<VariableExpense[]> {
  const expenses = await prisma.variableExpense.findMany({
    where: {
      userId,
      referenceMonth: toMonthDate(referenceMonth)
    },
    orderBy: { createdAt: "asc" }
  });

  return expenses.map(toVariableExpense);
}

export async function findVariableExpenseById(variableExpenseId: string): Promise<VariableExpense | null> {
  const expense = await prisma.variableExpense.findUnique({
    where: { id: variableExpenseId }
  });

  return expense ? toVariableExpense(expense) : null;
}

export async function updateVariableExpense(
  variableExpenseId: string,
  input: ExpenseInput
): Promise<VariableExpense> {
  const expense = await prisma.variableExpense.update({
    where: { id: variableExpenseId },
    data: {
      title: input.title,
      amountInCents: BigInt(input.amountInCents),
      category: input.category,
      referenceMonth: toMonthDate(input.month),
      description: input.description
    }
  });

  return toVariableExpense(expense);
}

export async function deleteVariableExpense(variableExpenseId: string): Promise<void> {
  await prisma.variableExpense.delete({
    where: { id: variableExpenseId }
  });
}
