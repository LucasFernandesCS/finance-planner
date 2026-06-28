import { randomBytes } from "node:crypto";

import jwt from "jsonwebtoken";
import type { SignOptions } from "jsonwebtoken";

import { env } from "../env.js";

export function generateAccessToken(userId: string): string {
  return jwt.sign({ sub: userId }, env.jwtAccessSecret, {
    expiresIn: env.jwtAccessExpiresIn as SignOptions["expiresIn"]
  });
}

export function generateRefreshToken(): string {
  return randomBytes(48).toString("base64url");
}

export function getRefreshTokenExpiresAt(now = new Date()): Date {
  return new Date(now.getTime() + env.refreshTokenExpiresInMinutes * 60 * 1000);
}
