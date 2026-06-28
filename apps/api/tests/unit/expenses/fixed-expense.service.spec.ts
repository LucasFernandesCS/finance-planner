import { beforeEach, describe, expect, it, vi } from "vitest";

import { EXPENSE_ERROR_CODES } from "../../../src/modules/expenses/expense.errors.js";
import type { FixedExpense } from "../../../src/modules/expenses/expense.types.js";
import {
  createUserFixedExpense,
  deleteUserFixedExpense,
  listUserFixedExpenses,
  updateUserFixedExpense
} from "../../../src/modules/expenses/fixed-expense.service.js";

vi.mock("../../../src/modules/expenses/expense.repository.js", () => ({
  createFixedExpense: vi.fn(async (_userId: string, input: object) => ({ ...fixedExpense, ...input })),
  deleteFixedExpense: vi.fn(),
  findFixedExpenseById: vi.fn(async () => fixedExpense),
  listFixedExpensesByUser: vi.fn(async () => [fixedExpense]),
  toPublicFixedExpense: vi.fn((expense: FixedExpense) => {
    const { userId: _userId, ...publicExpense } = expense;
    return publicExpense;
  }),
  updateFixedExpense: vi.fn(async (_id: string, input: object) => ({ ...fixedExpense, ...input }))
}));

const fixedExpense: FixedExpense = {
  id: "fixed-expense-id",
  userId: "user-id",
  title: "Aluguel",
  amountInCents: 85000,
  category: "RENT",
  startMonth: "2026-06",
  description: "Apartamento"
};

const validInput = {
  title: "Aluguel",
  amountInCents: 85000,
  category: "RENT",
  month: "2026-06",
  description: "Apartamento"
};

describe("FixedExpenseService", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("creates a fixed expense for the authenticated user", async () => {
    await expect(createUserFixedExpense("user-id", validInput)).resolves.toEqual({
      fixedExpense: expect.objectContaining({ title: "Aluguel" })
    });
  });

  it("lists fixed expenses from the authenticated user", async () => {
    await expect(listUserFixedExpenses("user-id")).resolves.toEqual({
      fixedExpenses: [expect.objectContaining({ id: fixedExpense.id })]
    });
  });

  it("updates an owned fixed expense", async () => {
    await expect(
      updateUserFixedExpense("user-id", fixedExpense.id, { ...validInput, title: "Condominio" })
    ).resolves.toEqual({
      fixedExpense: expect.objectContaining({ title: "Condominio" })
    });
  });

  it("deletes an owned fixed expense", async () => {
    await expect(deleteUserFixedExpense("user-id", fixedExpense.id)).resolves.toEqual({
      message: "Despesa fixa removida com sucesso."
    });
  });

  it("rejects updating another user's fixed expense", async () => {
    await expect(updateUserFixedExpense("another-user", fixedExpense.id, validInput)).rejects.toMatchObject({
      code: EXPENSE_ERROR_CODES.forbidden
    });
  });

  it("rejects deleting another user's fixed expense", async () => {
    await expect(deleteUserFixedExpense("another-user", fixedExpense.id)).rejects.toMatchObject({
      code: EXPENSE_ERROR_CODES.forbidden
    });
  });

  it("rejects a missing fixed expense", async () => {
    const repository = await import("../../../src/modules/expenses/expense.repository.js");
    vi.mocked(repository.findFixedExpenseById).mockResolvedValueOnce(null);

    await expect(updateUserFixedExpense("user-id", fixedExpense.id, validInput)).rejects.toMatchObject({
      code: EXPENSE_ERROR_CODES.fixedExpenseNotFound
    });
  });
});
