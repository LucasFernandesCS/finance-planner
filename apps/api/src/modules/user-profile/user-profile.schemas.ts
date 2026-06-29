import { validatePrimaryGoalInput, validateUserProfileInput } from "./user-profile-policy.js";
import type { PrimaryGoalInput, UserProfileInput } from "./user-profile.types.js";

export function parseUserProfileInput(input: unknown): UserProfileInput {
  return validateUserProfileInput(input);
}

export function parsePrimaryGoalInput(input: unknown): PrimaryGoalInput {
  return validatePrimaryGoalInput(input);
}
