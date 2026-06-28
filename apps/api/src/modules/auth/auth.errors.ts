import { AppError } from "../../shared/app-error.js";

export const AUTH_ERROR_CODES = {
  invalidCpf: "INVALID_CPF",
  cpfAlreadyExists: "CPF_ALREADY_EXISTS",
  emailAlreadyExists: "EMAIL_ALREADY_EXISTS",
  passwordTooShort: "PASSWORD_TOO_SHORT",
  passwordTooWeak: "PASSWORD_TOO_WEAK",
  invalidCredentials: "INVALID_CREDENTIALS",
  validationError: "VALIDATION_ERROR"
} as const;

export function invalidCpfError(): AppError {
  return new AppError("CPF inválido.", AUTH_ERROR_CODES.invalidCpf, 400);
}

export function cpfAlreadyExistsError(): AppError {
  return new AppError("CPF já cadastrado.", AUTH_ERROR_CODES.cpfAlreadyExists, 409);
}

export function emailAlreadyExistsError(): AppError {
  return new AppError("E-mail já cadastrado.", AUTH_ERROR_CODES.emailAlreadyExists, 409);
}

export function passwordTooShortError(): AppError {
  return new AppError("A senha deve ter no mínimo 8 caracteres.", AUTH_ERROR_CODES.passwordTooShort, 400);
}

export function passwordTooWeakError(): AppError {
  return new AppError(
    "A senha deve conter letra minúscula, letra maiúscula e caractere especial.",
    AUTH_ERROR_CODES.passwordTooWeak,
    400
  );
}

export function invalidCredentialsError(): AppError {
  return new AppError("Credenciais inválidas.", AUTH_ERROR_CODES.invalidCredentials, 401);
}

export function validationError(): AppError {
  return new AppError("Requisição inválida.", AUTH_ERROR_CODES.validationError, 400);
}
