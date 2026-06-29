import { randomUUID } from "node:crypto";

import request from "supertest";
import { describe, expect, it } from "vitest";

import { app } from "../../../src/app.js";
import { generateValidCpf } from "../auth/auth-test-helpers.js";

const validPassword = "Senha@123";

async function registerAndLogin() {
  const email = `profile.${randomUUID()}@email.com`;

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

async function seedGoal(token: string) {
  await request(app)
    .post("/incomes")
    .set("Authorization", `Bearer ${token}`)
    .send({
      title: "Salario",
      amountInCents: 500000,
      type: "MONTHLY",
      referenceMonth: "2026-06"
    })
    .expect(201);
  await request(app)
    .post("/fixed-expenses")
    .set("Authorization", `Bearer ${token}`)
    .send({
      title: "Aluguel",
      amountInCents: 350000,
      category: "RENT",
      startMonth: "2026-06"
    })
    .expect(201);

  const goalResponse = await request(app)
    .post("/goals")
    .set("Authorization", `Bearer ${token}`)
    .send({
      title: "Notebook",
      targetAmountInCents: 1200000,
      monthlyAmountInCents: 100000,
      deadlineDate: "2027-06-30"
    })
    .expect(201);

  return goalResponse.body.goal.id as string;
}

describe("user profile endpoints", () => {
  it("returns the authenticated user profile and creates it automatically", async () => {
    const token = await registerAndLogin();

    const response = await request(app).get("/me").set("Authorization", `Bearer ${token}`);

    expect(response.status).toBe(200);
    expect(response.body.user).toEqual({
      id: expect.any(String),
      firstName: "Lucas",
      lastName: "Fernandes",
      email: expect.any(String)
    });
    expect(response.body.profile).toEqual({
      displayName: null,
      avatarUrl: null,
      currencyCode: "BRL",
      locale: "pt-BR",
      timezone: "America/Recife",
      financialMonthStartDay: 1,
      primaryGoalId: null,
      onboardingCompleted: false
    });
    expect(response.body.user.passwordHash).toBeUndefined();
    expect(response.body.user.cpfHash).toBeUndefined();
    expect(response.body.refreshTokenHash).toBeUndefined();
  });

  it("rejects unauthenticated profile requests", async () => {
    const getResponse = await request(app).get("/me");
    const patchResponse = await request(app).patch("/me/profile").send({});

    expect(getResponse.status).toBe(401);
    expect(getResponse.body.error.code).toBe("UNAUTHORIZED");
    expect(patchResponse.status).toBe(401);
    expect(patchResponse.body.error.code).toBe("UNAUTHORIZED");
  });

  it("updates the profile successfully", async () => {
    const token = await registerAndLogin();

    const response = await request(app).patch("/me/profile").set("Authorization", `Bearer ${token}`).send({
      firstName: "Lucas Atualizado",
      lastName: "Silva",
      displayName: "Lucas Dev",
      avatarUrl: "https://example.com/avatar.png",
      currencyCode: "BRL",
      locale: "pt-BR",
      timezone: "America/Recife",
      financialMonthStartDay: 10,
      email: "should-not-change@example.com",
      cpf: "should-not-change",
      password: "should-not-change"
    });

    expect(response.status).toBe(200);
    expect(response.body.user.firstName).toBe("Lucas Atualizado");
    expect(response.body.user.lastName).toBe("Silva");
    expect(response.body.user.email).not.toBe("should-not-change@example.com");
    expect(response.body.profile.displayName).toBe("Lucas Dev");
    expect(response.body.profile.financialMonthStartDay).toBe(10);
  });

  it("rejects invalid profile input", async () => {
    const token = await registerAndLogin();

    const displayName = await request(app)
      .patch("/me/profile")
      .set("Authorization", `Bearer ${token}`)
      .send({ displayName: "a".repeat(101) });
    const avatarUrl = await request(app)
      .patch("/me/profile")
      .set("Authorization", `Bearer ${token}`)
      .send({ avatarUrl: "not-a-url" });
    const financialDay = await request(app)
      .patch("/me/profile")
      .set("Authorization", `Bearer ${token}`)
      .send({ financialMonthStartDay: 29 });

    expect(displayName.body.error.code).toBe("DISPLAY_NAME_TOO_LONG");
    expect(avatarUrl.body.error.code).toBe("INVALID_AVATAR_URL");
    expect(financialDay.body.error.code).toBe("INVALID_FINANCIAL_MONTH_START_DAY");
  });

  it("sets and removes the primary goal", async () => {
    const token = await registerAndLogin();
    const goalId = await seedGoal(token);

    const setResponse = await request(app)
      .patch("/me/primary-goal")
      .set("Authorization", `Bearer ${token}`)
      .send({ primaryGoalId: goalId });
    const removeResponse = await request(app)
      .patch("/me/primary-goal")
      .set("Authorization", `Bearer ${token}`)
      .send({ primaryGoalId: null });

    expect(setResponse.status).toBe(200);
    expect(setResponse.body.profile.primaryGoalId).toBe(goalId);
    expect(removeResponse.status).toBe(200);
    expect(removeResponse.body.profile.primaryGoalId).toBeNull();
  });

  it("rejects invalid primary goals", async () => {
    const token = await registerAndLogin();
    const otherToken = await registerAndLogin();
    const otherGoalId = await seedGoal(otherToken);

    const missing = await request(app)
      .patch("/me/primary-goal")
      .set("Authorization", `Bearer ${token}`)
      .send({ primaryGoalId: randomUUID() });
    const forbidden = await request(app)
      .patch("/me/primary-goal")
      .set("Authorization", `Bearer ${token}`)
      .send({ primaryGoalId: otherGoalId });

    expect(missing.status).toBe(404);
    expect(missing.body.error.code).toBe("GOAL_NOT_FOUND");
    expect(forbidden.status).toBe(403);
    expect(forbidden.body.error.code).toBe("FORBIDDEN");
  });
});
