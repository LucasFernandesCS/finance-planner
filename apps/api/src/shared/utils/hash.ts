import { createHmac } from "node:crypto";

import bcrypt from "bcryptjs";

import { env } from "../env.js";

const passwordSaltRounds = 12;

function hmacSha256(value: string, secret: string): string {
  return createHmac("sha256", secret).update(value).digest("hex");
}

export function hashCpf(normalizedCpf: string): string {
  return hmacSha256(normalizedCpf, env.cpfHashSecret);
}

export async function hashPassword(password: string): Promise<string> {
  return bcrypt.hash(password, passwordSaltRounds);
}

export async function comparePassword(password: string, passwordHash: string): Promise<boolean> {
  return bcrypt.compare(password, passwordHash);
}

export function hashRefreshToken(refreshToken: string): string {
  return hmacSha256(refreshToken, env.refreshTokenHashSecret);
}
