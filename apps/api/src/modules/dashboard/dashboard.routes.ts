import { Router } from "express";

import { requireAuth } from "../../shared/middlewares/auth.js";
import { getDashboardSummaryController } from "./dashboard.controller.js";

export const dashboardRouter = Router();

dashboardRouter.use("/dashboard", requireAuth);
dashboardRouter.get("/dashboard/summary", getDashboardSummaryController);
