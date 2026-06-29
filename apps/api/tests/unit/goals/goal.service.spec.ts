import { beforeEach, describe, expect, it, vi } from "vitest";

import { GOAL_ERROR_CODES } from "../../../src/modules/goals/goal.errors.js";
import type { Goal, GoalContribution } from "../../../src/modules/goals/goal.types.js";
import {
  contributeToUserGoal,
  createUserGoal,
  listUserGoals
} from "../../../src/modules/goals/goal.service.js";

vi.mock("../../../src/modules/goals/goal.repository.js", () => ({
  createGoal: vi.fn(async (_userId: string, input: object) => ({
    ...goal,
    ...input,
    status: "NOT_STARTED",
    currentAmountInCents: 0
  })),
  createGoalContribution: vi.fn(async (_userId: string, _goal: Goal, input: { amountInCents: number }) => ({
    goal: {
      ...goal,
      currentAmountInCents: input.amountInCents,
      status: input.amountInCents >= goal.targetAmountInCents ? "ACHIEVED" : "IN_PROGRESS"
    },
    contribution: { ...contribution, amountInCents: input.amountInCents }
  })),
  deleteGoal: vi.fn(),
  findGoalById: vi.fn(async () => goal),
  getActiveGoalCommitments: vi.fn(async () => 0),
  getFixedExpenseTotal: vi.fn(async () => 350000),
  getMonthlyIncomeTotal: vi.fn(async () => 500000),
  listGoalsByUser: vi.fn(async () => [goal]),
  toPublicGoal: vi.fn((input: Goal) => {
    const { userId: _userId, ...publicGoal } = input;
    return publicGoal;
  }),
  toPublicGoalContribution: vi.fn((input: GoalContribution) => {
    const { userId: _userId, ...publicContribution } = input;
    return publicContribution;
  }),
  updateGoal: vi.fn()
}));

const goal: Goal = {
  id: "goal-id",
  userId: "user-id",
  title: "Comprar notebook",
  targetAmountInCents: 1500000,
  monthlyAmountInCents: 125000,
  currentAmountInCents: 0,
  deadlineDate: "2027-06-30",
  status: "NOT_STARTED",
  description: "Notebook"
};

const contribution: GoalContribution = {
  id: "contribution-id",
  goalId: goal.id,
  userId: goal.userId,
  amountInCents: 100000,
  contributedAt: "2026-06-29",
  note: null
};

const validGoalInput = {
  title: "Comprar notebook",
  targetAmountInCents: 1500000,
  monthlyAmountInCents: 125000,
  deadlineDate: "2027-06-30",
  description: "Notebook"
};

describe("GoalService", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("creates a feasible goal for the authenticated user", async () => {
    await expect(createUserGoal("user-id", validGoalInput)).resolves.toEqual({
      goal: expect.objectContaining({ title: "Comprar notebook" }),
      feasibility: expect.objectContaining({ isFeasible: true })
    });
  });

  it("starts created goals as NOT_STARTED", async () => {
    const result = await createUserGoal("user-id", validGoalInput);

    expect(result.goal.status).toBe("NOT_STARTED");
  });

  it("rejects an unfeasible goal", async () => {
    await expect(
      createUserGoal("user-id", {
        ...validGoalInput,
        targetAmountInCents: 1500000,
        monthlyAmountInCents: 187500,
        deadlineDate: "2027-02-28"
      })
    ).rejects.toMatchObject({ code: GOAL_ERROR_CODES.notFinanciallyFeasible });
  });

  it("lists only goals from the authenticated user", async () => {
    await expect(listUserGoals("user-id")).resolves.toEqual({
      goals: [expect.objectContaining({ id: goal.id })]
    });
  });

  it("calculates monthly availability from repository financial data", async () => {
    const result = await createUserGoal("user-id", validGoalInput);

    expect(result.feasibility.availableMonthlyAmountInCents).toBe(150000);
  });

  it("subtracts active goal commitments from available monthly amount", async () => {
    const repository = await import("../../../src/modules/goals/goal.repository.js");
    vi.mocked(repository.getActiveGoalCommitments).mockResolvedValueOnce(50000);

    const result = await createUserGoal("user-id", {
      ...validGoalInput,
      targetAmountInCents: 1000000,
      monthlyAmountInCents: 100000
    });

    expect(result.feasibility.availableMonthlyAmountInCents).toBe(100000);
  });

  it("creates a contribution for an owned goal", async () => {
    await expect(contributeToUserGoal("user-id", goal.id, { amountInCents: 100000 })).resolves.toEqual({
      goal: expect.objectContaining({ currentAmountInCents: 100000 }),
      contribution: expect.objectContaining({ amountInCents: 100000 })
    });
  });

  it("updates status to IN_PROGRESS after a partial contribution", async () => {
    const result = await contributeToUserGoal("user-id", goal.id, { amountInCents: 100000 });

    expect(result.goal.status).toBe("IN_PROGRESS");
  });

  it("updates status to ACHIEVED after reaching the target", async () => {
    const result = await contributeToUserGoal("user-id", goal.id, { amountInCents: 1500000 });

    expect(result.goal.status).toBe("ACHIEVED");
  });

  it("rejects contribution to another user's goal", async () => {
    await expect(contributeToUserGoal("another-user", goal.id, { amountInCents: 100000 })).rejects.toMatchObject({
      code: GOAL_ERROR_CODES.forbidden
    });
  });

  it("rejects a missing goal", async () => {
    const repository = await import("../../../src/modules/goals/goal.repository.js");
    vi.mocked(repository.findGoalById).mockResolvedValueOnce(null);

    await expect(contributeToUserGoal("user-id", goal.id, { amountInCents: 100000 })).rejects.toMatchObject({
      code: GOAL_ERROR_CODES.goalNotFound
    });
  });
});
