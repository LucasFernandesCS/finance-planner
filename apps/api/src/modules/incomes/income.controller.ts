import type { Request, Response } from "express";

import type { AuthenticatedRequest } from "../../shared/middlewares/auth.js";
import { unauthorizedError, validationError } from "./income.errors.js";
import { parseIncomeInput, parseReferenceMonth } from "./income.schemas.js";
import {
  createUserIncome,
  deleteUserIncome,
  listUserIncomes,
  updateUserIncome
} from "./income.service.js";

function getUserId(request: Request): string {
  const user = (request as AuthenticatedRequest).user;

  if (!user) {
    throw unauthorizedError();
  }

  return user.id;
}

function getIncomeId(request: Request): string {
  const { incomeId } = request.params;

  if (!incomeId || Array.isArray(incomeId)) {
    throw validationError();
  }

  return incomeId;
}

export async function createIncomeController(request: Request, response: Response): Promise<void> {
  const result = await createUserIncome(getUserId(request), parseIncomeInput(request.body));

  response.status(201).json(result);
}

export async function listIncomesController(request: Request, response: Response): Promise<void> {
  const result = await listUserIncomes(getUserId(request), parseReferenceMonth(request.query.month));

  response.status(200).json(result);
}

export async function updateIncomeController(request: Request, response: Response): Promise<void> {
  const result = await updateUserIncome(
    getUserId(request),
    getIncomeId(request),
    parseIncomeInput(request.body)
  );

  response.status(200).json(result);
}

export async function deleteIncomeController(request: Request, response: Response): Promise<void> {
  const result = await deleteUserIncome(getUserId(request), getIncomeId(request));

  response.status(200).json(result);
}
