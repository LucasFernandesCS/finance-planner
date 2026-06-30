export function formatMoney(amountInCents: number | null | undefined): string {
  return new Intl.NumberFormat("pt-BR", {
    style: "currency",
    currency: "BRL"
  }).format((amountInCents ?? 0) / 100);
}

export function reaisToCents(value: string): number {
  const normalized = value.replace(",", ".");
  return Math.round(Number(normalized) * 100);
}

export function centsToInputValue(amountInCents: number | null | undefined): string {
  return amountInCents ? String(amountInCents / 100) : "";
}
