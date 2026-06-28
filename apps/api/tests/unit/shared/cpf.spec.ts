import { describe, expect, it } from "vitest";

import { isRepeatedCpf, isValidCpf, normalizeCpf } from "../../../src/shared/utils/cpf.js";

describe("CPF utilities", () => {
  it("normalizes a CPF by removing non-numeric characters", () => {
    expect(normalizeCpf(" 529.982.247-25 ")).toBe("52998224725");
  });

  it("accepts a mathematically valid CPF", () => {
    expect(isValidCpf("529.982.247-25")).toBe(true);
  });

  it("rejects a mathematically invalid CPF", () => {
    expect(isValidCpf("000.000.000-01")).toBe(false);
  });

  it("rejects a CPF formed by repeated digits", () => {
    expect(isRepeatedCpf("00000000000")).toBe(true);
    expect(isValidCpf("000.000.000-00")).toBe(false);
  });

  it("rejects a CPF with fewer than 11 digits", () => {
    expect(isValidCpf("529.982.247-2")).toBe(false);
  });

  it("rejects a CPF with more than 11 digits", () => {
    expect(isValidCpf("529.982.247-255")).toBe(false);
  });
});
