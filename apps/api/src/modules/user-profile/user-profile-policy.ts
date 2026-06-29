import {
  displayNameTooLongError,
  invalidAvatarUrlError,
  invalidCurrencyCodeError,
  invalidFinancialMonthStartDayError,
  invalidLocaleError,
  invalidTimezoneError,
  userNameTooLongError,
  validationError
} from "./user-profile.errors.js";
import type { PrimaryGoalInput, UserProfileInput } from "./user-profile.types.js";

export const MAX_PROFILE_NAME_LENGTH = 100;
export const DEFAULT_PROFILE = {
  currencyCode: "BRL",
  locale: "pt-BR",
  timezone: "America/Recife",
  financialMonthStartDay: 1,
  onboardingCompleted: false
} as const;

function normalizeText(value: string | null | undefined): string | null | undefined {
  if (value === null || value === undefined) {
    return value;
  }

  return value.trim();
}

function isValidUrl(value: string): boolean {
  try {
    const parsed = new URL(value);
    return parsed.protocol === "http:" || parsed.protocol === "https:";
  } catch {
    return false;
  }
}

function isValidTimezone(value: string): boolean {
  try {
    new Intl.DateTimeFormat("pt-BR", { timeZone: value });
    return true;
  } catch {
    return false;
  }
}

export function validateUserProfileInput(input: unknown): UserProfileInput {
  if (!input || typeof input !== "object") {
    throw validationError();
  }

  const candidate = input as UserProfileInput;
  const result: UserProfileInput = {};

  if (candidate.firstName !== undefined) {
    if (typeof candidate.firstName !== "string") {
      throw validationError();
    }
    if (candidate.firstName.trim().length > MAX_PROFILE_NAME_LENGTH) {
      throw userNameTooLongError();
    }
    result.firstName = candidate.firstName.trim();
  }

  if (candidate.lastName !== undefined) {
    if (typeof candidate.lastName !== "string") {
      throw validationError();
    }
    if (candidate.lastName.trim().length > MAX_PROFILE_NAME_LENGTH) {
      throw userNameTooLongError();
    }
    result.lastName = candidate.lastName.trim();
  }

  if (candidate.displayName !== undefined) {
    if (candidate.displayName !== null && typeof candidate.displayName !== "string") {
      throw validationError();
    }
    const displayName = normalizeText(candidate.displayName);
    if (typeof displayName === "string" && displayName.length > MAX_PROFILE_NAME_LENGTH) {
      throw displayNameTooLongError();
    }
    result.displayName = displayName;
  }

  if (candidate.avatarUrl !== undefined) {
    if (candidate.avatarUrl !== null && typeof candidate.avatarUrl !== "string") {
      throw validationError();
    }
    const avatarUrl = normalizeText(candidate.avatarUrl);
    if (typeof avatarUrl === "string" && avatarUrl.length > 0 && !isValidUrl(avatarUrl)) {
      throw invalidAvatarUrlError();
    }
    result.avatarUrl = avatarUrl || null;
  }

  if (candidate.currencyCode !== undefined) {
    if (candidate.currencyCode !== "BRL") {
      throw invalidCurrencyCodeError();
    }
    result.currencyCode = candidate.currencyCode;
  }

  if (candidate.locale !== undefined) {
    if (candidate.locale !== "pt-BR") {
      throw invalidLocaleError();
    }
    result.locale = candidate.locale;
  }

  if (candidate.timezone !== undefined) {
    if (typeof candidate.timezone !== "string" || !isValidTimezone(candidate.timezone)) {
      throw invalidTimezoneError();
    }
    result.timezone = candidate.timezone;
  }

  if (candidate.financialMonthStartDay !== undefined) {
    if (
      typeof candidate.financialMonthStartDay !== "number" ||
      !Number.isInteger(candidate.financialMonthStartDay) ||
      candidate.financialMonthStartDay < 1 ||
      candidate.financialMonthStartDay > 28
    ) {
      throw invalidFinancialMonthStartDayError();
    }
    result.financialMonthStartDay = candidate.financialMonthStartDay;
  }

  return result;
}

export function validatePrimaryGoalInput(input: unknown): PrimaryGoalInput {
  if (!input || typeof input !== "object") {
    throw validationError();
  }

  const candidate = input as PrimaryGoalInput;

  if (candidate.primaryGoalId !== null && typeof candidate.primaryGoalId !== "string") {
    throw validationError();
  }

  return { primaryGoalId: candidate.primaryGoalId };
}
