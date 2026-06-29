import {
  forbiddenError,
  goalNotFoundError,
  validationError
} from "./user-profile.errors.js";
import { validatePrimaryGoalInput, validateUserProfileInput } from "./user-profile-policy.js";
import {
  createDefaultProfile,
  findGoalById,
  findProfileByUserId,
  findUserById,
  setPrimaryGoalId,
  toPublicProfile,
  toUserProfileResult,
  updateUserAndProfile
} from "./user-profile.repository.js";
import type { PublicProfile, UserProfileResult } from "./user-profile.types.js";

async function getExistingUser(userId: string) {
  const user = await findUserById(userId);

  if (!user) {
    throw validationError();
  }

  return user;
}

async function ensureProfile(userId: string) {
  return (await findProfileByUserId(userId)) ?? (await createDefaultProfile(userId));
}

export async function getAuthenticatedUserProfile(userId: string): Promise<UserProfileResult> {
  const user = await getExistingUser(userId);
  const profile = await ensureProfile(userId);

  return toUserProfileResult(user, profile);
}

export async function updateAuthenticatedUserProfile(
  userId: string,
  input: unknown
): Promise<UserProfileResult> {
  await getExistingUser(userId);
  const profileInput = validateUserProfileInput(input);
  const result = await updateUserAndProfile(userId, profileInput);

  return toUserProfileResult(result.user, result.profile);
}

export async function setPrimaryGoal(
  userId: string,
  input: unknown
): Promise<{ profile: Pick<PublicProfile, "primaryGoalId"> }> {
  const { primaryGoalId } = validatePrimaryGoalInput(input);

  if (primaryGoalId) {
    const goal = await findGoalById(primaryGoalId);

    if (!goal) {
      throw goalNotFoundError();
    }

    if (goal.userId !== userId) {
      throw forbiddenError();
    }
  }

  const profile = await setPrimaryGoalId(userId, primaryGoalId);

  return { profile: { primaryGoalId: toPublicProfile(profile).primaryGoalId } };
}
