import { randomInt } from "node:crypto";

function calculateCheckDigit(digits: string, startWeight: number): number {
  const sum = [...digits].reduce((accumulator, digit, index) => {
    return accumulator + Number(digit) * (startWeight - index);
  }, 0);
  const remainder = (sum * 10) % 11;

  return remainder === 10 ? 0 : remainder;
}

export function generateValidCpf(): string {
  const base = Array.from({ length: 9 }, () => String(randomInt(0, 10))).join("");
  const firstCheckDigit = calculateCheckDigit(base, 10);
  const secondCheckDigit = calculateCheckDigit(`${base}${firstCheckDigit}`, 11);

  return `${base}${firstCheckDigit}${secondCheckDigit}`;
}
