export const RESERVE_STATUSES = ["BUILDING", "PROTECTED", "REPLENISHING"] as const;
export type ReserveStatus = (typeof RESERVE_STATUSES)[number];

export const RESERVE_TRANSACTION_TYPES = ["DEPOSIT", "WITHDRAWAL"] as const;
export type ReserveTransactionType = (typeof RESERVE_TRANSACTION_TYPES)[number];

export interface ReserveSetupInput {
  protectionMonths: number;
}

export interface ReserveTransactionInput {
  amountInCents: number;
  occurredAt?: Date;
  note?: string | null;
}

export interface EmergencyReserve {
  id: string;
  userId: string;
  protectionMonths: number;
  currentBalanceInCents: number;
  status: ReserveStatus;
}

export interface ReserveView {
  id: string;
  protectionMonths: number;
  currentBalanceInCents: number;
  monthlyFixedExpensesInCents: number;
  targetAmountInCents: number;
  completionPercentage: number;
  status: ReserveStatus;
}

export interface ReserveTransaction {
  id: string;
  reserveId: string;
  userId: string;
  type: ReserveTransactionType;
  amountInCents: number;
  occurredAt: string;
  note: string | null;
}

export type PublicReserveTransaction = Omit<ReserveTransaction, "userId" | "reserveId">;
