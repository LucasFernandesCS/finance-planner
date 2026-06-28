import { z } from "zod";

import type { LoginInput, RegisterInput } from "./auth.types.js";

export const registerSchema = z.object({
  firstName: z.string().trim().min(1),
  lastName: z.string().trim().min(1),
  email: z.email().transform((email) => email.trim().toLowerCase()),
  password: z.string().min(1),
  cpf: z.string().min(1)
});

export const loginSchema = z
  .object({
    email: z.email().transform((email) => email.trim().toLowerCase()).optional(),
    cpf: z.string().min(1).optional(),
    password: z.string().min(1)
  })
  .refine((data) => Boolean(data.email) !== Boolean(data.cpf), {
    message: "Provide either email or CPF."
  });

export function parseRegisterInput(input: unknown): RegisterInput {
  return registerSchema.parse(input);
}

export function parseLoginInput(input: unknown): LoginInput {
  return loginSchema.parse(input);
}
