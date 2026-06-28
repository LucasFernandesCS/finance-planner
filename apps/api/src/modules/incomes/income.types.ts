export const INCOME_TYPES = ["MONTHLY", "EXTRA"] as const;

export type IncomeType = (typeof INCOME_TYPES)[number];

export type IncomeInput = {
  title: string;
  amountInCents: number;
  type: IncomeType;
  referenceMonth: string;
  description?: string | null;
};

export type Income = IncomeInput & {
  id: string;
  userId: string;
};

export type PublicIncome = Omit<Income, "userId">;
