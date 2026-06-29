import type { Request, Response } from "express";

import type { AuthenticatedRequest } from "../../shared/middlewares/auth.js";
import { unauthorizedError } from "./user-profile.errors.js";
import { parsePrimaryGoalInput, parseUserProfileInput } from "./user-profile.schemas.js";
import {
  getAuthenticatedUserProfile,
  setPrimaryGoal,
  updateAuthenticatedUserProfile
} from "./user-profile.service.js";

function getUserId(request: Request): string {
  const user = (request as AuthenticatedRequest).user;

  if (!user) {
    throw unauthorizedError();
  }

  return user.id;
}

export async function getMeController(request: Request, response: Response): Promise<void> {
  const result = await getAuthenticatedUserProfile(getUserId(request));

  response.status(200).json(result);
}

export async function updateMeProfileController(request: Request, response: Response): Promise<void> {
  const result = await updateAuthenticatedUserProfile(getUserId(request), parseUserProfileInput(request.body));

  response.status(200).json(result);
}

export async function updatePrimaryGoalController(request: Request, response: Response): Promise<void> {
  const result = await setPrimaryGoal(getUserId(request), parsePrimaryGoalInput(request.body));

  response.status(200).json(result);
}
