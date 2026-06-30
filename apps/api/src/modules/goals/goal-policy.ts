import {
  amountOverflowError,
  contributionAmountMustBePositiveError,
  deadlineMustBeFutureError,
  goalNotFinanciallyFeasibleError,
  invalidStatusTransitionError,
  goalMonthlyAmountTooLowError,
  monthlyAmountMustBePositiveError,
  targetAmountMustBePositiveError,
  titleTooLongError,
  validationError
} from "./goal.errors.js";
import { GOAL_STATUSES, type GoalInput, type GoalStatus } from "./goal.types.js";

export const MAX_GOAL_AMOUNT_IN_CENTS = 99999999999;
export const MAX_GOAL_TITLE_LENGTH = 100;

function parseDateOnly(date: string): Date {
  return new Date(`${date}T00:00:00.000Z`);
}

function toDateOnly(date: Date): string {
  return date.toISOString().slice(0, 10);
}

function isValidDateOnly(value: unknown): value is string {
  return typeof value === "string" && /^\d{4}-\d{2}-\d{2}$/.test(value) && !Number.isNaN(parseDateOnly(value).getTime());
}

export function toDeadlineDate(deadlineDate: string): Date {
  return parseDateOnly(deadlineDate);
}

export function fromDeadlineDate(deadlineDate: Date): string {
  return toDateOnly(deadlineDate);
}

export function calculateMonthsUntilDeadline(deadlineDate: string, today = new Date()): number {
  const current = new Date(Date.UTC(today.getUTCFullYear(), today.getUTCMonth(), today.getUTCDate()));
  const deadline = parseDateOnly(deadlineDate);

  let months = (deadline.getUTCFullYear() - current.getUTCFullYear()) * 12;
  months += deadline.getUTCMonth() - current.getUTCMonth();

  if (deadline.getUTCDate() > current.getUTCDate()) {
    months += 1;
  }

  return Math.max(months, 0);
}

export function calculateSuggestedMonthlyAmount(targetAmountInCents: number, monthsUntilDeadline: number): number {
  if (monthsUntilDeadline <= 0) {
    throw deadlineMustBeFutureError();
  }

  return Math.ceil(targetAmountInCents / monthsUntilDeadline);
}

export function calculateAvailableMonthlyAmount(input: {
  monthlyIncomeInCents: number;
  fixedExpensesInCents: number;
  activeGoalCommitmentsInCents: number;
}): number {
  return input.monthlyIncomeInCents - input.fixedExpensesInCents - input.activeGoalCommitmentsInCents;
}

export function calculateMinimumViableMonths(targetAmountInCents: number, availableMonthlyAmountInCents: number): number {
  if (availableMonthlyAmountInCents <= 0) {
    return Number.POSITIVE_INFINITY;
  }

  return Math.ceil(targetAmountInCents / availableMonthlyAmountInCents);
}

export function calculateMaxTargetAmountForDeadline(
  availableMonthlyAmountInCents: number,
  monthsUntilDeadline: number
): number {
  return Math.max(availableMonthlyAmountInCents, 0) * monthsUntilDeadline;
}

function validateAmount(value: unknown, positiveError: () => Error): number {
  if (typeof value !== "number" || !Number.isInteger(value)) {
    throw validationError();
  }

  if (value <= 0) {
    throw positiveError();
  }

  if (value > MAX_GOAL_AMOUNT_IN_CENTS) {
    throw amountOverflowError();
  }

  return value;
}

export function validateGoalInput(input: unknown, today = new Date()): GoalInput {
  if (!input || typeof input !== "object") {
    throw validationError();
  }

  const candidate = input as Partial<GoalInput>;

  if (typeof candidate.title !== "string" || candidate.title.trim().length === 0) {
    throw validationError();
  }

  const title = candidate.title.trim();

  if (title.length > MAX_GOAL_TITLE_LENGTH) {
    throw titleTooLongError();
  }

  const targetAmountInCents = validateAmount(candidate.targetAmountInCents, targetAmountMustBePositiveError);
  const monthlyAmountInCents = validateAmount(candidate.monthlyAmountInCents, monthlyAmountMustBePositiveError);

  if (!isValidDateOnly(candidate.deadlineDate)) {
    throw validationError();
  }

  const todayOnly = new Date(Date.UTC(today.getUTCFullYear(), today.getUTCMonth(), today.getUTCDate()));

  if (parseDateOnly(candidate.deadlineDate).getTime() <= todayOnly.getTime()) {
    throw deadlineMustBeFutureError();
  }

  if (candidate.status && !GOAL_STATUSES.includes(candidate.status)) {
    throw validationError();
  }

  return {
    title,
    targetAmountInCents,
    monthlyAmountInCents,
    deadlineDate: candidate.deadlineDate,
    description: candidate.description ?? null,
    status: candidate.status
  };
}

export function validateContributionInput(input: unknown): { amountInCents: number; note?: string | null } {
  if (!input || typeof input !== "object") {
    throw validationError();
  }

  const candidate = input as { amountInCents?: unknown; note?: string | null };

  return {
    amountInCents: validateAmount(candidate.amountInCents, contributionAmountMustBePositiveError),
    note: candidate.note ?? null
  };
}

export function validateGoalStatusTransition(input: {
  nextStatus: GoalStatus;
  currentAmountInCents: number;
  targetAmountInCents: number;
}): void {
  if (input.nextStatus === "ACHIEVED" && input.currentAmountInCents < input.targetAmountInCents) {
    throw invalidStatusTransitionError();
  }
}

export function getStatusAfterContribution(currentAmountInCents: number, targetAmountInCents: number): GoalStatus {
  return currentAmountInCents >= targetAmountInCents ? "ACHIEVED" : "IN_PROGRESS";
}

export function validateGoalViability(input: {
  targetAmountInCents: number;
  monthlyAmountInCents: number;
  deadlineDate: string;
  availableMonthlyAmountInCents: number;
  today?: Date;
}): {
  monthsUntilDeadline: number;
  suggestedMonthlyAmountInCents: number;
  availableMonthlyAmountInCents: number;
  isFeasible: true;
} {
  const monthsUntilDeadline = calculateMonthsUntilDeadline(input.deadlineDate, input.today);
  const suggestedMonthlyAmountInCents = calculateSuggestedMonthlyAmount(
    input.targetAmountInCents,
    monthsUntilDeadline
  );

  if (input.monthlyAmountInCents < suggestedMonthlyAmountInCents) {
    throw goalMonthlyAmountTooLowError({
      suggestedMonthlyAmountInCents,
      monthsUntilDeadline
    });
  }

  if (input.monthlyAmountInCents > input.availableMonthlyAmountInCents) {
    const minimumViableMonths = calculateMinimumViableMonths(
      input.targetAmountInCents,
      input.availableMonthlyAmountInCents
    );
    const maxTargetAmountForCurrentDeadlineInCents = calculateMaxTargetAmountForDeadline(
      input.availableMonthlyAmountInCents,
      monthsUntilDeadline
    );

    throw goalNotFinanciallyFeasibleError({
      requiredMonthlyAmountInCents: input.monthlyAmountInCents,
      availableMonthlyAmountInCents: input.availableMonthlyAmountInCents,
      suggestedMonthlyAmountInCents,
      monthsUntilDeadline,
      minimumViableMonths,
      maxTargetAmountForCurrentDeadlineInCents,
      suggestion: `Aumente o prazo para pelo menos ${minimumViableMonths} meses ou reduza o valor do objetivo para ate ${maxTargetAmountForCurrentDeadlineInCents} centavos nesse prazo.`
    });
  }

  return {
    monthsUntilDeadline,
    suggestedMonthlyAmountInCents,
    availableMonthlyAmountInCents: input.availableMonthlyAmountInCents,
    isFeasible: true
  };
}
