import { beforeEach, describe, expect, it, vi } from "vitest";

import { AUTH_ERROR_CODES } from "../../../src/modules/auth/auth.errors.js";
import type { LoginInput, RegisterInput } from "../../../src/modules/auth/auth.types.js";

vi.mock("../../../src/modules/auth/auth.repository.js", () => ({
  createRefreshToken: vi.fn(),
  createUser: vi.fn(),
  findUserByCpfHash: vi.fn(),
  findUserByEmail: vi.fn()
}));

vi.mock("../../../src/shared/utils/hash.js", () => ({
  comparePassword: vi.fn(),
  hashCpf: vi.fn(),
  hashPassword: vi.fn(),
  hashRefreshToken: vi.fn()
}));

vi.mock("../../../src/shared/utils/token.js", () => ({
  generateAccessToken: vi.fn(),
  generateRefreshToken: vi.fn(),
  getRefreshTokenExpiresAt: vi.fn()
}));

import { loginUser, registerUser } from "../../../src/modules/auth/auth.service.js";
import {
  createRefreshToken,
  createUser,
  findUserByCpfHash,
  findUserByEmail
} from "../../../src/modules/auth/auth.repository.js";
import {
  comparePassword,
  hashCpf,
  hashPassword,
  hashRefreshToken
} from "../../../src/shared/utils/hash.js";
import {
  generateAccessToken,
  generateRefreshToken,
  getRefreshTokenExpiresAt
} from "../../../src/shared/utils/token.js";

const registerInput: RegisterInput = {
  firstName: "Lucas",
  lastName: "Fernandes",
  email: "Lucas@Email.com",
  password: "Senha@123",
  cpf: "529.982.247-25"
};

const publicUser = {
  id: "user-id",
  firstName: "Lucas",
  lastName: "Fernandes",
  email: "lucas@email.com"
};

const authenticatedUser = {
  ...publicUser,
  cpfHash: "cpf-hash",
  passwordHash: "password-hash"
};

describe("AuthService", () => {
  beforeEach(() => {
    vi.clearAllMocks();

    vi.mocked(hashCpf).mockReturnValue("cpf-hash");
    vi.mocked(hashPassword).mockResolvedValue("password-hash");
    vi.mocked(hashRefreshToken).mockReturnValue("refresh-token-hash");
    vi.mocked(comparePassword).mockResolvedValue(true);
    vi.mocked(generateAccessToken).mockReturnValue("access-token");
    vi.mocked(generateRefreshToken).mockReturnValue("refresh-token");
    vi.mocked(getRefreshTokenExpiresAt).mockReturnValue(new Date("2026-06-28T12:30:00.000Z"));
    vi.mocked(findUserByEmail).mockResolvedValue(null);
    vi.mocked(findUserByCpfHash).mockResolvedValue(null);
    vi.mocked(createUser).mockResolvedValue(publicUser);
    vi.mocked(createRefreshToken).mockResolvedValue(undefined);
  });

  it("registers a user with valid data", async () => {
    await expect(registerUser(registerInput)).resolves.toEqual({ user: publicUser });

    expect(findUserByEmail).toHaveBeenCalledWith("lucas@email.com");
    expect(findUserByCpfHash).toHaveBeenCalledWith("cpf-hash");
    expect(createUser).toHaveBeenCalledWith(
      expect.objectContaining({
        email: "lucas@email.com",
        cpfHash: "cpf-hash",
        passwordHash: "password-hash"
      })
    );
  });

  it("rejects registration with duplicated e-mail", async () => {
    vi.mocked(findUserByEmail).mockResolvedValue(authenticatedUser);

    await expect(registerUser(registerInput)).rejects.toMatchObject({
      code: AUTH_ERROR_CODES.emailAlreadyExists,
      statusCode: 409
    });
  });

  it("rejects registration with duplicated CPF", async () => {
    vi.mocked(findUserByCpfHash).mockResolvedValue(authenticatedUser);

    await expect(registerUser(registerInput)).rejects.toMatchObject({
      code: AUTH_ERROR_CODES.cpfAlreadyExists,
      statusCode: 409
    });
  });

  it("rejects registration with invalid CPF", async () => {
    await expect(registerUser({ ...registerInput, cpf: "000.000.000-01" })).rejects.toMatchObject({
      code: AUTH_ERROR_CODES.invalidCpf,
      statusCode: 400
    });

    expect(findUserByEmail).not.toHaveBeenCalled();
    expect(findUserByCpfHash).not.toHaveBeenCalled();
  });

  it("logs in with e-mail and password", async () => {
    vi.mocked(findUserByEmail).mockResolvedValue(authenticatedUser);

    const input: LoginInput = {
      email: "Lucas@Email.com",
      password: "Senha@123"
    };

    await expect(loginUser(input)).resolves.toEqual({
      accessToken: "access-token",
      refreshToken: "refresh-token",
      user: publicUser
    });
    expect(findUserByEmail).toHaveBeenCalledWith("lucas@email.com");
    expect(comparePassword).toHaveBeenCalledWith("Senha@123", "password-hash");
    expect(createRefreshToken).toHaveBeenCalledWith({
      userId: "user-id",
      tokenHash: "refresh-token-hash",
      expiresAt: new Date("2026-06-28T12:30:00.000Z")
    });
  });

  it("logs in with CPF and password", async () => {
    vi.mocked(findUserByCpfHash).mockResolvedValue(authenticatedUser);

    await expect(
      loginUser({
        cpf: "529.982.247-25",
        password: "Senha@123"
      })
    ).resolves.toEqual({
      accessToken: "access-token",
      refreshToken: "refresh-token",
      user: publicUser
    });
    expect(hashCpf).toHaveBeenCalledWith("52998224725");
    expect(findUserByCpfHash).toHaveBeenCalledWith("cpf-hash");
  });

  it("rejects login with a missing user", async () => {
    await expect(
      loginUser({
        email: "missing@email.com",
        password: "Senha@123"
      })
    ).rejects.toMatchObject({
      code: AUTH_ERROR_CODES.invalidCredentials,
      statusCode: 401
    });
  });

  it("rejects login with an incorrect password", async () => {
    vi.mocked(findUserByEmail).mockResolvedValue(authenticatedUser);
    vi.mocked(comparePassword).mockResolvedValue(false);

    await expect(
      loginUser({
        email: "lucas@email.com",
        password: "wrong-password"
      })
    ).rejects.toMatchObject({
      code: AUTH_ERROR_CODES.invalidCredentials,
      statusCode: 401
    });
  });
});
