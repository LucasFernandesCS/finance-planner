import type { Request, Response } from "express";

import type { AuthenticatedRequest } from "../../shared/middlewares/auth.js";
import { unauthorizedError, validationError } from "./goal.errors.js";
import { parseGoalContributionInput, parseGoalInput } from "./goal.schemas.js";
import {
  contributeToUserGoal,
  createUserGoal,
  deleteUserGoal,
  getUserGoal,
  listUserGoals,
  updateUserGoal
} from "./goal.service.js";

function getUserId(request: Request): string {
  const user = (request as AuthenticatedRequest).user;

  if (!user) {
    throw unauthorizedError();
  }

  return user.id;
}

function getGoalId(request: Request): string {
  const { goalId } = request.params;

  if (!goalId || Array.isArray(goalId)) {
    throw validationError();
  }

  return goalId;
}

export async function createGoalController(request: Request, response: Response): Promise<void> {
  const result = await createUserGoal(getUserId(request), parseGoalInput(request.body));

  response.status(201).json(result);
}

export async function listGoalsController(request: Request, response: Response): Promise<void> {
  const result = await listUserGoals(getUserId(request));

  response.status(200).json(result);
}

export async function getGoalController(request: Request, response: Response): Promise<void> {
  const result = await getUserGoal(getUserId(request), getGoalId(request));

  response.status(200).json(result);
}

export async function updateGoalController(request: Request, response: Response): Promise<void> {
  const result = await updateUserGoal(getUserId(request), getGoalId(request), parseGoalInput(request.body));

  response.status(200).json(result);
}

export async function deleteGoalController(request: Request, response: Response): Promise<void> {
  const result = await deleteUserGoal(getUserId(request), getGoalId(request));

  response.status(200).json(result);
}

export async function createGoalContributionController(request: Request, response: Response): Promise<void> {
  const result = await contributeToUserGoal(
    getUserId(request),
    getGoalId(request),
    parseGoalContributionInput(request.body)
  );

  response.status(201).json(result);
}
