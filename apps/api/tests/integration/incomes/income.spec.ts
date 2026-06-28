import { randomUUID } from "node:crypto";

import request from "supertest";
import { describe, expect, it } from "vitest";

import { app } from "../../../src/app.js";
import { generateValidCpf } from "../auth/auth-test-helpers.js";

const validPassword = "Senha@123";

function incomePayload(overrides: Record<string, unknown> = {}) {
  return {
    title: "Salario",
    amountInCents: 212000,
    type: "MONTHLY",
    referenceMonth: "2026-06",
    description: "Salario atual",
    userId: "malicious-user-id",
    ...overrides
  };
}

async function registerAndLogin() {
  const email = `income.${randomUUID()}@email.com`;

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

  return {
    token: loginResponse.body.accessToken as string,
    user: loginResponse.body.user as { id: string; email: string }
  };
}

describe("income endpoints", () => {
  it("adds an income for the authenticated user", async () => {
    const { token } = await registerAndLogin();

    const response = await request(app)
      .post("/incomes")
      .set("Authorization", `Bearer ${token}`)
      .send(incomePayload());

    expect(response.status).toBe(201);
    expect(response.body.income).toEqual({
      id: expect.any(String),
      title: "Salario",
      amountInCents: 212000,
      type: "MONTHLY",
      referenceMonth: "2026-06",
      description: "Salario atual"
    });
    expect(response.body.income.userId).toBeUndefined();
  });

  it("rejects adding an income without authentication", async () => {
    const response = await request(app).post("/incomes").send(incomePayload());

    expect(response.status).toBe(401);
    expect(response.body.error.code).toBe("UNAUTHORIZED");
  });

  it("rejects editing another user's income", async () => {
    const owner = await registerAndLogin();
    const intruder = await registerAndLogin();
    const created = await request(app)
      .post("/incomes")
      .set("Authorization", `Bearer ${owner.token}`)
      .send(incomePayload())
      .expect(201);

    const response = await request(app)
      .patch(`/incomes/${created.body.income.id}`)
      .set("Authorization", `Bearer ${intruder.token}`)
      .send(incomePayload({ title: "Tentativa" }));

    expect(response.status).toBe(403);
    expect(response.body.error.code).toBe("FORBIDDEN");
  });

  it("rejects deleting another user's income", async () => {
    const owner = await registerAndLogin();
    const intruder = await registerAndLogin();
    const created = await request(app)
      .post("/incomes")
      .set("Authorization", `Bearer ${owner.token}`)
      .send(incomePayload())
      .expect(201);

    const response = await request(app)
      .delete(`/incomes/${created.body.income.id}`)
      .set("Authorization", `Bearer ${intruder.token}`);

    expect(response.status).toBe(403);
    expect(response.body.error.code).toBe("FORBIDDEN");
  });

  it("rejects adding a negative income", async () => {
    const { token } = await registerAndLogin();
    const response = await request(app)
      .post("/incomes")
      .set("Authorization", `Bearer ${token}`)
      .send(incomePayload({ amountInCents: -1 }));

    expect(response.status).toBe(400);
    expect(response.body.error.code).toBe("INCOME_AMOUNT_MUST_BE_POSITIVE");
  });

  it("rejects adding a zero income", async () => {
    const { token } = await registerAndLogin();
    const response = await request(app)
      .post("/incomes")
      .set("Authorization", `Bearer ${token}`)
      .send(incomePayload({ amountInCents: 0 }));

    expect(response.status).toBe(400);
    expect(response.body.error.code).toBe("INCOME_AMOUNT_MUST_BE_POSITIVE");
  });

  it("rejects adding an income without required fields", async () => {
    const { token } = await registerAndLogin();
    const response = await request(app).post("/incomes").set("Authorization", `Bearer ${token}`).send({});

    expect(response.status).toBe(400);
    expect(response.body.error.code).toBe("VALIDATION_ERROR");
  });

  it("rejects adding an income over the limit", async () => {
    const { token } = await registerAndLogin();
    const response = await request(app)
      .post("/incomes")
      .set("Authorization", `Bearer ${token}`)
      .send(incomePayload({ amountInCents: 100000000000 }));

    expect(response.status).toBe(400);
    expect(response.body.error.code).toBe("INCOME_AMOUNT_OVERFLOW");
  });

  it("rejects adding an income with a too long title", async () => {
    const { token } = await registerAndLogin();
    const response = await request(app)
      .post("/incomes")
      .set("Authorization", `Bearer ${token}`)
      .send(incomePayload({ title: "a".repeat(101) }));

    expect(response.status).toBe(400);
    expect(response.body.error.code).toBe("INCOME_TITLE_TOO_LONG");
  });

  it("lists only incomes from the authenticated user", async () => {
    const user = await registerAndLogin();
    const otherUser = await registerAndLogin();

    await request(app)
      .post("/incomes")
      .set("Authorization", `Bearer ${user.token}`)
      .send(incomePayload({ title: "Salario" }))
      .expect(201);
    await request(app)
      .post("/incomes")
      .set("Authorization", `Bearer ${otherUser.token}`)
      .send(incomePayload({ title: "Outro salario" }))
      .expect(201);

    const response = await request(app)
      .get("/incomes?month=2026-06")
      .set("Authorization", `Bearer ${user.token}`);

    expect(response.status).toBe(200);
    expect(response.body.incomes).toHaveLength(1);
    expect(response.body.incomes[0].title).toBe("Salario");
  });

  it("updates an owned income", async () => {
    const { token } = await registerAndLogin();
    const created = await request(app)
      .post("/incomes")
      .set("Authorization", `Bearer ${token}`)
      .send(incomePayload())
      .expect(201);

    const response = await request(app)
      .patch(`/incomes/${created.body.income.id}`)
      .set("Authorization", `Bearer ${token}`)
      .send(incomePayload({ title: "Salario atualizado", type: "EXTRA" }));

    expect(response.status).toBe(200);
    expect(response.body.income.title).toBe("Salario atualizado");
    expect(response.body.income.type).toBe("EXTRA");
  });

  it("deletes an owned income", async () => {
    const { token } = await registerAndLogin();
    const created = await request(app)
      .post("/incomes")
      .set("Authorization", `Bearer ${token}`)
      .send(incomePayload())
      .expect(201);

    const response = await request(app)
      .delete(`/incomes/${created.body.income.id}`)
      .set("Authorization", `Bearer ${token}`);

    expect(response.status).toBe(200);
    expect(response.body.message).toBe("Renda removida com sucesso.");
  });
});
