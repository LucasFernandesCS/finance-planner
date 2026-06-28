import { forbiddenError, incomeNotFoundError } from "./income.errors.js";
import {
  createIncome,
  deleteIncome,
  findIncomeById,
  listIncomesByUserAndMonth,
  toPublicIncome,
  updateIncome
} from "./income.repository.js";
import { validateIncomeInput } from "./income.policy.js";
import type { IncomeInput, PublicIncome } from "./income.types.js";

async function getOwnedIncome(userId: string, incomeId: string) {
  const income = await findIncomeById(incomeId);

  if (!income) {
    throw incomeNotFoundError();
  }

  if (income.userId !== userId) {
    throw forbiddenError();
  }

  return income;
}

export async function createUserIncome(
  userId: string,
  input: unknown
): Promise<{ income: PublicIncome }> {
  const incomeInput = validateIncomeInput(input);
  const income = await createIncome(userId, incomeInput);

  return { income: toPublicIncome(income) };
}

export async function listUserIncomes(
  userId: string,
  referenceMonth: string
): Promise<{ incomes: PublicIncome[] }> {
  const incomes = await listIncomesByUserAndMonth(userId, referenceMonth);

  return { incomes: incomes.map(toPublicIncome) };
}

export async function updateUserIncome(
  userId: string,
  incomeId: string,
  input: unknown
): Promise<{ income: PublicIncome }> {
  await getOwnedIncome(userId, incomeId);

  const incomeInput: IncomeInput = validateIncomeInput(input);
  const income = await updateIncome(incomeId, incomeInput);

  return { income: toPublicIncome(income) };
}

export async function deleteUserIncome(userId: string, incomeId: string): Promise<{ message: string }> {
  await getOwnedIncome(userId, incomeId);
  await deleteIncome(incomeId);

  return { message: "Renda removida com sucesso." };
}
