import type { Prisma } from "@prisma/client";

import { prisma } from "../../shared/infra/prisma.js";
import { toMonthDate } from "../expenses/expense.policy.js";
import { fromDeadlineDate, getStatusAfterContribution, toDeadlineDate } from "./goal-policy.js";
import type {
  Goal,
  GoalContribution,
  GoalContributionInput,
  GoalInput,
  GoalStatus,
  PublicGoal,
  PublicGoalContribution
} from "./goal.types.js";

type PrismaTransaction = Prisma.TransactionClient;

function toGoal(record: {
  id: string;
  userId: string;
  title: string;
  targetAmountInCents: bigint;
  monthlyAmountInCents: bigint;
  currentAmountInCents: bigint;
  deadlineDate: Date;
  status: GoalStatus;
  description: string | null;
}): Goal {
  return {
    id: record.id,
    userId: record.userId,
    title: record.title,
    targetAmountInCents: Number(record.targetAmountInCents),
    monthlyAmountInCents: Number(record.monthlyAmountInCents),
    currentAmountInCents: Number(record.currentAmountInCents),
    deadlineDate: fromDeadlineDate(record.deadlineDate),
    status: record.status,
    description: record.description
  };
}

function toGoalContribution(record: {
  id: string;
  goalId: string;
  userId: string;
  amountInCents: bigint;
  contributedAt: Date;
  note: string | null;
}): GoalContribution {
  return {
    id: record.id,
    goalId: record.goalId,
    userId: record.userId,
    amountInCents: Number(record.amountInCents),
    contributedAt: fromDeadlineDate(record.contributedAt),
    note: record.note
  };
}

export function toPublicGoal(goal: Goal): PublicGoal {
  const { userId: _userId, ...publicGoal } = goal;
  return publicGoal;
}

export function toPublicGoalContribution(contribution: GoalContribution): PublicGoalContribution {
  const { userId: _userId, ...publicContribution } = contribution;
  return publicContribution;
}

export async function createGoal(userId: string, input: GoalInput): Promise<Goal> {
  const goal = await prisma.goal.create({
    data: {
      userId,
      title: input.title,
      targetAmountInCents: BigInt(input.targetAmountInCents),
      monthlyAmountInCents: BigInt(input.monthlyAmountInCents),
      deadlineDate: toDeadlineDate(input.deadlineDate),
      description: input.description
    }
  });

  return toGoal(goal);
}

export async function listGoalsByUser(userId: string): Promise<Goal[]> {
  const goals = await prisma.goal.findMany({
    where: { userId },
    orderBy: { createdAt: "asc" }
  });

  return goals.map(toGoal);
}

export async function findGoalById(goalId: string): Promise<Goal | null> {
  const goal = await prisma.goal.findUnique({
    where: { id: goalId }
  });

  return goal ? toGoal(goal) : null;
}

export async function updateGoal(goalId: string, input: GoalInput): Promise<Goal> {
  const goal = await prisma.goal.update({
    where: { id: goalId },
    data: {
      title: input.title,
      targetAmountInCents: BigInt(input.targetAmountInCents),
      monthlyAmountInCents: BigInt(input.monthlyAmountInCents),
      deadlineDate: toDeadlineDate(input.deadlineDate),
      description: input.description,
      status: input.status
    }
  });

  return toGoal(goal);
}

export async function deleteGoal(goalId: string): Promise<void> {
  await prisma.goal.delete({
    where: { id: goalId }
  });
}

export async function getMonthlyIncomeTotal(userId: string, month: string): Promise<number> {
  const result = await prisma.income.aggregate({
    where: {
      userId,
      type: "MONTHLY",
      referenceMonth: toMonthDate(month)
    },
    _sum: { amountInCents: true }
  });

  return Number(result._sum.amountInCents ?? 0);
}

export async function getFixedExpenseTotal(userId: string, month: string): Promise<number> {
  const result = await prisma.fixedExpense.aggregate({
    where: {
      userId,
      startMonth: { lte: toMonthDate(month) }
    },
    _sum: { amountInCents: true }
  });

  return Number(result._sum.amountInCents ?? 0);
}

export async function getActiveGoalCommitments(userId: string, excludedGoalId?: string): Promise<number> {
  const result = await prisma.goal.aggregate({
    where: {
      userId,
      status: { in: ["NOT_STARTED", "IN_PROGRESS"] },
      ...(excludedGoalId ? { id: { not: excludedGoalId } } : {})
    },
    _sum: { monthlyAmountInCents: true }
  });

  return Number(result._sum.monthlyAmountInCents ?? 0);
}

async function createContributionInTransaction(
  tx: PrismaTransaction,
  userId: string,
  goal: Goal,
  input: GoalContributionInput
) {
  const nextAmount = goal.currentAmountInCents + input.amountInCents;
  const nextStatus = getStatusAfterContribution(nextAmount, goal.targetAmountInCents);

  const [contribution, updatedGoal] = await Promise.all([
    tx.goalContribution.create({
      data: {
        goalId: goal.id,
        userId,
        amountInCents: BigInt(input.amountInCents),
        note: input.note
      }
    }),
    tx.goal.update({
      where: { id: goal.id },
      data: {
        currentAmountInCents: BigInt(nextAmount),
        status: nextStatus
      }
    })
  ]);

  return {
    goal: toGoal(updatedGoal),
    contribution: toGoalContribution(contribution)
  };
}

export async function createGoalContribution(
  userId: string,
  goal: Goal,
  input: GoalContributionInput | number
): Promise<{ goal: Goal; contribution: GoalContribution }> {
  const contributionInput =
    typeof input === "number" ? { amountInCents: input, note: null } : input;

  return prisma.$transaction((tx) => createContributionInTransaction(tx, userId, goal, contributionInput));
}
