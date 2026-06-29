export type UserProfileInput = {
  firstName?: string;
  lastName?: string;
  displayName?: string | null;
  avatarUrl?: string | null;
  currencyCode?: string;
  locale?: string;
  timezone?: string;
  financialMonthStartDay?: number;
};

export type PrimaryGoalInput = {
  primaryGoalId: string | null;
};

export type PublicUser = {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
};

export type PublicProfile = {
  displayName: string | null;
  avatarUrl: string | null;
  currencyCode: string;
  locale: string;
  timezone: string;
  financialMonthStartDay: number;
  primaryGoalId: string | null;
  onboardingCompleted: boolean;
};

export type UserProfileResult = {
  user: PublicUser;
  profile: PublicProfile;
};
