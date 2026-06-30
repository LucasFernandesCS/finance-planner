import {
  reserveAlreadyConfiguredError,
  reserveNotFoundError
} from "./reserve-tracking.errors.js";
import {
  calculateCompletionPercentage,
  calculateReserveTarget,
  calculateReserveTransaction,
  getReserveStatus,
  validateMonthlyFixedExpenses,
  validateProtectionMonths,
  validateReserveTransactionInput
} from "./reserve-policy.js";
import {
  createReserve,
  findReserveByUserId,
  getMonthlyFixedExpenseTotal,
  listReserveTransactions,
  moveReserve,
  toPublicReserveTransaction,
  updateReserve,
  updateReserveStatus
} from "./reserve-tracking.repository.js";
import type {
  EmergencyReserve,
  PublicReserveTransaction,
  ReserveView
} from "./reserve-tracking.types.js";

function toReserveView(reserve: EmergencyReserve, monthlyFixedExpensesInCents: number): ReserveView {
  const targetAmountInCents = calculateReserveTarget({
    monthlyFixedExpensesInCents,
    protectionMonths: reserve.protectionMonths
  });
  return {
    id: reserve.id,
    protectionMonths: reserve.protectionMonths,
    currentBalanceInCents: reserve.currentBalanceInCents,
    monthlyFixedExpensesInCents,
    targetAmountInCents,
    completionPercentage: calculateCompletionPercentage({
      currentBalanceInCents: reserve.currentBalanceInCents,
      targetAmountInCents
    }),
    status: reserve.status
  };
}

async function getReserveOrThrow(userId: string): Promise<EmergencyReserve> {
  const reserve = await findReserveByUserId(userId);
  if (!reserve) {
    throw reserveNotFoundError();
  }
  return reserve;
}

async function recalculateReserve(reserve: EmergencyReserve, monthlyFixedExpensesInCents: number): Promise<EmergencyReserve> {
  const targetAmountInCents = calculateReserveTarget({
    monthlyFixedExpensesInCents,
    protectionMonths: reserve.protectionMonths
  });
  const status = getReserveStatus({
    previousStatus: reserve.status,
    currentBalanceInCents: reserve.currentBalanceInCents,
    targetAmountInCents
  });
  return status === reserve.status ? reserve : updateReserveStatus(reserve, status);
}

async function getMonthlyFixedExpenseTotalOrThrow(userId: string): Promise<number> {
  const total = await getMonthlyFixedExpenseTotal(userId);
  return validateMonthlyFixedExpenses(total);
}

export async function configureUserReserve(userId: string, input: unknown): Promise<{ reserve: ReserveView }> {
  const protectionMonths = validateProtectionMonths((input as { protectionMonths?: unknown })?.protectionMonths);
  const existingReserve = await findReserveByUserId(userId);
  if (existingReserve) {
    throw reserveAlreadyConfiguredError();
  }
  const monthlyFixedExpensesInCents = await getMonthlyFixedExpenseTotalOrThrow(userId);
  const reserve = await createReserve(userId, protectionMonths);
  return { reserve: toReserveView(reserve, monthlyFixedExpensesInCents) };
}

export async function getUserReserve(userId: string): Promise<{ reserve: ReserveView | null; setupRequired: boolean }> {
  const reserve = await findReserveByUserId(userId);
  if (!reserve) {
    return { reserve: null, setupRequired: true };
  }
  const monthlyFixedExpensesInCents = await getMonthlyFixedExpenseTotal(userId);
  const recalculatedReserve = await recalculateReserve(reserve, monthlyFixedExpensesInCents);
  return { reserve: toReserveView(recalculatedReserve, monthlyFixedExpensesInCents), setupRequired: false };
}

export async function updateUserReserve(userId: string, input: unknown): Promise<{ reserve: ReserveView }> {
  const protectionMonths = validateProtectionMonths((input as { protectionMonths?: unknown })?.protectionMonths);
  const reserve = await getReserveOrThrow(userId);
  const monthlyFixedExpensesInCents = await getMonthlyFixedExpenseTotalOrThrow(userId);
  const updatedReserve = await updateReserve(reserve.id, protectionMonths);
  const recalculatedReserve = await recalculateReserve(updatedReserve, monthlyFixedExpensesInCents);
  return { reserve: toReserveView(recalculatedReserve, monthlyFixedExpensesInCents) };
}

async function moveUserReserve(
  userId: string,
  input: unknown,
  type: "DEPOSIT" | "WITHDRAWAL"
): Promise<{ reserve: ReserveView; transaction: PublicReserveTransaction }> {
  const reserve = await getReserveOrThrow(userId);
  const monthlyFixedExpensesInCents = await getMonthlyFixedExpenseTotalOrThrow(userId);
  const transactionInput = validateReserveTransactionInput(input);
  const targetAmountInCents = calculateReserveTarget({
    monthlyFixedExpensesInCents,
    protectionMonths: reserve.protectionMonths
  });
  calculateReserveTransaction({
    currentBalanceInCents: reserve.currentBalanceInCents,
    amountInCents: transactionInput.amountInCents,
    type
  });
  const result = await moveReserve(userId, reserve, transactionInput, type, targetAmountInCents);
  return {
    reserve: toReserveView(result.reserve, monthlyFixedExpensesInCents),
    transaction: toPublicReserveTransaction(result.transaction)
  };
}

export function depositToUserReserve(
  userId: string,
  input: unknown
): Promise<{ reserve: ReserveView; transaction: PublicReserveTransaction }> {
  return moveUserReserve(userId, input, "DEPOSIT");
}

export function withdrawFromUserReserve(
  userId: string,
  input: unknown
): Promise<{ reserve: ReserveView; transaction: PublicReserveTransaction }> {
  return moveUserReserve(userId, input, "WITHDRAWAL");
}

export async function listUserReserveTransactions(userId: string): Promise<{ transactions: PublicReserveTransaction[] }> {
  const reserve = await getReserveOrThrow(userId);
  const transactions = await listReserveTransactions(reserve.id);
  return { transactions: transactions.map(toPublicReserveTransaction) };
}
