import type { Request, RequestHandler } from "express";
import jwt from "jsonwebtoken";

import { unauthorizedError } from "../../modules/incomes/income.errors.js";
import { env } from "../env.js";

export type AuthenticatedUser = {
  id: string;
};

export type AuthenticatedRequest = Request & {
  user?: AuthenticatedUser;
};

function getBearerToken(header: string | undefined): string | null {
  if (!header) {
    return null;
  }

  const [scheme, token] = header.split(" ");

  if (scheme !== "Bearer" || !token) {
    return null;
  }

  return token;
}

export const requireAuth: RequestHandler = (request, _response, next) => {
  try {
    const token = getBearerToken(request.headers.authorization);

    if (!token) {
      throw unauthorizedError();
    }

    const payload = jwt.verify(token, env.jwtAccessSecret);

    if (typeof payload !== "object" || typeof payload.sub !== "string") {
      throw unauthorizedError();
    }

    (request as AuthenticatedRequest).user = { id: payload.sub };

    next();
  } catch (error) {
    if (error instanceof jwt.JsonWebTokenError || error instanceof jwt.TokenExpiredError) {
      next(unauthorizedError());
      return;
    }

    next(error);
  }
};
