import express from "express";

import { errorHandler } from "./shared/error-handler.js";
import { authRouter } from "./modules/auth/auth.routes.js";
import { dashboardRouter } from "./modules/dashboard/dashboard.routes.js";
import { debtRouter } from "./modules/debts/debt.routes.js";
import { expenseRouter } from "./modules/expenses/expense.routes.js";
import { goalRouter } from "./modules/goals/goal.routes.js";
import { healthRouter } from "./modules/health/health.routes.js";
import { incomeRouter } from "./modules/incomes/income.routes.js";
import { reserveTrackingRouter } from "./modules/reserve-tracking/reserve-tracking.routes.js";
import { userProfileRouter } from "./modules/user-profile/user-profile.routes.js";

export const app = express();

app.use(express.json());
app.use(healthRouter);
app.use(authRouter);
app.use(incomeRouter);
app.use(expenseRouter);
app.use(goalRouter);
app.use(userProfileRouter);
app.use(debtRouter);
app.use(reserveTrackingRouter);
app.use(dashboardRouter);
app.use(errorHandler);
