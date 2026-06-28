import type { Request, Response } from "express";

import type { AuthenticatedRequest } from "../../shared/middlewares/auth.js";
import { unauthorizedError, validationError } from "./expense.errors.js";
import { parseFixedExpenseInput } from "./expense.schemas.js";
import {
  createUserFixedExpense,
  deleteUserFixedExpense,
  listUserFixedExpenses,
  updateUserFixedExpense
} from "./fixed-expense.service.js";

function getUserId(request: Request): string {
  const user = (request as AuthenticatedRequest).user;

  if (!user) {
    throw unauthorizedError();
  }

  return user.id;
}

function getFixedExpenseId(request: Request): string {
  const { fixedExpenseId } = request.params;

  if (!fixedExpenseId || Array.isArray(fixedExpenseId)) {
    throw validationError();
  }

  return fixedExpenseId;
}

export async function createFixedExpenseController(request: Request, response: Response): Promise<void> {
  const result = await createUserFixedExpense(getUserId(request), parseFixedExpenseInput(request.body));

  response.status(201).json(result);
}

export async function listFixedExpensesController(request: Request, response: Response): Promise<void> {
  const result = await listUserFixedExpenses(getUserId(request));

  response.status(200).json(result);
}

export async function updateFixedExpenseController(request: Request, response: Response): Promise<void> {
  const result = await updateUserFixedExpense(
    getUserId(request),
    getFixedExpenseId(request),
    parseFixedExpenseInput(request.body)
  );

  response.status(200).json(result);
}

export async function deleteFixedExpenseController(request: Request, response: Response): Promise<void> {
  const result = await deleteUserFixedExpense(getUserId(request), getFixedExpenseId(request));

  response.status(200).json(result);
}
