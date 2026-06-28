import {
  forbiddenError,
  variableExpenseNotFoundError
} from "./expense.errors.js";
import { parseMonth } from "./expense.schemas.js";
import {
  createVariableExpense,
  deleteVariableExpense,
  findVariableExpenseById,
  listVariableExpensesByUserAndMonth,
  toPublicVariableExpense,
  updateVariableExpense
} from "./expense.repository.js";
import { validateExpenseInput } from "./expense.policy.js";
import type { PublicVariableExpense } from "./expense.types.js";

async function getOwnedVariableExpense(userId: string, variableExpenseId: string) {
  const expense = await findVariableExpenseById(variableExpenseId);

  if (!expense) {
    throw variableExpenseNotFoundError();
  }

  if (expense.userId !== userId) {
    throw forbiddenError();
  }

  return expense;
}

export async function createUserVariableExpense(
  userId: string,
  input: unknown
): Promise<{ variableExpense: PublicVariableExpense }> {
  const expenseInput = validateExpenseInput(input);
  const variableExpense = await createVariableExpense(userId, expenseInput);

  return { variableExpense: toPublicVariableExpense(variableExpense) };
}

export async function listUserVariableExpenses(
  userId: string,
  referenceMonth: string
): Promise<{ variableExpenses: PublicVariableExpense[] }> {
  const variableExpenses = await listVariableExpensesByUserAndMonth(userId, parseMonth(referenceMonth));

  return { variableExpenses: variableExpenses.map(toPublicVariableExpense) };
}

export async function updateUserVariableExpense(
  userId: string,
  variableExpenseId: string,
  input: unknown
): Promise<{ variableExpense: PublicVariableExpense }> {
  await getOwnedVariableExpense(userId, variableExpenseId);

  const expenseInput = validateExpenseInput(input);
  const variableExpense = await updateVariableExpense(variableExpenseId, expenseInput);

  return { variableExpense: toPublicVariableExpense(variableExpense) };
}

export async function deleteUserVariableExpense(
  userId: string,
  variableExpenseId: string
): Promise<{ message: string }> {
  await getOwnedVariableExpense(userId, variableExpenseId);
  await deleteVariableExpense(variableExpenseId);

  return { message: "Despesa variável removida com sucesso." };
}
