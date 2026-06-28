import { describe, expect, it } from "vitest";

import { normalizeCpf } from "../../../src/shared/utils/cpf.js";
import { hashCpf } from "../../../src/shared/utils/hash.js";

describe("CPF hash", () => {
  it("generates the same hash for the same normalized CPF", () => {
    const cpf = "52998224725";

    expect(hashCpf(cpf)).toBe(hashCpf(cpf));
  });

  it("generates the same hash for formatted and unformatted CPF after normalization", () => {
    const formattedCpfHash = hashCpf(normalizeCpf("529.982.247-25"));
    const unformattedCpfHash = hashCpf(normalizeCpf("52998224725"));

    expect(formattedCpfHash).toBe(unformattedCpfHash);
  });

  it("generates different hashes for different CPFs", () => {
    expect(hashCpf("52998224725")).not.toBe(hashCpf("16899535009"));
  });

  it("does not include the plain CPF in the hash", () => {
    const cpf = "52998224725";

    expect(hashCpf(cpf)).not.toContain(cpf);
  });
});
