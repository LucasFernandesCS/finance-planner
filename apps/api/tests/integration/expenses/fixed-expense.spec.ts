import { randomUUID } from "node:crypto";

import request from "supertest";
import { describe, expect, it } from "vitest";

import { app } from "../../../src/app.js";
import { generateValidCpf } from "../auth/auth-test-helpers.js";

const validPassword = "Senha@123";

function fixedExpensePayload(overrides: Record<string, unknown> = {}) {
  return {
    title: "Condominio",
    amountInCents: 73000,
    category: "CONDOMINIUM",
    startMonth: "2026-06",
    description: "Condominio do apartamento",
    userId: "malicious-user-id",
    ...overrides
  };
}

async function registerAndLogin() {
  const email = `fixed-expense.${randomUUID()}@email.com`;

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

describe("fixed expense endpoints", () => {
  it("adds a fixed expense for the authenticated user", async () => {
    const token = await registerAndLogin();

    const response = await request(app)
      .post("/fixed-expenses")
      .set("Authorization", `Bearer ${token}`)
      .send(fixedExpensePayload());

    expect(response.status).toBe(201);
    expect(response.body.fixedExpense).toEqual({
      id: expect.any(String),
      title: "Condominio",
      amountInCents: 73000,
      category: "CONDOMINIUM",
      startMonth: "2026-06",
      description: "Condominio do apartamento"
    });
    expect(response.body.fixedExpense.userId).toBeUndefined();
  });

  it("rejects adding a fixed expense without authentication", async () => {
    const response = await request(app).post("/fixed-expenses").send(fixedExpensePayload());

    expect(response.status).toBe(401);
    expect(response.body.error.code).toBe("UNAUTHORIZED");
  });

  it("rejects editing another user's fixed expense", async () => {
    const ownerToken = await registerAndLogin();
    const intruderToken = await registerAndLogin();
    const created = await request(app)
      .post("/fixed-expenses")
      .set("Authorization", `Bearer ${ownerToken}`)
      .send(fixedExpensePayload())
      .expect(201);

    const response = await request(app)
      .patch(`/fixed-expenses/${created.body.fixedExpense.id}`)
      .set("Authorization", `Bearer ${intruderToken}`)
      .send(fixedExpensePayload({ title: "Tentativa" }));

    expect(response.status).toBe(403);
    expect(response.body.error.code).toBe("FORBIDDEN");
  });

  it("rejects deleting another user's fixed expense", async () => {
    const ownerToken = await registerAndLogin();
    const intruderToken = await registerAndLogin();
    const created = await request(app)
      .post("/fixed-expenses")
      .set("Authorization", `Bearer ${ownerToken}`)
      .send(fixedExpensePayload())
      .expect(201);

    const response = await request(app)
      .delete(`/fixed-expenses/${created.body.fixedExpense.id}`)
      .set("Authorization", `Bearer ${intruderToken}`);

    expect(response.status).toBe(403);
    expect(response.body.error.code).toBe("FORBIDDEN");
  });

  it("rejects adding a negative fixed expense", async () => {
    const token = await registerAndLogin();
    const response = await request(app)
      .post("/fixed-expenses")
      .set("Authorization", `Bearer ${token}`)
      .send(fixedExpensePayload({ amountInCents: -1 }));

    expect(response.status).toBe(400);
    expect(response.body.error.code).toBe("EXPENSE_AMOUNT_MUST_BE_POSITIVE");
  });

  it("rejects adding a zero fixed expense", async () => {
    const token = await registerAndLogin();
    const response = await request(app)
      .post("/fixed-expenses")
      .set("Authorization", `Bearer ${token}`)
      .send(fixedExpensePayload({ amountInCents: 0 }));

    expect(response.status).toBe(400);
    expect(response.body.error.code).toBe("EXPENSE_AMOUNT_MUST_BE_POSITIVE");
  });

  it("rejects adding a fixed expense without required fields", async () => {
    const token = await registerAndLogin();
    const response = await request(app).post("/fixed-expenses").set("Authorization", `Bearer ${token}`).send({});

    expect(response.status).toBe(400);
    expect(response.body.error.code).toBe("VALIDATION_ERROR");
  });

  it("rejects adding a fixed expense over the limit", async () => {
    const token = await registerAndLogin();
    const response = await request(app)
      .post("/fixed-expenses")
      .set("Authorization", `Bearer ${token}`)
      .send(fixedExpensePayload({ amountInCents: 100000000000 }));

    expect(response.status).toBe(400);
    expect(response.body.error.code).toBe("EXPENSE_AMOUNT_OVERFLOW");
  });

  it("rejects adding a fixed expense with a too long title", async () => {
    const token = await registerAndLogin();
    const response = await request(app)
      .post("/fixed-expenses")
      .set("Authorization", `Bearer ${token}`)
      .send(fixedExpensePayload({ title: "a".repeat(101) }));

    expect(response.status).toBe(400);
    expect(response.body.error.code).toBe("EXPENSE_TITLE_TOO_LONG");
  });

  it("lists only fixed expenses from the authenticated user", async () => {
    const token = await registerAndLogin();
    const otherToken = await registerAndLogin();

    await request(app)
      .post("/fixed-expenses")
      .set("Authorization", `Bearer ${token}`)
      .send(fixedExpensePayload({ title: "Condominio" }))
      .expect(201);
    await request(app)
      .post("/fixed-expenses")
      .set("Authorization", `Bearer ${otherToken}`)
      .send(fixedExpensePayload({ title: "Outro condominio" }))
      .expect(201);

    const response = await request(app).get("/fixed-expenses").set("Authorization", `Bearer ${token}`);

    expect(response.status).toBe(200);
    expect(response.body.fixedExpenses).toHaveLength(1);
    expect(response.body.fixedExpenses[0].title).toBe("Condominio");
  });

  it("updates an owned fixed expense", async () => {
    const token = await registerAndLogin();
    const created = await request(app)
      .post("/fixed-expenses")
      .set("Authorization", `Bearer ${token}`)
      .send(fixedExpensePayload())
      .expect(201);

    const response = await request(app)
      .patch(`/fixed-expenses/${created.body.fixedExpense.id}`)
      .set("Authorization", `Bearer ${token}`)
      .send(fixedExpensePayload({ title: "Condominio atualizado", amountInCents: 80000 }));

    expect(response.status).toBe(200);
    expect(response.body.fixedExpense.title).toBe("Condominio atualizado");
    expect(response.body.fixedExpense.amountInCents).toBe(80000);
  });

  it("deletes an owned fixed expense", async () => {
    const token = await registerAndLogin();
    const created = await request(app)
      .post("/fixed-expenses")
      .set("Authorization", `Bearer ${token}`)
      .send(fixedExpensePayload())
      .expect(201);

    const response = await request(app)
      .delete(`/fixed-expenses/${created.body.fixedExpense.id}`)
      .set("Authorization", `Bearer ${token}`);

    expect(response.status).toBe(200);
    expect(response.body.message).toBe("Despesa fixa removida com sucesso.");
  });
});
