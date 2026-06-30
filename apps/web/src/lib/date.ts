export function currentMonth(): string {
  return new Date().toISOString().slice(0, 7);
}

export function currentDate(): string {
  return new Date().toISOString().slice(0, 10);
}

export function formatDate(value: string | null | undefined): string {
  if (!value) {
    return "-";
  }

  return new Intl.DateTimeFormat("pt-BR", { timeZone: "UTC" }).format(new Date(value));
}

export function calculateMonthsUntilDate(date: string, today = new Date()): number {
  if (!/^\d{4}-\d{2}-\d{2}$/.test(date)) {
    return 0;
  }

  const [year, month, day] = date.split("-").map(Number);
  const current = new Date(Date.UTC(today.getUTCFullYear(), today.getUTCMonth(), today.getUTCDate()));
  const deadline = new Date(Date.UTC(year, month - 1, day));

  if (Number.isNaN(deadline.getTime()) || deadline.getTime() <= current.getTime()) {
    return 0;
  }

  let months = (deadline.getUTCFullYear() - current.getUTCFullYear()) * 12;
  months += deadline.getUTCMonth() - current.getUTCMonth();

  if (deadline.getUTCDate() > current.getUTCDate()) {
    months += 1;
  }

  return Math.max(months, 0);
}
