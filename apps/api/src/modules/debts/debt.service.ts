import {
  debtAlreadyPaidError,
  debtNotFoundError,
  forbiddenError
} from "./debt.errors.js";
import {
  calculateDebtPayment,
  getCurrentMonthRange,
  getDebtStatusForCurrentMonth,
  validateDebtInput,
  validateDebtPaymentInput
} from "./debt-policy.js";
import {
  createDebt,
  deleteDebt,
  findDebtById,
  hasDebtPaymentInMonth,
  listDebtsByUser,
  payDebt,
  toPublicDebt,
  toPublicDebtPayment,
  updateDebt,
  updateDebtStatus
} from "./debt.repository.js";
import type { PublicVariableExpense } from "../expenses/expense.types.js";
import type { DebtOutput, DebtPaymentOutput } from "./debt.types.js";

type OwnedDebt = DebtOutput & { userId?: string };

async function recalculateDebtStatus(debt: OwnedDebt, today = new Date()): Promise<OwnedDebt> {
  const { startsAt, endsBefore } = getCurrentMonthRange(today);
  const hasPayment = await hasDebtPaymentInMonth(debt.id, startsAt, endsBefore);
  const nextStatus = getDebtStatusForCurrentMonth({
    currentStatus: debt.status,
    currentBalanceInCents: debt.currentBalanceInCents,
    monthlyDueDay: debt.monthlyDueDay,
    hasPaymentInCurrentMonth: hasPayment,
    today
  });

  if (nextStatus !== debt.status) {
    return updateDebtStatus(debt, nextStatus);
  }

  return debt;
}

async function getOwnedDebt(userId: string, debtId: string, today = new Date()): Promise<OwnedDebt> {
  const debt = await findDebtById(debtId);

  if (!debt) {
    throw debtNotFoundError();
  }

  if (debt.userId !== userId) {
    throw forbiddenError();
  }

  return recalculateDebtStatus(debt, today);
}

export async function createUserDebt(userId: string, input: unknown): Promise<{ debt: DebtOutput }> {
  const debtInput = validateDebtInput(input);
  const debt = await createDebt(userId, debtInput);

  return { debt: toPublicDebt(debt) };
}

export async function listUserDebts(userId: string, today = new Date()): Promise<{ debts: DebtOutput[] }> {
  const debts = await listDebtsByUser(userId);
  const recalculatedDebts = await Promise.all(debts.map((debt) => recalculateDebtStatus(debt, today)));

  return { debts: recalculatedDebts.map(toPublicDebt) };
}

export async function getUserDebt(userId: string, debtId: string, today = new Date()): Promise<{ debt: DebtOutput }> {
  const debt = await getOwnedDebt(userId, debtId, today);

  return { debt: toPublicDebt(debt) };
}

export async function updateUserDebt(
  userId: string,
  debtId: string,
  input: unknown
): Promise<{ debt: DebtOutput }> {
  await getOwnedDebt(userId, debtId);
  const debtInput = validateDebtInput(input);
  const debt = await updateDebt(debtId, debtInput);

  return { debt: toPublicDebt(debt) };
}

export async function deleteUserDebt(userId: string, debtId: string): Promise<{ message: string }> {
  await getOwnedDebt(userId, debtId);
  await deleteDebt(debtId);

  return { message: "Dívida removida com sucesso." };
}

export async function payUserDebt(
  userId: string,
  debtId: string,
  input: unknown,
  today = new Date()
): Promise<{ debt: DebtOutput; payment: DebtPaymentOutput; variableExpense: PublicVariableExpense }> {
  const debt = await getOwnedDebt(userId, debtId, today);

  if (debt.status === "PAID" || debt.currentBalanceInCents <= 0) {
    throw debtAlreadyPaidError();
  }

  const paymentInput = validateDebtPaymentInput(input);
  calculateDebtPayment({
    currentBalanceInCents: debt.currentBalanceInCents,
    amountInCents: paymentInput.amountInCents
  });

  const result = await payDebt(userId, debt, paymentInput);

  return {
    debt: toPublicDebt(result.debt),
    payment: toPublicDebtPayment(result.payment),
    variableExpense: result.variableExpense
  };
}
