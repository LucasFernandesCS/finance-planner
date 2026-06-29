import {
  forbiddenError,
  goalNotFoundError
} from "./goal.errors.js";
import {
  calculateAvailableMonthlyAmount,
  validateContributionInput,
  validateGoalInput,
  validateGoalStatusTransition,
  validateGoalViability
} from "./goal-policy.js";
import {
  createGoal,
  createGoalContribution,
  deleteGoal,
  findGoalById,
  getActiveGoalCommitments,
  getFixedExpenseTotal,
  getMonthlyIncomeTotal,
  listGoalsByUser,
  toPublicGoal,
  toPublicGoalContribution,
  updateGoal
} from "./goal.repository.js";
import type { Goal, GoalFeasibility, PublicGoal, PublicGoalContribution } from "./goal.types.js";

function currentMonth(now = new Date()): string {
  return now.toISOString().slice(0, 7);
}

async function getOwnedGoal(userId: string, goalId: string): Promise<Goal> {
  const goal = await findGoalById(goalId);

  if (!goal) {
    throw goalNotFoundError();
  }

  if (goal.userId !== userId) {
    throw forbiddenError();
  }

  return goal;
}

async function calculateFinancialAvailability(userId: string, options: { excludedGoalId?: string } = {}) {
  const month = currentMonth();
  const [monthlyIncomeInCents, fixedExpensesInCents, activeGoalCommitmentsInCents] = await Promise.all([
    getMonthlyIncomeTotal(userId, month),
    getFixedExpenseTotal(userId, month),
    getActiveGoalCommitments(userId, options.excludedGoalId)
  ]);

  return calculateAvailableMonthlyAmount({
    monthlyIncomeInCents,
    fixedExpensesInCents,
    activeGoalCommitmentsInCents
  });
}

function getGoalFeasibility(goalInput: {
  targetAmountInCents: number;
  monthlyAmountInCents: number;
  deadlineDate: string;
  availableMonthlyAmountInCents: number;
}): GoalFeasibility {
  return validateGoalViability(goalInput);
}

export async function createUserGoal(
  userId: string,
  input: unknown
): Promise<{ goal: PublicGoal; feasibility: GoalFeasibility }> {
  const goalInput = validateGoalInput(input);
  const availableMonthlyAmountInCents = await calculateFinancialAvailability(userId);
  const feasibility = getGoalFeasibility({ ...goalInput, availableMonthlyAmountInCents });
  const goal = await createGoal(userId, goalInput);

  return { goal: toPublicGoal(goal), feasibility };
}

export async function listUserGoals(userId: string): Promise<{ goals: PublicGoal[] }> {
  const goals = await listGoalsByUser(userId);

  return { goals: goals.map(toPublicGoal) };
}

export async function getUserGoal(userId: string, goalId: string): Promise<{ goal: PublicGoal }> {
  const goal = await getOwnedGoal(userId, goalId);

  return { goal: toPublicGoal(goal) };
}

export async function updateUserGoal(
  userId: string,
  goalId: string,
  input: unknown
): Promise<{ goal: PublicGoal; feasibility: GoalFeasibility }> {
  const existingGoal = await getOwnedGoal(userId, goalId);
  const goalInput = validateGoalInput(input);

  if (goalInput.status) {
    validateGoalStatusTransition({
      nextStatus: goalInput.status,
      currentAmountInCents: existingGoal.currentAmountInCents,
      targetAmountInCents: goalInput.targetAmountInCents
    });
  }

  const availableMonthlyAmountInCents = await calculateFinancialAvailability(userId, {
    excludedGoalId: goalId
  });
  const feasibility = getGoalFeasibility({ ...goalInput, availableMonthlyAmountInCents });
  const goal = await updateGoal(goalId, goalInput);

  return { goal: toPublicGoal(goal), feasibility };
}

export async function deleteUserGoal(userId: string, goalId: string): Promise<{ message: string }> {
  await getOwnedGoal(userId, goalId);
  await deleteGoal(goalId);

  return { message: "Objetivo removido com sucesso." };
}

export async function contributeToUserGoal(
  userId: string,
  goalId: string,
  input: unknown
): Promise<{ goal: PublicGoal; contribution: PublicGoalContribution }> {
  const goal = await getOwnedGoal(userId, goalId);
  const contributionInput = validateContributionInput(input);
  const result = await createGoalContribution(userId, goal, contributionInput);

  return {
    goal: toPublicGoal(result.goal),
    contribution: toPublicGoalContribution(result.contribution)
  };
}
