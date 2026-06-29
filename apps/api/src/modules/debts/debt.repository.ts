import type { Prisma } from "@prisma/client";

import { prisma } from "../../shared/infra/prisma.js";
import { fromMonthDate, toMonthDate } from "../expenses/expense.policy.js";
import type { PublicVariableExpense } from "../expenses/expense.types.js";
import { getDebtStatusAfterPayment } from "./debt-policy.js";
import type { DebtInput, DebtOutput, DebtPaymentInput, DebtPaymentOutput } from "./debt.types.js";

type PrismaTransaction = Prisma.TransactionClient;

type DebtRecord = {
  id: string;
  title: string;
  creditor: string;
  type: DebtOutput["type"];
  originalAmountInCents: bigint;
  currentBalanceInCents: bigint;
  installmentAmountInCents: bigint | null;
  monthlyDueDay: number;
  status: DebtOutput["status"];
  description: string | null;
  createdAt?: Date;
  updatedAt?: Date;
};

type OwnedDebtRecord = DebtRecord & { userId: string };

type PaymentRecord = {
  id: string;
  debtId: string;
  userId?: string;
  amountInCents: bigint;
  paidAt: Date;
  note: string | null;
};

function toDebt(record: OwnedDebtRecord): DebtOutput {
  return {
    id: record.id,
    title: record.title,
    creditor: record.creditor,
    type: record.type,
    originalAmountInCents: Number(record.originalAmountInCents),
    currentBalanceInCents: Number(record.currentBalanceInCents),
    installmentAmountInCents:
      record.installmentAmountInCents === null ? null : Number(record.installmentAmountInCents),
    monthlyDueDay: record.monthlyDueDay,
    status: record.status,
    description: record.description,
    createdAt: record.createdAt?.toISOString(),
    updatedAt: record.updatedAt?.toISOString()
  };
}

function toOwnedDebt(record: OwnedDebtRecord): DebtOutput & { userId: string } {
  return {
    ...toDebt(record),
    userId: record.userId
  };
}

function toDebtPayment(record: PaymentRecord): DebtPaymentOutput {
  return {
    id: record.id,
    debtId: record.debtId,
    amountInCents: Number(record.amountInCents),
    paidAt: record.paidAt.toISOString().slice(0, 10),
    note: record.note
  };
}

export function toPublicDebt(debt: DebtOutput & { userId?: string }): DebtOutput {
  const { userId: _userId, ...publicDebt } = debt;
  return publicDebt;
}

export function toPublicDebtPayment(payment: DebtPaymentOutput): DebtPaymentOutput {
  return payment;
}

export async function createDebt(userId: string, input: DebtInput): Promise<DebtOutput & { userId: string }> {
  const debt = await prisma.debt.create({
    data: {
      userId,
      title: input.title,
      creditor: input.creditor,
      type: input.type,
      originalAmountInCents: BigInt(input.originalAmountInCents),
      currentBalanceInCents: BigInt(input.originalAmountInCents),
      installmentAmountInCents:
        input.installmentAmountInCents === null || input.installmentAmountInCents === undefined
          ? null
          : BigInt(input.installmentAmountInCents),
      monthlyDueDay: input.monthlyDueDay,
      description: input.description
    }
  });

  return toOwnedDebt(debt);
}

export async function listDebtsByUser(userId: string): Promise<Array<DebtOutput & { userId: string }>> {
  const debts = await prisma.debt.findMany({
    where: { userId },
    orderBy: { createdAt: "asc" }
  });

  return debts.map(toOwnedDebt);
}

export async function findDebtById(debtId: string): Promise<(DebtOutput & { userId: string }) | null> {
  const debt = await prisma.debt.findUnique({
    where: { id: debtId }
  });

  return debt ? toOwnedDebt(debt) : null;
}

export async function updateDebt(debtId: string, input: DebtInput): Promise<DebtOutput & { userId: string }> {
  const debt = await prisma.debt.update({
    where: { id: debtId },
    data: {
      title: input.title,
      creditor: input.creditor,
      type: input.type,
      originalAmountInCents: BigInt(input.originalAmountInCents),
      installmentAmountInCents:
        input.installmentAmountInCents === null || input.installmentAmountInCents === undefined
          ? null
          : BigInt(input.installmentAmountInCents),
      monthlyDueDay: input.monthlyDueDay,
      description: input.description
    }
  });

  return toOwnedDebt(debt);
}

export async function deleteDebt(debtId: string): Promise<void> {
  await prisma.debt.delete({
    where: { id: debtId }
  });
}

export async function hasDebtPaymentInMonth(debtId: string, startsAt: Date, endsBefore: Date): Promise<boolean> {
  const count = await prisma.debtPayment.count({
    where: {
      debtId,
      paidAt: {
        gte: startsAt,
        lt: endsBefore
      }
    }
  });

  return count > 0;
}

export async function updateDebtStatus(
  debt: DebtOutput & { userId?: string },
  status: DebtOutput["status"]
): Promise<DebtOutput & { userId: string }> {
  const updated = await prisma.debt.update({
    where: { id: debt.id },
    data: { status }
  });

  return toOwnedDebt(updated);
}

function referenceMonthFor(date: Date): string {
  return date.toISOString().slice(0, 7);
}

async function payDebtInTransaction(
  tx: PrismaTransaction,
  userId: string,
  debt: DebtOutput,
  input: DebtPaymentInput
) {
  const paidAt = input.paidAt ?? new Date();
  const nextBalance = debt.currentBalanceInCents - input.amountInCents;
  const nextStatus = getDebtStatusAfterPayment(nextBalance);

  const [updatedDebt, payment, variableExpense] = await Promise.all([
    tx.debt.update({
      where: { id: debt.id },
      data: {
        currentBalanceInCents: BigInt(nextBalance),
        status: nextStatus
      }
    }),
    tx.debtPayment.create({
      data: {
        debtId: debt.id,
        userId,
        amountInCents: BigInt(input.amountInCents),
        paidAt,
        note: input.note
      }
    }),
    tx.variableExpense.create({
      data: {
        userId,
        title: `Pagamento de dívida: ${debt.title}`,
        amountInCents: BigInt(input.amountInCents),
        category: "DEBT_PAYMENT",
        referenceMonth: toMonthDate(referenceMonthFor(paidAt)),
        description: input.note ?? debt.description
      }
    })
  ]);

  return {
    debt: toOwnedDebt(updatedDebt),
    payment: toDebtPayment(payment),
    variableExpense: {
      id: variableExpense.id,
      title: variableExpense.title,
      amountInCents: Number(variableExpense.amountInCents),
      category: variableExpense.category,
      referenceMonth: fromMonthDate(variableExpense.referenceMonth),
      description: variableExpense.description
    } satisfies PublicVariableExpense
  };
}

export async function payDebt(
  userId: string,
  debt: DebtOutput,
  input: DebtPaymentInput
): Promise<{ debt: DebtOutput; payment: DebtPaymentOutput; variableExpense: PublicVariableExpense }> {
  return prisma.$transaction((tx) => payDebtInTransaction(tx, userId, debt, input));
}
