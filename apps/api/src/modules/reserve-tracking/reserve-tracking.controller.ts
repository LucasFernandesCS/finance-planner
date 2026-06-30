import type { Request, Response } from "express";

import type { AuthenticatedRequest } from "../../shared/middlewares/auth.js";
import { unauthorizedError } from "./reserve-tracking.errors.js";
import {
  configureUserReserve,
  depositToUserReserve,
  getUserReserve,
  listUserReserveTransactions,
  updateUserReserve,
  withdrawFromUserReserve
} from "./reserve-tracking.service.js";

function getUserId(request: Request): string {
  const user = (request as AuthenticatedRequest).user;
  if (!user) {
    throw unauthorizedError();
  }
  return user.id;
}

export async function getReserveController(request: Request, response: Response): Promise<void> {
  response.status(200).json(await getUserReserve(getUserId(request)));
}

export async function configureReserveController(request: Request, response: Response): Promise<void> {
  response.status(201).json(await configureUserReserve(getUserId(request), request.body));
}

export async function updateReserveController(request: Request, response: Response): Promise<void> {
  response.status(200).json(await updateUserReserve(getUserId(request), request.body));
}

export async function depositReserveController(request: Request, response: Response): Promise<void> {
  response.status(201).json(await depositToUserReserve(getUserId(request), request.body));
}

export async function withdrawReserveController(request: Request, response: Response): Promise<void> {
  response.status(201).json(await withdrawFromUserReserve(getUserId(request), request.body));
}

export async function listReserveTransactionsController(request: Request, response: Response): Promise<void> {
  response.status(200).json(await listUserReserveTransactions(getUserId(request)));
}
