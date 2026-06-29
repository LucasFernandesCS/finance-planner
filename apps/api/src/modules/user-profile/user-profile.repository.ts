import { prisma } from "../../shared/infra/prisma.js";
import type { PublicProfile, PublicUser, UserProfileInput, UserProfileResult } from "./user-profile.types.js";

type UserRecord = {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
};

type ProfileRecord = {
  displayName: string | null;
  avatarUrl: string | null;
  currencyCode: string;
  locale: string;
  timezone: string;
  financialMonthStartDay: number;
  primaryGoalId: string | null;
  onboardingCompleted: boolean;
};

export function toPublicUser(user: UserRecord): PublicUser {
  return {
    id: user.id,
    firstName: user.firstName,
    lastName: user.lastName,
    email: user.email
  };
}

export function toPublicProfile(profile: ProfileRecord): PublicProfile {
  return {
    displayName: profile.displayName,
    avatarUrl: profile.avatarUrl,
    currencyCode: profile.currencyCode,
    locale: profile.locale,
    timezone: profile.timezone,
    financialMonthStartDay: profile.financialMonthStartDay,
    primaryGoalId: profile.primaryGoalId,
    onboardingCompleted: profile.onboardingCompleted
  };
}

export function toUserProfileResult(user: UserRecord, profile: ProfileRecord): UserProfileResult {
  return {
    user: toPublicUser(user),
    profile: toPublicProfile(profile)
  };
}

export async function findUserById(userId: string) {
  return prisma.user.findUnique({
    where: { id: userId }
  });
}

export async function findProfileByUserId(userId: string) {
  return prisma.userProfile.findUnique({
    where: { userId }
  });
}

export async function createDefaultProfile(userId: string) {
  return prisma.userProfile.create({
    data: { userId }
  });
}

export async function updateUserAndProfile(userId: string, input: UserProfileInput) {
  return prisma.$transaction(async (tx) => {
    const user = await tx.user.update({
      where: { id: userId },
      data: {
        ...(input.firstName !== undefined ? { firstName: input.firstName } : {}),
        ...(input.lastName !== undefined ? { lastName: input.lastName } : {})
      }
    });

    const profile = await tx.userProfile.upsert({
      where: { userId },
      create: {
        userId,
        displayName: input.displayName,
        avatarUrl: input.avatarUrl,
        currencyCode: input.currencyCode,
        locale: input.locale,
        timezone: input.timezone,
        financialMonthStartDay: input.financialMonthStartDay
      },
      update: {
        ...(input.displayName !== undefined ? { displayName: input.displayName } : {}),
        ...(input.avatarUrl !== undefined ? { avatarUrl: input.avatarUrl } : {}),
        ...(input.currencyCode !== undefined ? { currencyCode: input.currencyCode } : {}),
        ...(input.locale !== undefined ? { locale: input.locale } : {}),
        ...(input.timezone !== undefined ? { timezone: input.timezone } : {}),
        ...(input.financialMonthStartDay !== undefined
          ? { financialMonthStartDay: input.financialMonthStartDay }
          : {})
      }
    });

    return { user, profile };
  });
}

export async function findGoalById(goalId: string) {
  return prisma.goal.findUnique({
    where: { id: goalId },
    select: { id: true, userId: true }
  });
}

export async function setPrimaryGoalId(userId: string, primaryGoalId: string | null) {
  return prisma.userProfile.upsert({
    where: { userId },
    create: { userId, primaryGoalId },
    update: { primaryGoalId }
  });
}
