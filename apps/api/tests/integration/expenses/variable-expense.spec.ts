import { randomUUID } from "node:crypto";

import request from "supertest";
import { describe, expect, it } from "vitest";

import { app } from "../../../src/app.js";
import { generateValidCpf } from "../auth/auth-test-helpers.js";

const validPassword = "Senha@123";

function variableExpensePayload(overrides: Record<string, unknown> = {}) {
  return {
    title: "iFood",
    amountInCents: 4500,
    category: "FOOD",
    referenceMonth: "2026-06",
    description: "Pedido de comida",
    userId: "malicious-user-id",
    ...overrides
  };
}

async function registerAndLogin() {
  const email = `variable-expense.${randomUUID()}@email.com`;

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

describe("variable expense endpoints", () => {
  it("adds a variable expense for the authenticated user", async () => {
    const token = await registerAndLogin();

    const response = await request(app)
      .post("/variable-expenses")
      .set("Authorization", `Bearer ${token}`)
      .send(variableExpensePayload());

    expect(response.status).toBe(201);
    expect(response.body.variableExpense).toEqual({
      id: expect.any(String),
      title: "iFood",
      amountInCents: 4500,
      category: "FOOD",
      referenceMonth: "2026-06",
      description: "Pedido de comida"
    });
    expect(response.body.variableExpense.userId).toBeUndefined();
  });

  it("rejects adding a variable expense without authentication", async () => {
    const response = await request(app).post("/variable-expenses").send(variableExpensePayload());

    expect(response.status).toBe(401);
    expect(response.body.error.code).toBe("UNAUTHORIZED");
  });

  it("rejects editing another user's variable expense", async () => {
    const ownerToken = await registerAndLogin();
    const intruderToken = await registerAndLogin();
    const created = await request(app)
      .post("/variable-expenses")
      .set("Authorization", `Bearer ${ownerToken}`)
      .send(variableExpensePayload())
      .expect(201);

    const response = await request(app)
      .patch(`/variable-expenses/${created.body.variableExpense.id}`)
      .set("Authorization", `Bearer ${intruderToken}`)
      .send(variableExpensePayload({ title: "Tentativa" }));

    expect(response.status).toBe(403);
    expect(response.body.error.code).toBe("FORBIDDEN");
  });

  it("rejects deleting another user's variable expense", async () => {
    const ownerToken = await registerAndLogin();
    const intruderToken = await registerAndLogin();
    const created = await request(app)
      .post("/variable-expenses")
      .set("Authorization", `Bearer ${ownerToken}`)
      .send(variableExpensePayload())
      .expect(201);

    const response = await request(app)
      .delete(`/variable-expenses/${created.body.variableExpense.id}`)
      .set("Authorization", `Bearer ${intruderToken}`);

    expect(response.status).toBe(403);
    expect(response.body.error.code).toBe("FORBIDDEN");
  });

  it("rejects adding a negative variable expense", async () => {
    const token = await registerAndLogin();
    const response = await request(app)
      .post("/variable-expenses")
      .set("Authorization", `Bearer ${token}`)
      .send(variableExpensePayload({ amountInCents: -1 }));

    expect(response.status).toBe(400);
    expect(response.body.error.code).toBe("EXPENSE_AMOUNT_MUST_BE_POSITIVE");
  });

  it("rejects adding a zero variable expense", async () => {
    const token = await registerAndLogin();
    const response = await request(app)
      .post("/variable-expenses")
      .set("Authorization", `Bearer ${token}`)
      .send(variableExpensePayload({ amountInCents: 0 }));

    expect(response.status).toBe(400);
    expect(response.body.error.code).toBe("EXPENSE_AMOUNT_MUST_BE_POSITIVE");
  });

  it("rejects adding a variable expense without required fields", async () => {
    const token = await registerAndLogin();
    const response = await request(app).post("/variable-expenses").set("Authorization", `Bearer ${token}`).send({});

    expect(response.status).toBe(400);
    expect(response.body.error.code).toBe("VALIDATION_ERROR");
  });

  it("rejects adding a variable expense over the limit", async () => {
    const token = await registerAndLogin();
    const response = await request(app)
      .post("/variable-expenses")
      .set("Authorization", `Bearer ${token}`)
      .send(variableExpensePayload({ amountInCents: 100000000000 }));

    expect(response.status).toBe(400);
    expect(response.body.error.code).toBe("EXPENSE_AMOUNT_OVERFLOW");
  });

  it("rejects adding a variable expense with a too long title", async () => {
    const token = await registerAndLogin();
    const response = await request(app)
      .post("/variable-expenses")
      .set("Authorization", `Bearer ${token}`)
      .send(variableExpensePayload({ title: "a".repeat(101) }));

    expect(response.status).toBe(400);
    expect(response.body.error.code).toBe("EXPENSE_TITLE_TOO_LONG");
  });

  it("lists only variable expenses from the authenticated user", async () => {
    const token = await registerAndLogin();
    const otherToken = await registerAndLogin();

    await request(app)
      .post("/variable-expenses")
      .set("Authorization", `Bearer ${token}`)
      .send(variableExpensePayload({ title: "iFood" }))
      .expect(201);
    await request(app)
      .post("/variable-expenses")
      .set("Authorization", `Bearer ${otherToken}`)
      .send(variableExpensePayload({ title: "Outro iFood" }))
      .expect(201);

    const response = await request(app)
      .get("/variable-expenses?month=2026-06")
      .set("Authorization", `Bearer ${token}`);

    expect(response.status).toBe(200);
    expect(response.body.variableExpenses).toHaveLength(1);
    expect(response.body.variableExpenses[0].title).toBe("iFood");
  });

  it("updates an owned variable expense", async () => {
    const token = await registerAndLogin();
    const created = await request(app)
      .post("/variable-expenses")
      .set("Authorization", `Bearer ${token}`)
      .send(variableExpensePayload())
      .expect(201);

    const response = await request(app)
      .patch(`/variable-expenses/${created.body.variableExpense.id}`)
      .set("Authorization", `Bearer ${token}`)
      .send(variableExpensePayload({ title: "Uber", category: "TRANSPORT" }));

    expect(response.status).toBe(200);
    expect(response.body.variableExpense.title).toBe("Uber");
    expect(response.body.variableExpense.category).toBe("TRANSPORT");
  });

  it("deletes an owned variable expense", async () => {
    const token = await registerAndLogin();
    const created = await request(app)
      .post("/variable-expenses")
      .set("Authorization", `Bearer ${token}`)
      .send(variableExpensePayload())
      .expect(201);

    const response = await request(app)
      .delete(`/variable-expenses/${created.body.variableExpense.id}`)
      .set("Authorization", `Bearer ${token}`);

    expect(response.status).toBe(200);
    expect(response.body.message).toBe("Despesa variável removida com sucesso.");
  });
});
