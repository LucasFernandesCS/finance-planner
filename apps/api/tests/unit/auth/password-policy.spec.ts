import { describe, expect, it } from "vitest";

import { AUTH_ERROR_CODES } from "../../../src/modules/auth/auth.errors.js";
import { assertStrongPassword } from "../../../src/modules/auth/auth.password-policy.js";

describe("auth password policy", () => {
  it("rejects a short password", () => {
    expect(() => assertStrongPassword("A@b123")).toThrowError(
      expect.objectContaining({ code: AUTH_ERROR_CODES.passwordTooShort })
    );
  });

  it("rejects a password without a lowercase letter", () => {
    expect(() => assertStrongPassword("PASSWORD@123")).toThrowError(
      expect.objectContaining({ code: AUTH_ERROR_CODES.passwordTooWeak })
    );
  });

  it("rejects a password without an uppercase letter", () => {
    expect(() => assertStrongPassword("password@123")).toThrowError(
      expect.objectContaining({ code: AUTH_ERROR_CODES.passwordTooWeak })
    );
  });

  it("rejects a password without a special character", () => {
    expect(() => assertStrongPassword("Password123")).toThrowError(
      expect.objectContaining({ code: AUTH_ERROR_CODES.passwordTooWeak })
    );
  });

  it("accepts a strong password", () => {
    expect(() => assertStrongPassword("Senha@123")).not.toThrow();
  });
});
