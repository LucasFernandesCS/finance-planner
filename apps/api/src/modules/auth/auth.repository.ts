import { prisma } from "../../shared/infra/prisma.js";
import type { AuthenticatedUser, RegisterInput } from "./auth.types.js";

const userSelection = {
  id: true,
  firstName: true,
  lastName: true,
  email: true,
  cpfHash: true,
  passwordHash: true
} as const;

export async function findUserByEmail(email: string): Promise<AuthenticatedUser | null> {
  return prisma.user.findUnique({
    where: { email },
    select: userSelection
  });
}

export async function findUserByCpfHash(cpfHash: string): Promise<AuthenticatedUser | null> {
  return prisma.user.findUnique({
    where: { cpfHash },
    select: userSelection
  });
}

export async function createUser(input: RegisterInput & { cpfHash: string; passwordHash: string }) {
  return prisma.user.create({
    data: {
      firstName: input.firstName,
      lastName: input.lastName,
      email: input.email,
      cpfHash: input.cpfHash,
      passwordHash: input.passwordHash
    },
    select: {
      id: true,
      firstName: true,
      lastName: true,
      email: true
    }
  });
}

export async function createRefreshToken(input: {
  userId: string;
  tokenHash: string;
  expiresAt: Date;
}): Promise<void> {
  await prisma.refreshToken.create({
    data: input
  });
}
