import { randomUUID } from "node:crypto";

import request from "supertest";
import { describe, expect, it } from "vitest";

import { app } from "../../../src/app.js";
import { generateValidCpf } from "../auth/auth-test-helpers.js";

const validPassword = "Senha@123";

async function registerAndLogin() {
  const email = `dashboard.${randomUUID()}@email.com`;
  await request(app)
    .post("/auth/register")
    .send({ firstName: "Lucas", lastName: "Fernandes", email, password: validPassword, cpf: generateValidCpf() })
    .expect(201);
  const login = await request(app).post("/auth/login").send({ email, password: validPassword }).expect(200);
  return login.body.accessToken as string;
}

async function seedBase(token: string) {
  await request(app)
    .post("/incomes")
    .set("Authorization", `Bearer ${token}`)
    .send({ title: "Salario", amountInCents: 750000, type: "MONTHLY", referenceMonth: "2026-06" })
    .expect(201);
  await request(app)
    .post("/incomes")
    .set("Authorization", `Bearer ${token}`)
    .send({ title: "Freela", amountInCents: 100000, type: "EXTRA", referenceMonth: "2026-06" })
    .expect(201);
  const fixed = await request(app)
    .post("/fixed-expenses")
    .set("Authorization", `Bearer ${token}`)
    .send({ title: "Aluguel", amountInCents: 350000, category: "RENT", startMonth: "2026-06" })
    .expect(201);
  await request(app)
    .post("/variable-expenses")
    .set("Authorization", `Bearer ${token}`)
    .send({ title: "Mercado", amountInCents: 70000, category: "GROCERIES", referenceMonth: "2026-06" })
    .expect(201);
  return fixed.body.fixedExpense;
}

async function createGoalAndSetPrimary(token: string) {
  const goal = await request(app)
    .post("/goals")
    .set("Authorization", `Bearer ${token}`)
    .send({ title: "Notebook", targetAmountInCents: 1500000, monthlyAmountInCents: 125000, deadlineDate: "2027-06-30" })
    .expect(201);
  await request(app)
    .patch("/me/primary-goal")
    .set("Authorization", `Bearer ${token}`)
    .send({ primaryGoalId: goal.body.goal.id })
    .expect(200);
  return goal.body.goal;
}

async function createDebtPayment(token: string) {
  const debt = await request(app)
    .post("/debts")
    .set("Authorization", `Bearer ${token}`)
    .send({
      title: "Financiamento",
      creditor: "Banco",
      type: "FINANCING",
      originalAmountInCents: 1200000,
      installmentAmountInCents: 50000,
      monthlyDueDay: 10
    })
    .expect(201);
  await request(app)
    .post(`/debts/${debt.body.debt.id}/payments`)
    .set("Authorization", `Bearer ${token}`)
    .send({ amountInCents: 50000, occurredAt: "2026-06-29" })
    .expect(201);
  return debt.body.debt;
}

describe("dashboard summary endpoint", () => {
  it("returns dashboard summary with authenticated user's consolidated data", async () => {
    const token = await registerAndLogin();
    await seedBase(token);
    await createDebtPayment(token);
    await request(app).post("/reserve").set("Authorization", `Bearer ${token}`).send({ protectionMonths: 6 }).expect(201);
    await request(app).post("/reserve/deposits").set("Authorization", `Bearer ${token}`).send({ amountInCents: 500000 }).expect(201);
    await createGoalAndSetPrimary(token);

    const response = await request(app)
      .get("/dashboard/summary")
      .query({ month: "2026-06" })
      .set("Authorization", `Bearer ${token}`);

    expect(response.status).toBe(200);
    expect(response.body.period.referenceMonth).toBe("2026-06");
    expect(response.body.income).toEqual({ monthlyIncomeInCents: 750000, extraIncomeInCents: 100000, totalIncomeInCents: 850000 });
    expect(response.body.expenses).toEqual({
      fixedExpensesInCents: 350000,
      variableExpensesInCents: 120000,
      debtPaymentsInCents: 50000,
      totalExpensesInCents: 470000
    });
    expect(response.body.cashFlow.expectedSurplusInCents).toBe(380000);
    expect(response.body.cashFlow.recurringSurplusInCents).toBe(400000);
    expect(response.body.debts.openDebtBalanceInCents).toBe(1150000);
    expect(response.body.debts.openDebtsCount).toBe(1);
    expect(response.body.reserve).toEqual(expect.objectContaining({ targetAmountInCents: 2100000, completionPercentage: 23.81 }));
    expect(response.body.reserveSetupRequired).toBe(false);
    expect(response.body.primaryGoal).toEqual(expect.objectContaining({ title: "Notebook", completionPercentage: 0 }));
    expect(response.body.primaryGoalSetupRequired).toBe(false);
  });

  it("rejects unauthenticated and invalid month requests", async () => {
    const token = await registerAndLogin();
    const unauthenticated = await request(app).get("/dashboard/summary");
    const invalidMonth = await request(app)
      .get("/dashboard/summary")
      .query({ month: "06-2026" })
      .set("Authorization", `Bearer ${token}`);

    expect(unauthenticated.status).toBe(401);
    expect(unauthenticated.body.error.code).toBe("UNAUTHORIZED");
    expect(invalidMonth.status).toBe(400);
    expect(invalidMonth.body.error.code).toBe("INVALID_DASHBOARD_MONTH");
  });

  it("returns only authenticated user's data", async () => {
    const token = await registerAndLogin();
    const otherToken = await registerAndLogin();
    await seedBase(token);
    await request(app)
      .post("/incomes")
      .set("Authorization", `Bearer ${otherToken}`)
      .send({ title: "Outro", amountInCents: 999999, type: "MONTHLY", referenceMonth: "2026-06" })
      .expect(201);

    const response = await request(app).get("/dashboard/summary").query({ month: "2026-06" }).set("Authorization", `Bearer ${token}`);

    expect(response.body.income.totalIncomeInCents).toBe(850000);
  });

  it("considers recurring monthly income and ignores previous extra income in future months", async () => {
    const token = await registerAndLogin();
    await seedBase(token);

    const response = await request(app)
      .get("/dashboard/summary")
      .query({ month: "2026-07" })
      .set("Authorization", `Bearer ${token}`)
      .expect(200);

    expect(response.body.income.monthlyIncomeInCents).toBe(750000);
    expect(response.body.income.extraIncomeInCents).toBe(0);
    expect(response.body.income.totalIncomeInCents).toBe(750000);
  });

  it("calculates future month surplus with recurring monthly income", async () => {
    const token = await registerAndLogin();
    await request(app)
      .post("/incomes")
      .set("Authorization", `Bearer ${token}`)
      .send({ title: "Salario", amountInCents: 1200000, type: "MONTHLY", referenceMonth: "2026-06" })
      .expect(201);
    await request(app)
      .post("/fixed-expenses")
      .set("Authorization", `Bearer ${token}`)
      .send({ title: "Aluguel", amountInCents: 500000, category: "RENT", startMonth: "2026-06" })
      .expect(201);
    await request(app)
      .post("/variable-expenses")
      .set("Authorization", `Bearer ${token}`)
      .send({ title: "Mercado", amountInCents: 140575, category: "GROCERIES", referenceMonth: "2026-07" })
      .expect(201);

    const response = await request(app)
      .get("/dashboard/summary")
      .query({ month: "2026-07" })
      .set("Authorization", `Bearer ${token}`)
      .expect(200);

    expect(response.body.income.totalIncomeInCents).toBe(1200000);
    expect(response.body.expenses.totalExpensesInCents).toBe(640575);
    expect(response.body.cashFlow.expectedSurplusInCents).toBe(559425);
  });

  it("does not include fixed expenses before their start month", async () => {
    const token = await registerAndLogin();
    await request(app)
      .post("/fixed-expenses")
      .set("Authorization", `Bearer ${token}`)
      .send({ title: "Aluguel de junho", amountInCents: 350000, category: "RENT", startMonth: "2026-06" })
      .expect(201);

    const may = await request(app)
      .get("/dashboard/summary")
      .query({ month: "2026-05" })
      .set("Authorization", `Bearer ${token}`)
      .expect(200);
    const june = await request(app)
      .get("/dashboard/summary")
      .query({ month: "2026-06" })
      .set("Authorization", `Bearer ${token}`)
      .expect(200);

    expect(may.body.expenses.fixedExpensesInCents).toBe(0);
    expect(june.body.expenses.fixedExpensesInCents).toBe(350000);
  });

  it("returns setup flags and alerts when reserve and primary goal are missing", async () => {
    const token = await registerAndLogin();
    const response = await request(app).get("/dashboard/summary").query({ month: "2026-06" }).set("Authorization", `Bearer ${token}`);

    expect(response.status).toBe(200);
    expect(response.body.reserve).toBeNull();
    expect(response.body.reserveSetupRequired).toBe(true);
    expect(response.body.primaryGoal).toBeNull();
    expect(response.body.primaryGoalSetupRequired).toBe(true);
    expect(response.body.alerts.map((alert: { type: string }) => alert.type)).toEqual(
      expect.arrayContaining(["NO_INCOME_REGISTERED", "RESERVE_SETUP_REQUIRED", "PRIMARY_GOAL_SETUP_REQUIRED"])
    );
  });

  it("generates negative surplus, overdue debt and reserve below target alerts", async () => {
    const token = await registerAndLogin();
    await request(app)
      .post("/incomes")
      .set("Authorization", `Bearer ${token}`)
      .send({ title: "Salario menor", amountInCents: 100000, type: "MONTHLY", referenceMonth: "2026-06" })
      .expect(201);
    await request(app)
      .post("/fixed-expenses")
      .set("Authorization", `Bearer ${token}`)
      .send({ title: "Aluguel", amountInCents: 350000, category: "RENT", startMonth: "2026-06" })
      .expect(201);
    const debt = await request(app)
      .post("/debts")
      .set("Authorization", `Bearer ${token}`)
      .send({ title: "Atrasada", creditor: "Banco", type: "OTHER", originalAmountInCents: 100000, monthlyDueDay: 1 })
      .expect(201);
    await request(app).get(`/debts/${debt.body.debt.id}`).set("Authorization", `Bearer ${token}`).expect(200);
    await request(app).post("/reserve").set("Authorization", `Bearer ${token}`).send({ protectionMonths: 6 }).expect(201);

    const response = await request(app).get("/dashboard/summary").query({ month: "2026-06" }).set("Authorization", `Bearer ${token}`);

    expect(response.body.alerts.map((alert: { type: string }) => alert.type)).toEqual(
      expect.arrayContaining(["NEGATIVE_SURPLUS", "OVERDUE_DEBT", "RESERVE_BELOW_TARGET", "FIXED_EXPENSES_EXCEED_MONTHLY_INCOME"])
    );
  });

  it("respects financialMonthStartDay", async () => {
    const token = await registerAndLogin();
    await request(app)
      .patch("/me/profile")
      .set("Authorization", `Bearer ${token}`)
      .send({ financialMonthStartDay: 5 })
      .expect(200);

    const response = await request(app).get("/dashboard/summary").query({ month: "2026-06" }).set("Authorization", `Bearer ${token}`);

    expect(response.body.period.startDate).toBe("2026-06-05");
    expect(response.body.period.endDate).toBe("2026-07-04");
  });
});
