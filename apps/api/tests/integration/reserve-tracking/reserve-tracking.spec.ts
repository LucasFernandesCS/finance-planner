import { randomUUID } from "node:crypto";

import request from "supertest";
import { describe, expect, it } from "vitest";

import { app } from "../../../src/app.js";
import { generateValidCpf } from "../auth/auth-test-helpers.js";

const validPassword = "Senha@123";

async function registerAndLogin() {
  const email = `reserve.${randomUUID()}@email.com`;
  await request(app)
    .post("/auth/register")
    .send({ firstName: "Lucas", lastName: "Fernandes", email, password: validPassword, cpf: generateValidCpf() })
    .expect(201);
  const loginResponse = await request(app).post("/auth/login").send({ email, password: validPassword }).expect(200);
  return loginResponse.body.accessToken as string;
}

async function createFixedExpense(token: string, amountInCents = 350000, title = "Aluguel") {
  const response = await request(app)
    .post("/fixed-expenses")
    .set("Authorization", `Bearer ${token}`)
    .send({ title, amountInCents, category: "RENT", startMonth: "2026-06" })
    .expect(201);
  return response.body.fixedExpense;
}

async function setupReserve(token: string, protectionMonths = 6) {
  const response = await request(app)
    .post("/reserve")
    .set("Authorization", `Bearer ${token}`)
    .send({ protectionMonths, userId: "malicious-user-id" })
    .expect(201);
  return response.body.reserve;
}

describe("reserve tracking endpoints", () => {
  it("configures a reserve successfully", async () => {
    const token = await registerAndLogin();
    await createFixedExpense(token);

    const response = await request(app).post("/reserve").set("Authorization", `Bearer ${token}`).send({ protectionMonths: 6 });

    expect(response.status).toBe(201);
    expect(response.body.reserve).toEqual(
      expect.objectContaining({
        protectionMonths: 6,
        currentBalanceInCents: 0,
        monthlyFixedExpensesInCents: 350000,
        targetAmountInCents: 2100000,
        completionPercentage: 0,
        status: "BUILDING"
      })
    );
    expect(response.body.reserve.userId).toBeUndefined();
  });

  it("rejects reserve setup without authentication", async () => {
    const response = await request(app).post("/reserve").send({ protectionMonths: 6 });

    expect(response.status).toBe(401);
    expect(response.body.error.code).toBe("UNAUTHORIZED");
  });

  it("rejects invalid setup input and setup without fixed expenses", async () => {
    const token = await registerAndLogin();

    const zero = await request(app).post("/reserve").set("Authorization", `Bearer ${token}`).send({ protectionMonths: 0 });
    const negative = await request(app).post("/reserve").set("Authorization", `Bearer ${token}`).send({ protectionMonths: -1 });
    const noExpenses = await request(app).post("/reserve").set("Authorization", `Bearer ${token}`).send({ protectionMonths: 6 });

    expect(zero.status).toBe(400);
    expect(zero.body.error.code).toBe("INVALID_PROTECTION_MONTHS");
    expect(negative.body.error.code).toBe("INVALID_PROTECTION_MONTHS");
    expect(noExpenses.body.error.code).toBe("RESERVE_FIXED_EXPENSES_REQUIRED");
  });

  it("gets reserve and recalculates target after fixed expense changes", async () => {
    const token = await registerAndLogin();
    const fixedExpense = await createFixedExpense(token);
    await setupReserve(token);

    const initial = await request(app).get("/reserve").set("Authorization", `Bearer ${token}`);
    await createFixedExpense(token, 50000, "Internet");
    const increased = await request(app).get("/reserve").set("Authorization", `Bearer ${token}`);
    await request(app)
      .patch(`/fixed-expenses/${fixedExpense.id}`)
      .set("Authorization", `Bearer ${token}`)
      .send({ title: "Aluguel menor", amountInCents: 300000, category: "RENT", startMonth: "2026-06" })
      .expect(200);
    const reduced = await request(app).get("/reserve").set("Authorization", `Bearer ${token}`);
    await request(app).delete(`/fixed-expenses/${fixedExpense.id}`).set("Authorization", `Bearer ${token}`).expect(200);
    const removed = await request(app).get("/reserve").set("Authorization", `Bearer ${token}`);

    expect(initial.body.reserve.targetAmountInCents).toBe(2100000);
    expect(increased.body.reserve.targetAmountInCents).toBe(2400000);
    expect(reduced.body.reserve.targetAmountInCents).toBe(2100000);
    expect(removed.body.reserve.targetAmountInCents).toBe(300000);
  });

  it("deposits, withdraws and lists transactions", async () => {
    const token = await registerAndLogin();
    await createFixedExpense(token);
    await setupReserve(token);

    const deposit = await request(app)
      .post("/reserve/deposits")
      .set("Authorization", `Bearer ${token}`)
      .send({ amountInCents: 100000, occurredAt: "2026-06-29", note: "Aporte" });
    const withdrawal = await request(app)
      .post("/reserve/withdrawals")
      .set("Authorization", `Bearer ${token}`)
      .send({ amountInCents: 30000, occurredAt: "2026-06-29", note: "Emergencia" });
    const transactions = await request(app).get("/reserve/transactions").set("Authorization", `Bearer ${token}`);

    expect(deposit.status).toBe(201);
    expect(deposit.body.reserve.currentBalanceInCents).toBe(100000);
    expect(deposit.body.transaction.type).toBe("DEPOSIT");
    expect(withdrawal.status).toBe(201);
    expect(withdrawal.body.reserve.currentBalanceInCents).toBe(70000);
    expect(withdrawal.body.transaction.type).toBe("WITHDRAWAL");
    expect(transactions.body.transactions).toHaveLength(2);
  });

  it("rejects withdrawal greater than current balance", async () => {
    const token = await registerAndLogin();
    await createFixedExpense(token);
    await setupReserve(token);
    await request(app).post("/reserve/deposits").set("Authorization", `Bearer ${token}`).send({ amountInCents: 100000 });

    const response = await request(app)
      .post("/reserve/withdrawals")
      .set("Authorization", `Bearer ${token}`)
      .send({ amountInCents: 150000 });

    expect(response.status).toBe(400);
    expect(response.body.error.code).toBe("RESERVE_WITHDRAWAL_EXCEEDS_BALANCE");
  });

  it("updates status automatically between PROTECTED and REPLENISHING", async () => {
    const token = await registerAndLogin();
    const fixedExpense = await createFixedExpense(token);
    await setupReserve(token);

    const protectedResponse = await request(app)
      .post("/reserve/deposits")
      .set("Authorization", `Bearer ${token}`)
      .send({ amountInCents: 2100000 });
    const replenishing = await request(app)
      .post("/reserve/withdrawals")
      .set("Authorization", `Bearer ${token}`)
      .send({ amountInCents: 100000 });
    await request(app)
      .patch(`/fixed-expenses/${fixedExpense.id}`)
      .set("Authorization", `Bearer ${token}`)
      .send({ title: "Aluguel menor", amountInCents: 300000, category: "RENT", startMonth: "2026-06" })
      .expect(200);
    const protectedAgain = await request(app).get("/reserve").set("Authorization", `Bearer ${token}`);

    expect(protectedResponse.body.reserve.status).toBe("PROTECTED");
    expect(replenishing.body.reserve.status).toBe("REPLENISHING");
    expect(protectedAgain.body.reserve.status).toBe("PROTECTED");
  });

  it("isolates reserve data between users", async () => {
    const token = await registerAndLogin();
    const otherToken = await registerAndLogin();
    await createFixedExpense(token);
    await createFixedExpense(otherToken, 100000, "Outra despesa");
    await setupReserve(token);
    await setupReserve(otherToken, 3);
    await request(app).post("/reserve/deposits").set("Authorization", `Bearer ${otherToken}`).send({ amountInCents: 900000 });

    const response = await request(app).get("/reserve").set("Authorization", `Bearer ${token}`);

    expect(response.status).toBe(200);
    expect(response.body.reserve.protectionMonths).toBe(6);
    expect(response.body.reserve.currentBalanceInCents).toBe(0);
  });
});
