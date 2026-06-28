import { passwordTooShortError, passwordTooWeakError } from "./auth.errors.js";

export function assertStrongPassword(password: string): void {
  if (password.length < 8) {
    throw passwordTooShortError();
  }

  if (!/[a-z]/.test(password) || !/[A-Z]/.test(password) || !/[^A-Za-z0-9]/.test(password)) {
    throw passwordTooWeakError();
  }
}
