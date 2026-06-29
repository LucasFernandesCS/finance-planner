export const DEBT_STATUSES = ["IN_PROGRESS", "OVERDUE", "PAID"] as const;
export type DebtStatus = (typeof DEBT_STATUSES)[number];

export const DEBT_TYPES = ["INSTALLMENT", "RECURRING", "REVOLVING", "INFORMAL_LOAN", "FINANCING", "OTHER"] as const;
export type DebtType = (typeof DEBT_TYPES)[number];

export interface DebtInput {
  title: string;
  creditor: string;
  type: DebtType;
  originalAmountInCents: number;
  installmentAmountInCents?: number | null;
  monthlyDueDay: number;
  description?: string | null;
}

export interface DebtPaymentInput {
  amountInCents: number;
  note?: string | null;
  paidAt?: Date;
}

export interface DebtOutput {
  id: string;
  title: string;
  creditor: string;
  type: DebtType;
  originalAmountInCents: number;
  currentBalanceInCents: number;
  installmentAmountInCents: number | null;
  monthlyDueDay: number;
  status: DebtStatus;
  description: string | null;
  createdAt?: string;
  updatedAt?: string;
}

export interface DebtPaymentOutput {
  id: string;
  debtId: string;
  amountInCents: number;
  paidAt: string;
  note: string | null;
}
