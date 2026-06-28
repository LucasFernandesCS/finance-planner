import type { Request, Response } from "express";

import type { AuthenticatedRequest } from "../../shared/middlewares/auth.js";
import { unauthorizedError, validationError } from "./expense.errors.js";
import { parseMonth, parseVariableExpenseInput } from "./expense.schemas.js";
import {
  createUserVariableExpense,
  deleteUserVariableExpense,
  listUserVariableExpenses,
  updateUserVariableExpense
} from "./variable-expense.service.js";

function getUserId(request: Request): string {
  const user = (request as AuthenticatedRequest).user;

  if (!user) {
    throw unauthorizedError();
  }

  return user.id;
}

function getVariableExpenseId(request: Request): string {
  const { variableExpenseId } = request.params;

  if (!variableExpenseId || Array.isArray(variableExpenseId)) {
    throw validationError();
  }

  return variableExpenseId;
}

export async function createVariableExpenseController(request: Request, response: Response): Promise<void> {
  const result = await createUserVariableExpense(getUserId(request), parseVariableExpenseInput(request.body));

  response.status(201).json(result);
}

export async function listVariableExpensesController(request: Request, response: Response): Promise<void> {
  const result = await listUserVariableExpenses(getUserId(request), parseMonth(request.query.month));

  response.status(200).json(result);
}

export async function updateVariableExpenseController(request: Request, response: Response): Promise<void> {
  const result = await updateUserVariableExpense(
    getUserId(request),
    getVariableExpenseId(request),
    parseVariableExpenseInput(request.body)
  );

  response.status(200).json(result);
}

export async function deleteVariableExpenseController(request: Request, response: Response): Promise<void> {
  const result = await deleteUserVariableExpense(getUserId(request), getVariableExpenseId(request));

  response.status(200).json(result);
}
