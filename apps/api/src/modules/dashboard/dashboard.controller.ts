import type { Request, Response } from "express";

import type { AuthenticatedRequest } from "../../shared/middlewares/auth.js";
import { unauthorizedError } from "./dashboard.errors.js";
import { getDashboardSummary } from "./dashboard.service.js";

function getUserId(request: Request): string {
  const user = (request as AuthenticatedRequest).user;
  if (!user) {
    throw unauthorizedError();
  }
  return user.id;
}

export async function getDashboardSummaryController(request: Request, response: Response): Promise<void> {
  const month = typeof request.query.month === "string" ? request.query.month : undefined;
  response.status(200).json(await getDashboardSummary(getUserId(request), month));
}
