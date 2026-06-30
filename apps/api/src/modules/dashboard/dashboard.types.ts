export type DashboardAlertType =
  | "NEGATIVE_SURPLUS"
  | "OVERDUE_DEBT"
  | "RESERVE_SETUP_REQUIRED"
  | "RESERVE_BELOW_TARGET"
  | "PRIMARY_GOAL_SETUP_REQUIRED"
  | "FIXED_EXPENSES_EXCEED_MONTHLY_INCOME"
  | "NO_INCOME_REGISTERED";

export type DashboardAlertSeverity = "LOW" | "MEDIUM" | "HIGH";

export interface DashboardAlert {
  type: DashboardAlertType;
  severity: DashboardAlertSeverity;
  message: string;
}

export interface DashboardPeriod {
  referenceMonth: string;
  startDate: string;
  endDate: string;
  timezone: string;
  financialMonthStartDay: number;
}

export interface DashboardProfile {
  timezone: string;
  financialMonthStartDay: number;
  primaryGoalId: string | null;
}

export interface DashboardReserve {
  currentBalanceInCents: number;
  monthlyFixedExpensesInCents: number;
  targetAmountInCents: number;
  completionPercentage: number;
  status: string;
}

export interface DashboardPrimaryGoal {
  id: string;
  title: string;
  targetAmountInCents: number;
  currentAmountInCents: number;
  completionPercentage: number;
  status: string;
  deadlineDate: string;
}

export interface DashboardSummary {
  period: DashboardPeriod;
  income: { monthlyIncomeInCents: number; extraIncomeInCents: number; totalIncomeInCents: number };
  expenses: {
    fixedExpensesInCents: number;
    variableExpensesInCents: number;
    debtPaymentsInCents: number;
    totalExpensesInCents: number;
  };
  cashFlow: {
    expectedSurplusInCents: number;
    recurringSurplusInCents: number;
    fixedCommitmentRate: number;
    expenseRate: number;
  };
  debts: { openDebtBalanceInCents: number; openDebtsCount: number; overdueDebtsCount: number };
  reserve: DashboardReserve | null;
  reserveSetupRequired: boolean;
  primaryGoal: DashboardPrimaryGoal | null;
  primaryGoalSetupRequired: boolean;
  alerts: DashboardAlert[];
}
