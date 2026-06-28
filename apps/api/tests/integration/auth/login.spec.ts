import { randomUUID } from "node:crypto";

import request from "supertest";
import { describe, expect, it } from "vitest";

import { app } from "../../../src/app.js";
import { prisma } from "../../../src/shared/infra/prisma.js";
import { generateValidCpf } from "./auth-test-helpers.js";

const validPassword = "Senha@123";

function uniqueEmail(): string {
  return `login.${randomUUID()}@email.com`;
}

async function registerUser(input: { email?: string; cpf?: string; password?: string } = {}) {
  const payload = {
    firstName: "Lucas",
    lastName: "Fernandes",
    email: input.email ?? uniqueEmail(),
    password: input.password ?? validPassword,
    cpf: input.cpf ?? generateValidCpf()
  };

  const response = await request(app).post("/auth/register").send(payload).expect(201);

  return {
    payload,
    user: response.body.user
  };
}

describe("POST /auth/login", () => {
  it("logs in with e-mail and password", async () => {
    const { payload, user } = await registerUser();

    const response = await request(app).post("/auth/login").send({
      email: payload.email,
      password: validPassword
    });

    expect(response.status).toBe(200);
    expect(response.body.accessToken).toEqual(expect.any(String));
    expect(response.body.refreshToken).toEqual(expect.any(String));
    expect(response.body.user).toEqual(user);
    expect(response.body.user.passwordHash).toBeUndefined();
    expect(JSON.stringify(response.body)).not.toContain(payload.cpf);

    const persistedToken = await prisma.refreshToken.findFirstOrThrow({
      where: { userId: user.id },
      orderBy: { createdAt: "desc" }
    });

    expect(persistedToken.tokenHash).not.toBe(response.body.refreshToken);
    expect(response.body).not.toHaveProperty("refreshTokenHash");
  });

  it("logs in with CPF and password", async () => {
    const { payload, user } = await registerUser();

    const response = await request(app).post("/auth/login").send({
      cpf: payload.cpf,
      password: validPassword
    });

    expect(response.status).toBe(200);
    expect(response.body.accessToken).toEqual(expect.any(String));
    expect(response.body.refreshToken).toEqual(expect.any(String));
    expect(response.body.user).toEqual(user);
    expect(response.body.user.passwordHash).toBeUndefined();
    expect(JSON.stringify(response.body)).not.toContain(payload.cpf);
  });

  it("rejects invalid e-mail credentials", async () => {
    const response = await request(app).post("/auth/login").send({
      email: uniqueEmail(),
      password: "wrong-password"
    });

    expect(response.status).toBe(401);
    expect(response.body.error.code).toBe("INVALID_CREDENTIALS");
  });

  it("rejects invalid CPF credentials", async () => {
    const response = await request(app).post("/auth/login").send({
      cpf: generateValidCpf(),
      password: "wrong-password"
    });

    expect(response.status).toBe(401);
    expect(response.body.error.code).toBe("INVALID_CREDENTIALS");
  });
});
