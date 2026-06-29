import { Router } from "express";

import { requireAuth } from "../../shared/middlewares/auth.js";
import {
  createGoalContributionController,
  createGoalController,
  deleteGoalController,
  getGoalController,
  listGoalsController,
  updateGoalController
} from "./goal.controller.js";

export const goalRouter = Router();

goalRouter.use("/goals", requireAuth);
goalRouter.post("/goals", createGoalController);
goalRouter.get("/goals", listGoalsController);
goalRouter.get("/goals/:goalId", getGoalController);
goalRouter.patch("/goals/:goalId", updateGoalController);
goalRouter.delete("/goals/:goalId", deleteGoalController);
goalRouter.post("/goals/:goalId/contributions", createGoalContributionController);
