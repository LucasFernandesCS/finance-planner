import {
  fixedExpenseNotFoundError,
  forbiddenError
} from "./expense.errors.js";
import {
  createFixedExpense,
  deleteFixedExpense,
  findFixedExpenseById,
  listFixedExpensesByUser,
  toPublicFixedExpense,
  updateFixedExpense
} from "./expense.repository.js";
import { validateExpenseInput } from "./expense.policy.js";
import type { PublicFixedExpense } from "./expense.types.js";

async function getOwnedFixedExpense(userId: string, fixedExpenseId: string) {
  const expense = await findFixedExpenseById(fixedExpenseId);

  if (!expense) {
    throw fixedExpenseNotFoundError();
  }

  if (expense.userId !== userId) {
    throw forbiddenError();
  }

  return expense;
}

export async function createUserFixedExpense(
  userId: string,
  input: unknown
): Promise<{ fixedExpense: PublicFixedExpense }> {
  const expenseInput = validateExpenseInput(input);
  const fixedExpense = await createFixedExpense(userId, expenseInput);

  return { fixedExpense: toPublicFixedExpense(fixedExpense) };
}

export async function listUserFixedExpenses(userId: string): Promise<{ fixedExpenses: PublicFixedExpense[] }> {
  const fixedExpenses = await listFixedExpensesByUser(userId);

  return { fixedExpenses: fixedExpenses.map(toPublicFixedExpense) };
}

export async function updateUserFixedExpense(
  userId: string,
  fixedExpenseId: string,
  input: unknown
): Promise<{ fixedExpense: PublicFixedExpense }> {
  await getOwnedFixedExpense(userId, fixedExpenseId);

  const expenseInput = validateExpenseInput(input);
  const fixedExpense = await updateFixedExpense(fixedExpenseId, expenseInput);

  return { fixedExpense: toPublicFixedExpense(fixedExpense) };
}

export async function deleteUserFixedExpense(
  userId: string,
  fixedExpenseId: string
): Promise<{ message: string }> {
  await getOwnedFixedExpense(userId, fixedExpenseId);
  await deleteFixedExpense(fixedExpenseId);

  return { message: "Despesa fixa removida com sucesso." };
}
