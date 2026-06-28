import { randomUUID } from "node:crypto";

import request from "supertest";
import { describe, expect, it } from "vitest";

import { app } from "../../../src/app.js";
import { prisma } from "../../../src/shared/infra/prisma.js";
import { generateValidCpf } from "./auth-test-helpers.js";

function registrationPayload(overrides: Partial<Record<string, string>> = {}) {
  const id = randomUUID();

  return {
    firstName: "Lucas",
    lastName: "Fernandes",
    email: `lucas.${id}@email.com`,
    password: "Senha@123",
    cpf: generateValidCpf(),
    ...overrides
  };
}

describe("POST /auth/register", () => {
  it("registers a user with valid data", async () => {
    const payload = registrationPayload();
    const response = await request(app).post("/auth/register").send(payload);

    expect(response.status).toBe(201);
    expect(response.body.user).toEqual({
      id: expect.any(String),
      firstName: "Lucas",
      lastName: "Fernandes",
      email: expect.stringContaining("@email.com")
    });
    expect(response.body.user.passwordHash).toBeUndefined();
    expect(JSON.stringify(response.body)).not.toContain(payload.cpf);

    const persistedUser = await prisma.user.findUniqueOrThrow({
      where: { email: payload.email }
    });

    expect(persistedUser.passwordHash).not.toBe(payload.password);
    expect(persistedUser.cpfHash).not.toBe(payload.cpf);
  });

  it("rejects a mathematically invalid CPF", async () => {
    const response = await request(app)
      .post("/auth/register")
      .send(registrationPayload({ cpf: "000.000.000-01" }));

    expect(response.status).toBe(400);
    expect(response.body.error.code).toBe("INVALID_CPF");
  });

  it("rejects a CPF formed by repeated digits", async () => {
    const response = await request(app)
      .post("/auth/register")
      .send(registrationPayload({ cpf: "000.000.000-00" }));

    expect(response.status).toBe(400);
    expect(response.body.error.code).toBe("INVALID_CPF");
  });

  it("rejects an already registered CPF", async () => {
    const firstPayload = registrationPayload();
    const duplicatePayload = registrationPayload({ cpf: firstPayload.cpf });

    await request(app).post("/auth/register").send(firstPayload).expect(201);
    const response = await request(app).post("/auth/register").send(duplicatePayload);

    expect(response.status).toBe(409);
    expect(response.body.error.code).toBe("CPF_ALREADY_EXISTS");
  });

  it("rejects an already registered e-mail", async () => {
    const firstPayload = registrationPayload();
    const duplicatePayload = registrationPayload({
      email: firstPayload.email,
      cpf: generateValidCpf()
    });

    await request(app).post("/auth/register").send(firstPayload).expect(201);
    const response = await request(app).post("/auth/register").send(duplicatePayload);

    expect(response.status).toBe(409);
    expect(response.body.error.code).toBe("EMAIL_ALREADY_EXISTS");
  });

  it("rejects a password without minimum complexity", async () => {
    const response = await request(app)
      .post("/auth/register")
      .send(registrationPayload({ password: "PASSWORD123" }));

    expect(response.status).toBe(400);
    expect(response.body.error.code).toBe("PASSWORD_TOO_WEAK");
  });

  it("rejects a short password", async () => {
    const response = await request(app)
      .post("/auth/register")
      .send(registrationPayload({ password: "A@b123" }));

    expect(response.status).toBe(400);
    expect(response.body.error.code).toBe("PASSWORD_TOO_SHORT");
  });
});
