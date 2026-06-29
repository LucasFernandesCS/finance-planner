export const GOAL_STATUSES = ["NOT_STARTED", "IN_PROGRESS", "ACHIEVED"] as const;

export type GoalStatus = (typeof GOAL_STATUSES)[number];

export type GoalInput = {
  title: string;
  targetAmountInCents: number;
  monthlyAmountInCents: number;
  deadlineDate: string;
  description?: string | null;
  status?: GoalStatus;
};

export type GoalContributionInput = {
  amountInCents: number;
  note?: string | null;
};

export type Goal = {
  id: string;
  userId: string;
  title: string;
  targetAmountInCents: number;
  monthlyAmountInCents: number;
  currentAmountInCents: number;
  deadlineDate: string;
  status: GoalStatus;
  description?: string | null;
};

export type GoalContribution = {
  id: string;
  goalId: string;
  userId: string;
  amountInCents: number;
  contributedAt: string;
  note?: string | null;
};

export type PublicGoal = Omit<Goal, "userId">;
export type PublicGoalContribution = Omit<GoalContribution, "userId">;

export type GoalFeasibility = {
  monthsUntilDeadline: number;
  suggestedMonthlyAmountInCents: number;
  availableMonthlyAmountInCents: number;
  isFeasible: boolean;
};
