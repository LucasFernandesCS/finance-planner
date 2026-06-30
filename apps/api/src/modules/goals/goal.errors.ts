import { AppError } from "../../shared/app-error.js";

type GoalFeasibilityDetails = {
  suggestion?: string;
  requiredMonthlyAmountInCents?: number;
  availableMonthlyAmountInCents?: number;
  suggestedMonthlyAmountInCents?: number;
  monthsUntilDeadline?: number;
  minimumViableMonths?: number;
  maxTargetAmountForCurrentDeadlineInCents?: number;
};

export class GoalAppError extends AppError {
  constructor(
    message: string,
    code: string,
    statusCode: number,
    readonly details: GoalFeasibilityDetails = {}
  ) {
    super(message, code, statusCode);
  }
}

export const GOAL_ERROR_CODES = {
  unauthorized: "UNAUTHORIZED",
  forbidden: "FORBIDDEN",
  goalNotFound: "GOAL_NOT_FOUND",
  validationError: "VALIDATION_ERROR",
  targetAmountMustBePositive: "GOAL_TARGET_AMOUNT_MUST_BE_POSITIVE",
  monthlyAmountMustBePositive: "GOAL_MONTHLY_AMOUNT_MUST_BE_POSITIVE",
  contributionAmountMustBePositive: "GOAL_CONTRIBUTION_AMOUNT_MUST_BE_POSITIVE",
  amountOverflow: "GOAL_AMOUNT_OVERFLOW",
  titleTooLong: "GOAL_TITLE_TOO_LONG",
  deadlineMustBeFuture: "GOAL_DEADLINE_MUST_BE_FUTURE",
  invalidStatusTransition: "INVALID_GOAL_STATUS_TRANSITION",
  monthlyAmountTooLow: "GOAL_MONTHLY_AMOUNT_TOO_LOW",
  notFinanciallyFeasible: "GOAL_NOT_FINANCIALLY_FEASIBLE"
} as const;

export function unauthorizedError(): AppError {
  return new AppError("Unauthenticated.", GOAL_ERROR_CODES.unauthorized, 401);
}

export function forbiddenError(): AppError {
  return new AppError("Operation not allowed.", GOAL_ERROR_CODES.forbidden, 403);
}

export function goalNotFoundError(): AppError {
  return new AppError("Goal not found.", GOAL_ERROR_CODES.goalNotFound, 404);
}

export function validationError(): AppError {
  return new AppError("Invalid goal data.", GOAL_ERROR_CODES.validationError, 400);
}

export function targetAmountMustBePositiveError(): AppError {
  return new AppError(
    "Goal target amount must be positive.",
    GOAL_ERROR_CODES.targetAmountMustBePositive,
    400
  );
}

export function monthlyAmountMustBePositiveError(): AppError {
  return new AppError(
    "Goal monthly amount must be positive.",
    GOAL_ERROR_CODES.monthlyAmountMustBePositive,
    400
  );
}

export function contributionAmountMustBePositiveError(): AppError {
  return new AppError(
    "Goal contribution amount must be positive.",
    GOAL_ERROR_CODES.contributionAmountMustBePositive,
    400
  );
}

export function amountOverflowError(): AppError {
  return new AppError("Goal amount is too high.", GOAL_ERROR_CODES.amountOverflow, 400);
}

export function titleTooLongError(): AppError {
  return new AppError("Goal title is too long.", GOAL_ERROR_CODES.titleTooLong, 400);
}

export function deadlineMustBeFutureError(): AppError {
  return new AppError("Goal deadline must be in the future.", GOAL_ERROR_CODES.deadlineMustBeFuture, 400);
}

export function invalidStatusTransitionError(): AppError {
  return new AppError(
    "Invalid goal status transition.",
    GOAL_ERROR_CODES.invalidStatusTransition,
    400
  );
}

export function goalMonthlyAmountTooLowError(details: {
  suggestedMonthlyAmountInCents: number;
  monthsUntilDeadline: number;
}): GoalAppError {
  return new GoalAppError(
    "O aporte mensal informado e menor que o necessario para atingir este objetivo no prazo escolhido.",
    GOAL_ERROR_CODES.monthlyAmountTooLow,
    400,
    details
  );
}

export function goalNotFinanciallyFeasibleError(details: Required<GoalFeasibilityDetails>): GoalAppError {
  const message = `Para atingir este objetivo, voce precisaria guardar ${details.requiredMonthlyAmountInCents} centavos por mes, mas sua sobra atual e de ${details.availableMonthlyAmountInCents} centavos.`;

  return new GoalAppError(message, GOAL_ERROR_CODES.notFinanciallyFeasible, 422, {
    ...details,
    suggestion:
      details.suggestion ??
      `Aumente o prazo para pelo menos ${details.minimumViableMonths} meses ou reduza o valor do objetivo.`
  });
}
