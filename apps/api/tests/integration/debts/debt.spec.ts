import { randomUUID } from "node:crypto";

import request from "supertest";
import { describe, expect, it } from "vitest";

import { app } from "../../../src/app.js";
import { generateValidCpf } from "../auth/auth-test-helpers.js";

const validPassword = "Senha@123";

function debtPayload(overrides: Record<string, unknown> = {}) {
  return {
    title: "Financiamento do carro",
    creditor: "Banco",
    type: "FINANCING",
    originalAmountInCents: 200000,
    installmentAmountInCents: 50000,
    monthlyDueDay: 10,
    description: "Contrato 123",
    userId: "malicious-user-id",
    ...overrides
  };
}

async function registerAndLogin() {
  const email = `debt.${randomUUID()}@email.com`;

  await request(app)
    .post("/auth/register")
    .send({
      firstName: "Lucas",
      lastName: "Fernandes",
      email,
      password: validPassword,
      cpf: generateValidCpf()
    })
    .expect(201);

  const loginResponse = await request(app)
    .post("/auth/login")
    .send({ email, password: validPassword })
    .expect(200);

  return loginResponse.body.accessToken as string;
}

async function createDebt(token: string, overrides: Record<string, unknown> = {}) {
  const response = await request(app)
    .post("/debts")
    .set("Authorization", `Bearer ${token}`)
    .send(debtPayload(overrides))
    .expect(201);

  return response.body.debt;
}

describe("debt endpoints", () => {
  it("creates a debt successfully", async () => {
    const token = await registerAndLogin();

    const response = await request(app).post("/debts").set("Authorization", `Bearer ${token}`).send(debtPayload());

    expect(response.status).toBe(201);
    expect(response.body.debt).toEqual(
      expect.objectContaining({
        id: expect.any(String),
        title: "Financiamento do carro",
        creditor: "Banco",
        type: "FINANCING",
        originalAmountInCents: 200000,
        currentBalanceInCents: 200000,
        installmentAmountInCents: 50000,
        monthlyDueDay: 10,
        status: "IN_PROGRESS",
        description: "Contrato 123"
      })
    );
    expect(response.body.debt.userId).toBeUndefined();
  });

  it("rejects creating debt without authentication", async () => {
    const response = await request(app).post("/debts").send(debtPayload());

    expect(response.status).toBe(401);
    expect(response.body.error.code).toBe("UNAUTHORIZED");
  });

  it("rejects invalid debt creation input", async () => {
    const token = await registerAndLogin();

    const negative = await request(app)
      .post("/debts")
      .set("Authorization", `Bearer ${token}`)
      .send(debtPayload({ originalAmountInCents: -1 }));
    const zero = await request(app)
      .post("/debts")
      .set("Authorization", `Bearer ${token}`)
      .send(debtPayload({ originalAmountInCents: 0 }));
    const missing = await request(app).post("/debts").set("Authorization", `Bearer ${token}`).send({});
    const overflow = await request(app)
      .post("/debts")
      .set("Authorization", `Bearer ${token}`)
      .send(debtPayload({ originalAmountInCents: 100000000000 }));
    const longTitle = await request(app)
      .post("/debts")
      .set("Authorization", `Bearer ${token}`)
      .send(debtPayload({ title: "a".repeat(101) }));

    expect(negative.status).toBe(400);
    expect(negative.body.error.code).toBe("DEBT_AMOUNT_MUST_BE_POSITIVE");
    expect(zero.body.error.code).toBe("DEBT_AMOUNT_MUST_BE_POSITIVE");
    expect(missing.body.error.code).toBe("VALIDATION_ERROR");
    expect(overflow.body.error.code).toBe("DEBT_AMOUNT_OVERFLOW");
    expect(longTitle.body.error.code).toBe("DEBT_TITLE_TOO_LONG");
  });

  it("lists only debts from the authenticated user", async () => {
    const token = await registerAndLogin();
    const otherToken = await registerAndLogin();
    await createDebt(token);
    await createDebt(otherToken, { title: "Outra dívida" });

    const response = await request(app).get("/debts").set("Authorization", `Bearer ${token}`);

    expect(response.status).toBe(200);
    expect(response.body.debts).toHaveLength(1);
    expect(response.body.debts[0].title).toBe("Financiamento do carro");
  });

  it("gets, updates and deletes an owned debt", async () => {
    const token = await registerAndLogin();
    const created = await createDebt(token);

    const detail = await request(app).get(`/debts/${created.id}`).set("Authorization", `Bearer ${token}`);
    const updated = await request(app)
      .patch(`/debts/${created.id}`)
      .set("Authorization", `Bearer ${token}`)
      .send(debtPayload({ title: "Dívida atualizada", creditor: "Banco 2" }));
    const removed = await request(app).delete(`/debts/${created.id}`).set("Authorization", `Bearer ${token}`);

    expect(detail.status).toBe(200);
    expect(detail.body.debt.id).toBe(created.id);
    expect(updated.status).toBe(200);
    expect(updated.body.debt.title).toBe("Dívida atualizada");
    expect(removed.status).toBe(200);
    expect(removed.body.message).toBe("Dívida removida com sucesso.");
  });

  it("rejects updating and deleting another user's debt", async () => {
    const token = await registerAndLogin();
    const otherToken = await registerAndLogin();
    const otherDebt = await createDebt(otherToken);

    const updateResponse = await request(app)
      .patch(`/debts/${otherDebt.id}`)
      .set("Authorization", `Bearer ${token}`)
      .send(debtPayload({ title: "Tentativa" }));
    const deleteResponse = await request(app).delete(`/debts/${otherDebt.id}`).set("Authorization", `Bearer ${token}`);

    expect(updateResponse.status).toBe(403);
    expect(updateResponse.body.error.code).toBe("FORBIDDEN");
    expect(deleteResponse.status).toBe(403);
    expect(deleteResponse.body.error.code).toBe("FORBIDDEN");
  });

  it("registers a payment, reduces balance, creates history and reflective variable expense", async () => {
    const token = await registerAndLogin();
    const created = await createDebt(token);

    const response = await request(app)
      .post(`/debts/${created.id}/payments`)
      .set("Authorization", `Bearer ${token}`)
      .send({ amountInCents: 50000, note: "Parcela" });
    const expenses = await request(app)
      .get("/variable-expenses")
      .query({ month: new Date().toISOString().slice(0, 7) })
      .set("Authorization", `Bearer ${token}`);

    expect(response.status).toBe(201);
    expect(response.body.debt.currentBalanceInCents).toBe(150000);
    expect(response.body.payment).toEqual(
      expect.objectContaining({ debtId: created.id, amountInCents: 50000, note: "Parcela" })
    );
    expect(response.body.variableExpense).toEqual(
      expect.objectContaining({
        title: "Pagamento de dívida: Financiamento do carro",
        amountInCents: 50000,
        category: "DEBT_PAYMENT"
      })
    );
    expect(expenses.body.variableExpenses).toEqual(
      expect.arrayContaining([
        expect.objectContaining({
          amountInCents: 50000,
          category: "DEBT_PAYMENT"
        })
      ])
    );
  });

  it("rejects invalid payments and payments in another user's debt", async () => {
    const token = await registerAndLogin();
    const otherToken = await registerAndLogin();
    const created = await createDebt(token, { originalAmountInCents: 50000 });
    const otherDebt = await createDebt(otherToken);

    const tooHigh = await request(app)
      .post(`/debts/${created.id}/payments`)
      .set("Authorization", `Bearer ${token}`)
      .send({ amountInCents: 60000 });
    const forbidden = await request(app)
      .post(`/debts/${otherDebt.id}/payments`)
      .set("Authorization", `Bearer ${token}`)
      .send({ amountInCents: 50000 });

    expect(tooHigh.status).toBe(400);
    expect(tooHigh.body.error.code).toBe("DEBT_PAYMENT_EXCEEDS_BALANCE");
    expect(forbidden.status).toBe(403);
    expect(forbidden.body.error.code).toBe("FORBIDDEN");
  });

  it("updates status to PAID and OVERDUE automatically", async () => {
    const token = await registerAndLogin();
    const payable = await createDebt(token, { originalAmountInCents: 50000, installmentAmountInCents: null });
    const overdue = await createDebt(token, { title: "Dívida vencida", monthlyDueDay: 1 });

    const paid = await request(app)
      .post(`/debts/${payable.id}/payments`)
      .set("Authorization", `Bearer ${token}`)
      .send({ amountInCents: 50000 });
    const overdueDetail = await request(app).get(`/debts/${overdue.id}`).set("Authorization", `Bearer ${token}`);

    expect(paid.status).toBe(201);
    expect(paid.body.debt.status).toBe("PAID");
    expect(overdueDetail.status).toBe(200);
    expect(overdueDetail.body.debt.status).toBe("OVERDUE");
  });
});
