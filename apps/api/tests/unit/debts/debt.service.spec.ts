import { beforeEach, describe, expect, it, vi } from "vitest";

import { DEBT_ERROR_CODES } from "../../../src/modules/debts/debt.errors.js";
import type { DebtOutput, DebtPaymentOutput } from "../../../src/modules/debts/debt.types.js";
import {
  createUserDebt,
  deleteUserDebt,
  getUserDebt,
  listUserDebts,
  payUserDebt,
  updateUserDebt
} from "../../../src/modules/debts/debt.service.js";

vi.mock("../../../src/modules/debts/debt.repository.js", () => ({
  createDebt: vi.fn(async (_userId: string, input: object) => ({
    ...debt,
    ...input,
    currentBalanceInCents: 200000,
    status: "IN_PROGRESS"
  })),
  deleteDebt: vi.fn(),
  findDebtById: vi.fn(async () => debt),
  hasDebtPaymentInMonth: vi.fn(async () => false),
  listDebtsByUser: vi.fn(async () => [debt]),
  payDebt: vi.fn(async (_userId: string, inputDebt: DebtOutput, input: { amountInCents: number; note?: string }) => {
    const currentBalanceInCents = inputDebt.currentBalanceInCents - input.amountInCents;
    return {
      debt: {
        ...inputDebt,
        currentBalanceInCents,
        status: currentBalanceInCents === 0 ? "PAID" : "IN_PROGRESS"
      },
      payment: {
        ...payment,
        amountInCents: input.amountInCents,
        note: input.note ?? null
      },
      variableExpense: {
        id: "variable-expense-id",
        title: `Pagamento de dívida: ${inputDebt.title}`,
        amountInCents: input.amountInCents,
        category: "DEBT_PAYMENT",
        referenceMonth: "2026-06",
        description: input.note ?? inputDebt.description
      }
    };
  }),
  toPublicDebt: vi.fn((input: DebtOutput) => {
    const { ...publicDebt } = input;
    return publicDebt;
  }),
  toPublicDebtPayment: vi.fn((input: DebtPaymentOutput) => input),
  updateDebt: vi.fn(async (_id: string, input: object) => ({
    ...debt,
    ...input
  })),
  updateDebtStatus: vi.fn(async (inputDebt: DebtOutput, status: DebtOutput["status"]) => ({ ...inputDebt, status }))
}));

const debt: DebtOutput & { userId: string } = {
  id: "debt-id",
  userId: "user-id",
  title: "Financiamento do carro",
  creditor: "Banco",
  type: "FINANCING",
  originalAmountInCents: 200000,
  currentBalanceInCents: 200000,
  installmentAmountInCents: 50000,
  monthlyDueDay: 10,
  status: "IN_PROGRESS",
  description: "Contrato 123"
};

const payment: DebtPaymentOutput = {
  id: "payment-id",
  debtId: debt.id,
  amountInCents: 50000,
  paidAt: "2026-06-29",
  note: null
};

const validDebtInput = {
  title: "Financiamento do carro",
  creditor: "Banco",
  type: "FINANCING",
  originalAmountInCents: 200000,
  installmentAmountInCents: 50000,
  monthlyDueDay: 10,
  description: "Contrato 123"
};

describe("DebtService", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("creates a debt for the authenticated user", async () => {
    await expect(createUserDebt("user-id", validDebtInput)).resolves.toEqual({
      debt: expect.objectContaining({ title: "Financiamento do carro", currentBalanceInCents: 200000 })
    });
  });

  it("lists only debts from the authenticated user", async () => {
    await expect(listUserDebts("user-id")).resolves.toEqual({
      debts: [expect.objectContaining({ id: debt.id })]
    });
  });

  it("gets an owned debt", async () => {
    await expect(getUserDebt("user-id", debt.id)).resolves.toEqual({
      debt: expect.objectContaining({ id: debt.id })
    });
  });

  it("updates an owned debt", async () => {
    await expect(updateUserDebt("user-id", debt.id, { ...validDebtInput, title: "Banco atualizado" })).resolves.toEqual({
      debt: expect.objectContaining({ title: "Banco atualizado" })
    });
  });

  it("deletes an owned debt", async () => {
    await expect(deleteUserDebt("user-id", debt.id)).resolves.toEqual({
      message: "Dívida removida com sucesso."
    });
  });

  it("rejects updating another user's debt", async () => {
    await expect(updateUserDebt("other-user", debt.id, validDebtInput)).rejects.toMatchObject({
      code: DEBT_ERROR_CODES.forbidden
    });
  });

  it("rejects deleting another user's debt", async () => {
    await expect(deleteUserDebt("other-user", debt.id)).rejects.toMatchObject({
      code: DEBT_ERROR_CODES.forbidden
    });
  });

  it("registers a payment in an owned debt", async () => {
    await expect(payUserDebt("user-id", debt.id, { amountInCents: 50000 })).resolves.toEqual({
      debt: expect.objectContaining({ currentBalanceInCents: 150000 }),
      payment: expect.objectContaining({ amountInCents: 50000 }),
      variableExpense: expect.objectContaining({ category: "DEBT_PAYMENT" })
    });
  });

  it("reduces the current balance after payment", async () => {
    const result = await payUserDebt("user-id", debt.id, { amountInCents: 50000 });

    expect(result.debt.currentBalanceInCents).toBe(150000);
  });

  it("creates a payment history entry", async () => {
    const result = await payUserDebt("user-id", debt.id, { amountInCents: 50000, note: "Parcela" });

    expect(result.payment).toEqual(expect.objectContaining({ debtId: debt.id, note: "Parcela" }));
  });

  it("creates a reflective variable expense", async () => {
    const result = await payUserDebt("user-id", debt.id, { amountInCents: 50000 });

    expect(result.variableExpense).toEqual(
      expect.objectContaining({
        title: "Pagamento de dívida: Financiamento do carro",
        amountInCents: 50000,
        category: "DEBT_PAYMENT"
      })
    );
  });

  it("updates status to PAID when payment clears the balance", async () => {
    const repository = await import("../../../src/modules/debts/debt.repository.js");
    vi.mocked(repository.findDebtById).mockResolvedValueOnce({ ...debt, currentBalanceInCents: 50000 });

    const result = await payUserDebt("user-id", debt.id, { amountInCents: 50000 });

    expect(result.debt.status).toBe("PAID");
  });

  it("updates status to OVERDUE during lazy recalculation", async () => {
    const result = await getUserDebt("user-id", debt.id, new Date("2026-06-29T00:00:00.000Z"));

    expect(result.debt.status).toBe("OVERDUE");
  });

  it("rejects a payment greater than current balance", async () => {
    await expect(payUserDebt("user-id", debt.id, { amountInCents: 250000 })).rejects.toMatchObject({
      code: DEBT_ERROR_CODES.paymentExceedsBalance
    });
  });

  it("rejects payment in another user's debt", async () => {
    await expect(payUserDebt("other-user", debt.id, { amountInCents: 50000 })).rejects.toMatchObject({
      code: DEBT_ERROR_CODES.forbidden
    });
  });

  it("rejects payment in a paid debt", async () => {
    const repository = await import("../../../src/modules/debts/debt.repository.js");
    vi.mocked(repository.findDebtById).mockResolvedValueOnce({ ...debt, status: "PAID", currentBalanceInCents: 0 });

    await expect(payUserDebt("user-id", debt.id, { amountInCents: 50000 })).rejects.toMatchObject({
      code: DEBT_ERROR_CODES.debtAlreadyPaid
    });
  });
});
