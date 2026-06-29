import { beforeEach, describe, expect, it, vi } from "vitest";

import { USER_PROFILE_ERROR_CODES } from "../../../src/modules/user-profile/user-profile.errors.js";
import {
  getAuthenticatedUserProfile,
  setPrimaryGoal,
  updateAuthenticatedUserProfile
} from "../../../src/modules/user-profile/user-profile.service.js";

vi.mock("../../../src/modules/user-profile/user-profile.repository.js", () => ({
  createDefaultProfile: vi.fn(async () => profile),
  findGoalById: vi.fn(async () => goal),
  findProfileByUserId: vi.fn(async () => profile),
  findUserById: vi.fn(async () => user),
  setPrimaryGoalId: vi.fn(async (_userId: string, primaryGoalId: string | null) => ({
    ...profile,
    primaryGoalId
  })),
  toPublicProfile: vi.fn((inputProfile: typeof profile) => ({
    displayName: inputProfile.displayName,
    avatarUrl: inputProfile.avatarUrl,
    currencyCode: inputProfile.currencyCode,
    locale: inputProfile.locale,
    timezone: inputProfile.timezone,
    financialMonthStartDay: inputProfile.financialMonthStartDay,
    primaryGoalId: inputProfile.primaryGoalId,
    onboardingCompleted: inputProfile.onboardingCompleted
  })),
  toUserProfileResult: vi.fn((inputUser: typeof user, inputProfile: typeof profile) => ({
    user: {
      id: inputUser.id,
      firstName: inputUser.firstName,
      lastName: inputUser.lastName,
      email: inputUser.email
    },
    profile: {
      displayName: inputProfile.displayName,
      avatarUrl: inputProfile.avatarUrl,
      currencyCode: inputProfile.currencyCode,
      locale: inputProfile.locale,
      timezone: inputProfile.timezone,
      financialMonthStartDay: inputProfile.financialMonthStartDay,
      primaryGoalId: inputProfile.primaryGoalId,
      onboardingCompleted: inputProfile.onboardingCompleted
    }
  })),
  updateUserAndProfile: vi.fn(async (_userId: string, input: object) => ({
    user: { ...user, ...input },
    profile: { ...profile, ...input }
  }))
}));

const user = {
  id: "user-id",
  firstName: "Lucas",
  lastName: "Fernandes",
  email: "lucas@email.com",
  passwordHash: "secret",
  cpfHash: "secret"
};

const profile = {
  id: "profile-id",
  userId: user.id,
  displayName: "Lucas",
  avatarUrl: null,
  currencyCode: "BRL",
  locale: "pt-BR",
  timezone: "America/Recife",
  financialMonthStartDay: 1,
  primaryGoalId: null,
  onboardingCompleted: false
};

const goal = {
  id: "goal-id",
  userId: user.id
};

describe("UserProfileService", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("returns the authenticated user's profile", async () => {
    await expect(getAuthenticatedUserProfile(user.id)).resolves.toEqual({
      user: expect.objectContaining({ id: user.id, email: user.email }),
      profile: expect.objectContaining({ currencyCode: "BRL" })
    });
  });

  it("creates the profile automatically when missing", async () => {
    const repository = await import("../../../src/modules/user-profile/user-profile.repository.js");
    vi.mocked(repository.findProfileByUserId).mockResolvedValueOnce(null);

    await getAuthenticatedUserProfile(user.id);

    expect(repository.createDefaultProfile).toHaveBeenCalledWith(user.id);
  });

  it("updates basic user data", async () => {
    const result = await updateAuthenticatedUserProfile(user.id, {
      firstName: "Lucas Atualizado",
      lastName: "Silva"
    });

    expect(result.user.firstName).toBe("Lucas Atualizado");
    expect(result.user.lastName).toBe("Silva");
  });

  it("updates profile data", async () => {
    const result = await updateAuthenticatedUserProfile(user.id, {
      displayName: "Lucas Dev",
      financialMonthStartDay: 10
    });

    expect(result.profile.displayName).toBe("Lucas Dev");
    expect(result.profile.financialMonthStartDay).toBe(10);
  });

  it("does not return sensitive data", async () => {
    const result = await getAuthenticatedUserProfile(user.id);

    expect(result.user).not.toHaveProperty("passwordHash");
    expect(result.user).not.toHaveProperty("cpfHash");
  });

  it("sets an owned primary goal", async () => {
    await expect(setPrimaryGoal(user.id, { primaryGoalId: goal.id })).resolves.toEqual({
      profile: expect.objectContaining({ primaryGoalId: goal.id })
    });
  });

  it("removes the primary goal with null", async () => {
    await expect(setPrimaryGoal(user.id, { primaryGoalId: null })).resolves.toEqual({
      profile: expect.objectContaining({ primaryGoalId: null })
    });
  });

  it("rejects a missing primary goal", async () => {
    const repository = await import("../../../src/modules/user-profile/user-profile.repository.js");
    vi.mocked(repository.findGoalById).mockResolvedValueOnce(null);

    await expect(setPrimaryGoal(user.id, { primaryGoalId: goal.id })).rejects.toMatchObject({
      code: USER_PROFILE_ERROR_CODES.goalNotFound
    });
  });

  it("rejects another user's primary goal", async () => {
    const repository = await import("../../../src/modules/user-profile/user-profile.repository.js");
    vi.mocked(repository.findGoalById).mockResolvedValueOnce({ ...goal, userId: "other-user" });

    await expect(setPrimaryGoal(user.id, { primaryGoalId: goal.id })).rejects.toMatchObject({
      code: USER_PROFILE_ERROR_CODES.forbidden
    });
  });
});
