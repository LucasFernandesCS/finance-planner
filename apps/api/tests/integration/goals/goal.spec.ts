import { randomUUID } from "node:crypto";

import request from "supertest";
import { describe, expect, it } from "vitest";

import { app } from "../../../src/app.js";
import { generateValidCpf } from "../auth/auth-test-helpers.js";

const validPassword = "Senha@123";

function goalPayload(overrides: Record<string, unknown> = {}) {
  return {
    title: "Comprar notebook",
    targetAmountInCents: 1200000,
    monthlyAmountInCents: 100000,
    deadlineDate: "2027-06-30",
    description: "Notebook para trabalho",
    userId: "malicious-user-id",
    ...overrides
  };
}

async function registerAndLogin() {
  const email = `goal.${randomUUID()}@email.com`;

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

async function seedBudget(token: string, input: { incomeInCents?: number; fixedExpensesInCents?: number } = {}) {
  await request(app)
    .post("/incomes")
    .set("Authorization", `Bearer ${token}`)
    .send({
      title: "Salario",
      amountInCents: input.incomeInCents ?? 500000,
      type: "MONTHLY",
      referenceMonth: "2026-06"
    })
    .expect(201);
  await request(app)
    .post("/fixed-expenses")
    .set("Authorization", `Bearer ${token}`)
    .send({
      title: "Aluguel",
      amountInCents: input.fixedExpensesInCents ?? 350000,
      category: "RENT",
      startMonth: "2026-06"
    })
    .expect(201);
}

describe("goal endpoints", () => {
  it("creates a feasible goal", async () => {
    const token = await registerAndLogin();
    await seedBudget(token);

    const response = await request(app).post("/goals").set("Authorization", `Bearer ${token}`).send(goalPayload());

    expect(response.status).toBe(201);
    expect(response.body.goal).toEqual({
      id: expect.any(String),
      title: "Comprar notebook",
      targetAmountInCents: 1200000,
      monthlyAmountInCents: 100000,
      currentAmountInCents: 0,
      deadlineDate: "2027-06-30",
      status: "NOT_STARTED",
      description: "Notebook para trabalho"
    });
    expect(response.body.goal.userId).toBeUndefined();
    expect(response.body.feasibility).toEqual(
      expect.objectContaining({
        suggestedMonthlyAmountInCents: expect.any(Number),
        availableMonthlyAmountInCents: 150000,
        isFeasible: true
      })
    );
  });

  it("rejects an unfeasible goal", async () => {
    const token = await registerAndLogin();
    await seedBudget(token);

    const response = await request(app)
      .post("/goals")
      .set("Authorization", `Bearer ${token}`)
      .send(goalPayload({ targetAmountInCents: 1500000, monthlyAmountInCents: 187500, deadlineDate: "2027-02-28" }));

    expect(response.status).toBe(422);
    expect(response.body.error.code).toBe("GOAL_NOT_FINANCIALLY_FEASIBLE");
    expect(response.body.error.suggestion).toBeDefined();
  });

  it("rejects a goal with monthly amount below the suggested amount", async () => {
    const token = await registerAndLogin();
    await seedBudget(token, { incomeInCents: 700000 });

    const response = await request(app)
      .post("/goals")
      .set("Authorization", `Bearer ${token}`)
      .send(goalPayload({ targetAmountInCents: 1500000, monthlyAmountInCents: 125000, deadlineDate: "2026-12-30" }));

    expect(response.status).toBe(400);
    expect(response.body.error.code).toBe("GOAL_MONTHLY_AMOUNT_TOO_LOW");
    expect(response.body.error.suggestedMonthlyAmountInCents).toBe(250000);
  });

  it("accepts a goal with monthly amount equal to the suggested amount when it fits the surplus", async () => {
    const token = await registerAndLogin();
    await seedBudget(token, { incomeInCents: 600000 });

    const response = await request(app)
      .post("/goals")
      .set("Authorization", `Bearer ${token}`)
      .send(goalPayload({ targetAmountInCents: 1500000, monthlyAmountInCents: 250000, deadlineDate: "2026-12-30" }));

    expect(response.status).toBe(201);
    expect(response.body.feasibility.suggestedMonthlyAmountInCents).toBe(250000);
  });

  it("rejects a goal with sufficient monthly amount above free surplus", async () => {
    const token = await registerAndLogin();
    await seedBudget(token);

    const response = await request(app)
      .post("/goals")
      .set("Authorization", `Bearer ${token}`)
      .send(goalPayload({ targetAmountInCents: 1500000, monthlyAmountInCents: 250000, deadlineDate: "2026-12-30" }));

    expect(response.status).toBe(422);
    expect(response.body.error.code).toBe("GOAL_NOT_FINANCIALLY_FEASIBLE");
  });

  it("rejects invalid goal values", async () => {
    const token = await registerAndLogin();
    await seedBudget(token);

    const negative = await request(app)
      .post("/goals")
      .set("Authorization", `Bearer ${token}`)
      .send(goalPayload({ targetAmountInCents: -1 }));
    const zero = await request(app)
      .post("/goals")
      .set("Authorization", `Bearer ${token}`)
      .send(goalPayload({ targetAmountInCents: 0 }));
    const missing = await request(app).post("/goals").set("Authorization", `Bearer ${token}`).send({});
    const past = await request(app)
      .post("/goals")
      .set("Authorization", `Bearer ${token}`)
      .send(goalPayload({ deadlineDate: "2026-06-28" }));
    const today = await request(app)
      .post("/goals")
      .set("Authorization", `Bearer ${token}`)
      .send(goalPayload({ deadlineDate: "2026-06-29" }));
    const longTitle = await request(app)
      .post("/goals")
      .set("Authorization", `Bearer ${token}`)
      .send(goalPayload({ title: "a".repeat(101) }));
    const overflow = await request(app)
      .post("/goals")
      .set("Authorization", `Bearer ${token}`)
      .send(goalPayload({ targetAmountInCents: 100000000000 }));

    expect(negative.body.error.code).toBe("GOAL_TARGET_AMOUNT_MUST_BE_POSITIVE");
    expect(zero.body.error.code).toBe("GOAL_TARGET_AMOUNT_MUST_BE_POSITIVE");
    expect(missing.body.error.code).toBe("VALIDATION_ERROR");
    expect(past.body.error.code).toBe("GOAL_DEADLINE_MUST_BE_FUTURE");
    expect(today.body.error.code).toBe("GOAL_DEADLINE_MUST_BE_FUTURE");
    expect(longTitle.body.error.code).toBe("GOAL_TITLE_TOO_LONG");
    expect(overflow.body.error.code).toBe("GOAL_AMOUNT_OVERFLOW");
  });

  it("lists only goals from the authenticated user", async () => {
    const token = await registerAndLogin();
    const otherToken = await registerAndLogin();
    await seedBudget(token);
    await seedBudget(otherToken);

    await request(app).post("/goals").set("Authorization", `Bearer ${token}`).send(goalPayload()).expect(201);
    await request(app)
      .post("/goals")
      .set("Authorization", `Bearer ${otherToken}`)
      .send(goalPayload({ title: "Outro objetivo" }))
      .expect(201);

    const response = await request(app).get("/goals").set("Authorization", `Bearer ${token}`);

    expect(response.status).toBe(200);
    expect(response.body.goals).toHaveLength(1);
    expect(response.body.goals[0].title).toBe("Comprar notebook");
  });

  it("uses real financial data and active goal commitments", async () => {
    const token = await registerAndLogin();
    await seedBudget(token);

    await request(app)
      .post("/goals")
      .set("Authorization", `Bearer ${token}`)
      .send(goalPayload({ title: "Objetivo A", targetAmountInCents: 600000, monthlyAmountInCents: 50000 }))
      .expect(201);

    const response = await request(app)
      .post("/goals")
      .set("Authorization", `Bearer ${token}`)
      .send(goalPayload({ title: "Objetivo B", targetAmountInCents: 1000000, monthlyAmountInCents: 100000 }));

    expect(response.status).toBe(201);
    expect(response.body.feasibility.availableMonthlyAmountInCents).toBe(100000);
  });

  it("gets, updates and deletes an owned goal", async () => {
    const token = await registerAndLogin();
    await seedBudget(token);
    const created = await request(app).post("/goals").set("Authorization", `Bearer ${token}`).send(goalPayload()).expect(201);

    const detail = await request(app).get(`/goals/${created.body.goal.id}`).set("Authorization", `Bearer ${token}`);
    const updated = await request(app)
      .patch(`/goals/${created.body.goal.id}`)
      .set("Authorization", `Bearer ${token}`)
      .send(goalPayload({ title: "Notebook atualizado" }));
    const removed = await request(app).delete(`/goals/${created.body.goal.id}`).set("Authorization", `Bearer ${token}`);

    expect(detail.status).toBe(200);
    expect(updated.body.goal.title).toBe("Notebook atualizado");
    expect(removed.body.message).toBe("Objetivo removido com sucesso.");
  });

  it("contributes to an owned goal and updates status", async () => {
    const token = await registerAndLogin();
    await seedBudget(token);
    const created = await request(app).post("/goals").set("Authorization", `Bearer ${token}`).send(goalPayload()).expect(201);

    const partial = await request(app)
      .post(`/goals/${created.body.goal.id}/contributions`)
      .set("Authorization", `Bearer ${token}`)
      .send({ amountInCents: 50000, note: "Reserva do mes" });
    const achieved = await request(app)
      .post(`/goals/${created.body.goal.id}/contributions`)
      .set("Authorization", `Bearer ${token}`)
      .send({ amountInCents: 1150000 });

    expect(partial.status).toBe(201);
    expect(partial.body.goal.currentAmountInCents).toBe(50000);
    expect(partial.body.goal.status).toBe("IN_PROGRESS");
    expect(partial.body.contribution.amountInCents).toBe(50000);
    expect(achieved.body.goal.currentAmountInCents).toBe(1200000);
    expect(achieved.body.goal.status).toBe("ACHIEVED");
  });

  it("rejects invalid status transition and cross-user contribution", async () => {
    const token = await registerAndLogin();
    const otherToken = await registerAndLogin();
    await seedBudget(token);
    await seedBudget(otherToken);
    const created = await request(app).post("/goals").set("Authorization", `Bearer ${token}`).send(goalPayload()).expect(201);

    const transition = await request(app)
      .patch(`/goals/${created.body.goal.id}`)
      .set("Authorization", `Bearer ${token}`)
      .send(goalPayload({ status: "ACHIEVED" }));
    const forbidden = await request(app)
      .post(`/goals/${created.body.goal.id}/contributions`)
      .set("Authorization", `Bearer ${otherToken}`)
      .send({ amountInCents: 10000 });

    expect(transition.status).toBe(400);
    expect(transition.body.error.code).toBe("INVALID_GOAL_STATUS_TRANSITION");
    expect(forbidden.status).toBe(403);
    expect(forbidden.body.error.code).toBe("FORBIDDEN");
  });
});
