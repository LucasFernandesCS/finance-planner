import type { Prisma } from "@prisma/client";

import { prisma } from "../../shared/infra/prisma.js";
import { toMonthDate } from "../expenses/expense.policy.js";
import { calculateReserveTransaction, getReserveStatus } from "./reserve-policy.js";
import type {
  EmergencyReserve,
  PublicReserveTransaction,
  ReserveTransaction,
  ReserveTransactionInput,
  ReserveTransactionType
} from "./reserve-tracking.types.js";

type PrismaTransaction = Prisma.TransactionClient;

function toReserve(record: {
  id: string;
  userId: string;
  protectionMonths: number;
  currentBalanceInCents: bigint;
  status: EmergencyReserve["status"];
}): EmergencyReserve {
  return {
    id: record.id,
    userId: record.userId,
    protectionMonths: record.protectionMonths,
    currentBalanceInCents: Number(record.currentBalanceInCents),
    status: record.status
  };
}

function toTransaction(record: {
  id: string;
  reserveId: string;
  userId: string;
  type: ReserveTransactionType;
  amountInCents: bigint;
  occurredAt: Date;
  note: string | null;
}): ReserveTransaction {
  return {
    id: record.id,
    reserveId: record.reserveId,
    userId: record.userId,
    type: record.type,
    amountInCents: Number(record.amountInCents),
    occurredAt: record.occurredAt.toISOString().slice(0, 10),
    note: record.note
  };
}

export function toPublicReserveTransaction(transaction: ReserveTransaction): PublicReserveTransaction {
  const { userId: _userId, reserveId: _reserveId, ...publicTransaction } = transaction;
  return publicTransaction;
}

function currentMonth(now = new Date()): string {
  return now.toISOString().slice(0, 7);
}

export async function getMonthlyFixedExpenseTotal(userId: string, month = currentMonth()): Promise<number> {
  const result = await prisma.fixedExpense.aggregate({
    where: {
      userId,
      startMonth: { lte: toMonthDate(month) }
    },
    _sum: { amountInCents: true }
  });

  return Number(result._sum.amountInCents ?? 0);
}

export async function findReserveByUserId(userId: string): Promise<EmergencyReserve | null> {
  const reserve = await prisma.emergencyReserve.findUnique({ where: { userId } });
  return reserve ? toReserve(reserve) : null;
}

export async function createReserve(userId: string, protectionMonths: number): Promise<EmergencyReserve> {
  const reserve = await prisma.emergencyReserve.create({
    data: { userId, protectionMonths }
  });
  return toReserve(reserve);
}

export async function updateReserve(reserveId: string, protectionMonths: number): Promise<EmergencyReserve> {
  const reserve = await prisma.emergencyReserve.update({
    where: { id: reserveId },
    data: { protectionMonths }
  });
  return toReserve(reserve);
}

export async function updateReserveStatus(
  reserve: EmergencyReserve,
  status: EmergencyReserve["status"]
): Promise<EmergencyReserve> {
  const updated = await prisma.emergencyReserve.update({
    where: { id: reserve.id },
    data: { status }
  });
  return toReserve(updated);
}

async function moveReserveInTransaction(
  tx: PrismaTransaction,
  userId: string,
  reserve: EmergencyReserve,
  input: ReserveTransactionInput,
  type: ReserveTransactionType,
  targetAmountInCents: number
) {
  const currentBalanceInCents = calculateReserveTransaction({
    currentBalanceInCents: reserve.currentBalanceInCents,
    amountInCents: input.amountInCents,
    type
  });
  const status = getReserveStatus({
    previousStatus: reserve.status,
    currentBalanceInCents,
    targetAmountInCents
  });

  const [updatedReserve, transaction] = await Promise.all([
    tx.emergencyReserve.update({
      where: { id: reserve.id },
      data: { currentBalanceInCents: BigInt(currentBalanceInCents), status }
    }),
    tx.reserveTransaction.create({
      data: {
        reserveId: reserve.id,
        userId,
        type,
        amountInCents: BigInt(input.amountInCents),
        occurredAt: input.occurredAt ?? new Date(),
        note: input.note
      }
    })
  ]);

  return { reserve: toReserve(updatedReserve), transaction: toTransaction(transaction) };
}

export async function moveReserve(
  userId: string,
  reserve: EmergencyReserve,
  input: ReserveTransactionInput,
  type: ReserveTransactionType,
  targetAmountInCents: number
): Promise<{ reserve: EmergencyReserve; transaction: ReserveTransaction }> {
  return prisma.$transaction((tx) => moveReserveInTransaction(tx, userId, reserve, input, type, targetAmountInCents));
}

export async function listReserveTransactions(reserveId: string): Promise<ReserveTransaction[]> {
  const transactions = await prisma.reserveTransaction.findMany({
    where: { reserveId },
    orderBy: { occurredAt: "asc" }
  });
  return transactions.map(toTransaction);
}
