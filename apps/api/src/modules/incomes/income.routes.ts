import { Router } from "express";

import { requireAuth } from "../../shared/middlewares/auth.js";
import {
  createIncomeController,
  deleteIncomeController,
  listIncomesController,
  updateIncomeController
} from "./income.controller.js";

export const incomeRouter = Router();

incomeRouter.use("/incomes", requireAuth);
incomeRouter.post("/incomes", createIncomeController);
incomeRouter.get("/incomes", listIncomesController);
incomeRouter.patch("/incomes/:incomeId", updateIncomeController);
incomeRouter.delete("/incomes/:incomeId", deleteIncomeController);
