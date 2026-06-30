export type PublicUser = {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
};

export type Income = {
  id: string;
  title: string;
  amountInCents: number;
  type: "MONTHLY" | "EXTRA";
  referenceMonth: string;
  description?: string | null;
};

export type ExpenseCategory =
  | "WATER"
  | "ENERGY"
  | "CONDOMINIUM"
  | "RENT"
  | "IPVA"
  | "IPTU"
  | "INTERNET"
  | "HEALTH"
  | "EDUCATION"
  | "TRANSPORT"
  | "FOOD"
  | "GROCERIES"
  | "SHOPPING"
  | "LEISURE"
  | "SUBSCRIPTION"
  | "MAINTENANCE"
  | "TAX"
  | "DEBT_PAYMENT"
  | "OTHER";

export type FixedExpense = {
  id: string;
  title: string;
  amountInCents: number;
  category: ExpenseCategory;
  startMonth: string;
  description?: string | null;
};

export type VariableExpense = {
  id: string;
  title: string;
  amountInCents: number;
  category: ExpenseCategory;
  referenceMonth: string;
  description?: string | null;
};

export type GoalStatus = "NOT_STARTED" | "IN_PROGRESS" | "ACHIEVED";

export type Goal = {
  id: string;
  title: string;
  targetAmountInCents: number;
  monthlyAmountInCents: number;
  currentAmountInCents: number;
  deadlineDate: string;
  status: GoalStatus;
  description?: string | null;
};

export type DebtType = "INSTALLMENT" | "RECURRING" | "REVOLVING" | "INFORMAL_LOAN" | "FINANCING" | "OTHER";
export type DebtStatus = "IN_PROGRESS" | "OVERDUE" | "PAID";

export type Debt = {
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
};

export type Reserve = {
  id: string;
  protectionMonths: number;
  currentBalanceInCents: number;
  monthlyFixedExpensesInCents: number;
  targetAmountInCents: number;
  completionPercentage: number;
  status: "BUILDING" | "PROTECTED" | "REPLENISHING";
};

export type ReserveTransaction = {
  id: string;
  type: "DEPOSIT" | "WITHDRAWAL";
  amountInCents: number;
  occurredAt: string;
  note: string | null;
};

export type UserProfile = {
  user: PublicUser;
  profile: {
    displayName: string | null;
    avatarUrl: string | null;
    currencyCode: string;
    locale: string;
    timezone: string;
    financialMonthStartDay: number;
    primaryGoalId: string | null;
    onboardingCompleted: boolean;
  };
};

export type DashboardSummary = {
  period: { referenceMonth: string };
  income: { monthlyIncomeInCents: number; extraIncomeInCents: number; totalIncomeInCents: number };
  expenses: {
    fixedExpensesInCents: number;
    variableExpensesInCents: number;
    debtPaymentsInCents: number;
    totalExpensesInCents: number;
  };
  cashFlow: { expectedSurplusInCents: number; recurringSurplusInCents: number; fixedCommitmentRate: number; expenseRate: number };
  debts: { openDebtBalanceInCents: number; openDebtsCount: number; overdueDebtsCount: number };
  reserve: Reserve | null;
  reserveSetupRequired: boolean;
  primaryGoal: {
    id: string;
    title: string;
    targetAmountInCents: number;
    currentAmountInCents: number;
    completionPercentage: number;
    status: GoalStatus;
    deadlineDate: string;
  } | null;
  primaryGoalSetupRequired: boolean;
  alerts: Array<{ type: string; severity: "LOW" | "MEDIUM" | "HIGH"; message: string }>;
};
