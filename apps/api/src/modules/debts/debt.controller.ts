import type { Request, Response } from "express";

import type { AuthenticatedRequest } from "../../shared/middlewares/auth.js";
import { unauthorizedError, validationError } from "./debt.errors.js";
import { parseDebtId } from "./debt.schemas.js";
import {
  createUserDebt,
  deleteUserDebt,
  getUserDebt,
  listUserDebts,
  payUserDebt,
  updateUserDebt
} from "./debt.service.js";

function getUserId(request: Request): string {
  const user = (request as AuthenticatedRequest).user;

  if (!user) {
    throw unauthorizedError();
  }

  return user.id;
}

function getDebtId(request: Request): string {
  const { debtId } = request.params;

  if (!debtId || Array.isArray(debtId)) {
    throw validationError();
  }

  return parseDebtId(debtId);
}

export async function createDebtController(request: Request, response: Response): Promise<void> {
  const result = await createUserDebt(getUserId(request), request.body);

  response.status(201).json(result);
}

export async function listDebtsController(request: Request, response: Response): Promise<void> {
  const result = await listUserDebts(getUserId(request));

  response.status(200).json(result);
}

export async function getDebtController(request: Request, response: Response): Promise<void> {
  const result = await getUserDebt(getUserId(request), getDebtId(request));

  response.status(200).json(result);
}

export async function updateDebtController(request: Request, response: Response): Promise<void> {
  const result = await updateUserDebt(getUserId(request), getDebtId(request), request.body);

  response.status(200).json(result);
}

export async function deleteDebtController(request: Request, response: Response): Promise<void> {
  const result = await deleteUserDebt(getUserId(request), getDebtId(request));

  response.status(200).json(result);
}

export async function payDebtController(request: Request, response: Response): Promise<void> {
  const result = await payUserDebt(getUserId(request), getDebtId(request), request.body);

  response.status(201).json(result);
}
