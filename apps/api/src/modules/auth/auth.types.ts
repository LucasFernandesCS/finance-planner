import type { User } from "@prisma/client";

export type PublicUser = {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
};

export type RegisterInput = {
  firstName: string;
  lastName: string;
  email: string;
  password: string;
  cpf: string;
};

export type LoginInput = {
  email?: string;
  cpf?: string;
  password: string;
};

export type AuthenticatedUser = Pick<
  User,
  "id" | "firstName" | "lastName" | "email" | "cpfHash" | "passwordHash"
>;
