export function normalizeCpf(cpf: string): string {
  return cpf.replace(/\D/g, "");
}

export function isRepeatedCpf(cpf: string): boolean {
  return /^(\d)\1{10}$/.test(cpf);
}

function calculateCheckDigit(digits: string, startWeight: number): number {
  const sum = [...digits].reduce((accumulator, digit, index) => {
    return accumulator + Number(digit) * (startWeight - index);
  }, 0);
  const remainder = (sum * 10) % 11;

  return remainder === 10 ? 0 : remainder;
}

export function isValidCpf(value: string): boolean {
  const cpf = normalizeCpf(value);

  if (cpf.length !== 11 || isRepeatedCpf(cpf)) {
    return false;
  }

  const firstCheckDigit = calculateCheckDigit(cpf.slice(0, 9), 10);
  const secondCheckDigit = calculateCheckDigit(cpf.slice(0, 10), 11);

  return firstCheckDigit === Number(cpf[9]) && secondCheckDigit === Number(cpf[10]);
}
