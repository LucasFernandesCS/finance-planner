import { validateContributionInput, validateGoalInput } from "./goal-policy.js";
import type { GoalContributionInput, GoalInput } from "./goal.types.js";

export function parseGoalInput(input: unknown): GoalInput {
  return validateGoalInput(input);
}

export function parseGoalContributionInput(input: unknown): GoalContributionInput {
  return validateContributionInput(input);
}
