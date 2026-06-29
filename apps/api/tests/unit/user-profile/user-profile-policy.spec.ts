import { describe, expect, it } from "vitest";

import { USER_PROFILE_ERROR_CODES } from "../../../src/modules/user-profile/user-profile.errors.js";
import { validateUserProfileInput } from "../../../src/modules/user-profile/user-profile-policy.js";

const validProfile = {
  firstName: "Lucas",
  lastName: "Fernandes",
  displayName: "Lucas",
  avatarUrl: "https://example.com/avatar.png",
  currencyCode: "BRL",
  locale: "pt-BR",
  timezone: "America/Recife",
  financialMonthStartDay: 1
};

describe("validateUserProfileInput", () => {
  it("accepts a valid profile", () => {
    expect(validateUserProfileInput(validProfile)).toEqual(validProfile);
  });

  it("accepts a valid displayName", () => {
    expect(validateUserProfileInput({ displayName: "Lucas" }).displayName).toBe("Lucas");
  });

  it("rejects a too long displayName", () => {
    expect(() => validateUserProfileInput({ displayName: "a".repeat(101) })).toThrow(
      expect.objectContaining({ code: USER_PROFILE_ERROR_CODES.displayNameTooLong })
    );
  });

  it("rejects a too long firstName", () => {
    expect(() => validateUserProfileInput({ firstName: "a".repeat(101) })).toThrow(
      expect.objectContaining({ code: USER_PROFILE_ERROR_CODES.userNameTooLong })
    );
  });

  it("rejects a too long lastName", () => {
    expect(() => validateUserProfileInput({ lastName: "a".repeat(101) })).toThrow(
      expect.objectContaining({ code: USER_PROFILE_ERROR_CODES.userNameTooLong })
    );
  });

  it("accepts a valid avatarUrl", () => {
    expect(validateUserProfileInput({ avatarUrl: "https://example.com/avatar.png" }).avatarUrl).toBe(
      "https://example.com/avatar.png"
    );
  });

  it("rejects an invalid avatarUrl", () => {
    expect(() => validateUserProfileInput({ avatarUrl: "not-a-url" })).toThrow(
      expect.objectContaining({ code: USER_PROFILE_ERROR_CODES.invalidAvatarUrl })
    );
  });

  it("accepts BRL as currencyCode", () => {
    expect(validateUserProfileInput({ currencyCode: "BRL" }).currencyCode).toBe("BRL");
  });

  it("rejects an invalid currencyCode", () => {
    expect(() => validateUserProfileInput({ currencyCode: "USD" })).toThrow(
      expect.objectContaining({ code: USER_PROFILE_ERROR_CODES.invalidCurrencyCode })
    );
  });

  it("accepts pt-BR as locale", () => {
    expect(validateUserProfileInput({ locale: "pt-BR" }).locale).toBe("pt-BR");
  });

  it("rejects an invalid locale", () => {
    expect(() => validateUserProfileInput({ locale: "en-US" })).toThrow(
      expect.objectContaining({ code: USER_PROFILE_ERROR_CODES.invalidLocale })
    );
  });

  it("accepts a valid timezone", () => {
    expect(validateUserProfileInput({ timezone: "America/Recife" }).timezone).toBe("America/Recife");
  });

  it("rejects an invalid timezone", () => {
    expect(() => validateUserProfileInput({ timezone: "Not/AZone" })).toThrow(
      expect.objectContaining({ code: USER_PROFILE_ERROR_CODES.invalidTimezone })
    );
  });

  it("rejects financialMonthStartDay lower than 1", () => {
    expect(() => validateUserProfileInput({ financialMonthStartDay: 0 })).toThrow(
      expect.objectContaining({ code: USER_PROFILE_ERROR_CODES.invalidFinancialMonthStartDay })
    );
  });

  it("rejects financialMonthStartDay greater than 28", () => {
    expect(() => validateUserProfileInput({ financialMonthStartDay: 29 })).toThrow(
      expect.objectContaining({ code: USER_PROFILE_ERROR_CODES.invalidFinancialMonthStartDay })
    );
  });
});
