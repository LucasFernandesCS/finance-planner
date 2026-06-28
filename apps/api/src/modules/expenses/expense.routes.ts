import { Router } from "express";

import { requireAuth } from "../../shared/middlewares/auth.js";
import {
  createFixedExpenseController,
  deleteFixedExpenseController,
  listFixedExpensesController,
  updateFixedExpenseController
} from "./fixed-expense.controller.js";
import {
  createVariableExpenseController,
  deleteVariableExpenseController,
  listVariableExpensesController,
  updateVariableExpenseController
} from "./variable-expense.controller.js";

export const expenseRouter = Router();

expenseRouter.use("/fixed-expenses", requireAuth);
expenseRouter.post("/fixed-expenses", createFixedExpenseController);
expenseRouter.get("/fixed-expenses", listFixedExpensesController);
expenseRouter.patch("/fixed-expenses/:fixedExpenseId", updateFixedExpenseController);
expenseRouter.delete("/fixed-expenses/:fixedExpenseId", deleteFixedExpenseController);

expenseRouter.use("/variable-expenses", requireAuth);
expenseRouter.post("/variable-expenses", createVariableExpenseController);
expenseRouter.get("/variable-expenses", listVariableExpensesController);
expenseRouter.patch("/variable-expenses/:variableExpenseId", updateVariableExpenseController);
expenseRouter.delete("/variable-expenses/:variableExpenseId", deleteVariableExpenseController);
