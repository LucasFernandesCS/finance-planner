import { beforeEach, describe, expect, it, vi } from "vitest";

import { INCOME_ERROR_CODES } from "../../../src/modules/incomes/income.errors.js";
import type { IncomeInput } from "../../../src/modules/incomes/income.types.js";

vi.mock("../../../src/modules/incomes/income.repository.js", () => ({
  createIncome: vi.fn(),
  deleteIncome: vi.fn(),
  findIncomeById: vi.fn(),
  listIncomesByUserAndMonth: vi.fn(),
  toPublicIncome: vi.fn((income: { userId: string }) => {
    const { userId: _userId, ...publicIncome } = income;
    return publicIncome;
  }),
  updateIncome: vi.fn()
}));

import {
  createIncome,
  deleteIncome,
  findIncomeById,
  listIncomesByUserAndMonth,
  updateIncome
} from "../../../src/modules/incomes/income.repository.js";
import {
  createUserIncome,
  deleteUserIncome,
  listUserIncomes,
  updateUserIncome
} from "../../../src/modules/incomes/income.service.js";

const input: IncomeInput = {
  title: "Salario",
  amountInCents: 212000,
  type: "MONTHLY",
  referenceMonth: "2026-06",
  description: "Salario atual"
};

const income = {
  id: "income-id",
  userId: "user-id",
  ...input
};

const publicIncome = {
  id: "income-id",
  ...input
};

describe("IncomeService", () => {
  beforeEach(() => {
    vi.clearAllMocks();

    vi.mocked(createIncome).mockResolvedValue(income);
    vi.mocked(listIncomesByUserAndMonth).mockResolvedValue([income]);
    vi.mocked(findIncomeById).mockResolvedValue(income);
    vi.mocked(updateIncome).mockResolvedValue({ ...income, title: "Salario atualizado" });
    vi.mocked(deleteIncome).mockResolvedValue(undefined);
  });

  it("creates an income for the authenticated user", async () => {
    await expect(createUserIncome("user-id", input)).resolves.toEqual({ income: publicIncome });

    expect(createIncome).toHaveBeenCalledWith("user-id", input);
  });

  it("lists incomes for the authenticated user", async () => {
    await expect(listUserIncomes("user-id", "2026-06")).resolves.toEqual({ incomes: [publicIncome] });

    expect(listIncomesByUserAndMonth).toHaveBeenCalledWith("user-id", "2026-06");
  });

  it("updates an owned income", async () => {
    await expect(updateUserIncome("user-id", "income-id", { ...input, title: "Salario atualizado" })).resolves.toEqual({
      income: { ...publicIncome, title: "Salario atualizado" }
    });

    expect(updateIncome).toHaveBeenCalledWith("income-id", { ...input, title: "Salario atualizado" });
  });

  it("deletes an owned income", async () => {
    await expect(deleteUserIncome("user-id", "income-id")).resolves.toEqual({
      message: "Renda removida com sucesso."
    });

    expect(deleteIncome).toHaveBeenCalledWith("income-id");
  });

  it("rejects updating another user's income", async () => {
    vi.mocked(findIncomeById).mockResolvedValue({ ...income, userId: "other-user-id" });

    await expect(updateUserIncome("user-id", "income-id", input)).rejects.toMatchObject({
      code: INCOME_ERROR_CODES.forbidden,
      statusCode: 403
    });
  });

  it("rejects deleting another user's income", async () => {
    vi.mocked(findIncomeById).mockResolvedValue({ ...income, userId: "other-user-id" });

    await expect(deleteUserIncome("user-id", "income-id")).rejects.toMatchObject({
      code: INCOME_ERROR_CODES.forbidden,
      statusCode: 403
    });
  });

  it("rejects a missing income", async () => {
    vi.mocked(findIncomeById).mockResolvedValue(null);

    await expect(updateUserIncome("user-id", "missing-income-id", input)).rejects.toMatchObject({
      code: INCOME_ERROR_CODES.incomeNotFound,
      statusCode: 404
    });
  });

  it("rejects invalid income values", async () => {
    await expect(createUserIncome("user-id", { ...input, amountInCents: 0 })).rejects.toMatchObject({
      code: INCOME_ERROR_CODES.amountMustBePositive,
      statusCode: 400
    });
  });
});
