import { beforeEach, describe, expect, it, vi } from "vitest";

import { EXPENSE_ERROR_CODES } from "../../../src/modules/expenses/expense.errors.js";
import type { VariableExpense } from "../../../src/modules/expenses/expense.types.js";
import {
  createUserVariableExpense,
  deleteUserVariableExpense,
  listUserVariableExpenses,
  updateUserVariableExpense
} from "../../../src/modules/expenses/variable-expense.service.js";

vi.mock("../../../src/modules/expenses/expense.repository.js", () => ({
  createVariableExpense: vi.fn(async (_userId: string, input: object) => ({
    ...variableExpense,
    ...input
  })),
  deleteVariableExpense: vi.fn(),
  findVariableExpenseById: vi.fn(async () => variableExpense),
  listVariableExpensesByUserAndMonth: vi.fn(async () => [variableExpense]),
  toPublicVariableExpense: vi.fn((expense: VariableExpense) => {
    const { userId: _userId, ...publicExpense } = expense;
    return publicExpense;
  }),
  updateVariableExpense: vi.fn(async (_id: string, input: object) => ({
    ...variableExpense,
    ...input
  }))
}));

const variableExpense: VariableExpense = {
  id: "variable-expense-id",
  userId: "user-id",
  title: "Mercado",
  amountInCents: 32000,
  category: "GROCERIES",
  referenceMonth: "2026-06",
  description: "Compra do mes"
};

const validInput = {
  title: "Mercado",
  amountInCents: 32000,
  category: "GROCERIES",
  month: "2026-06",
  description: "Compra do mes"
};

describe("VariableExpenseService", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("creates a variable expense for the authenticated user", async () => {
    await expect(createUserVariableExpense("user-id", validInput)).resolves.toEqual({
      variableExpense: expect.objectContaining({ title: "Mercado" })
    });
  });

  it("lists variable expenses from the authenticated user by month", async () => {
    await expect(listUserVariableExpenses("user-id", "2026-06")).resolves.toEqual({
      variableExpenses: [expect.objectContaining({ id: variableExpense.id })]
    });
  });

  it("updates an owned variable expense", async () => {
    await expect(
      updateUserVariableExpense("user-id", variableExpense.id, { ...validInput, title: "Farmacia" })
    ).resolves.toEqual({
      variableExpense: expect.objectContaining({ title: "Farmacia" })
    });
  });

  it("deletes an owned variable expense", async () => {
    await expect(deleteUserVariableExpense("user-id", variableExpense.id)).resolves.toEqual({
      message: "Despesa variável removida com sucesso."
    });
  });

  it("rejects updating another user's variable expense", async () => {
    await expect(updateUserVariableExpense("another-user", variableExpense.id, validInput)).rejects.toMatchObject({
      code: EXPENSE_ERROR_CODES.forbidden
    });
  });

  it("rejects deleting another user's variable expense", async () => {
    await expect(deleteUserVariableExpense("another-user", variableExpense.id)).rejects.toMatchObject({
      code: EXPENSE_ERROR_CODES.forbidden
    });
  });

  it("rejects a missing variable expense", async () => {
    const repository = await import("../../../src/modules/expenses/expense.repository.js");
    vi.mocked(repository.findVariableExpenseById).mockResolvedValueOnce(null);

    await expect(updateUserVariableExpense("user-id", variableExpense.id, validInput)).rejects.toMatchObject({
      code: EXPENSE_ERROR_CODES.variableExpenseNotFound
    });
  });
});
