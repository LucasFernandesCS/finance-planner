import { Router } from "express";

import { requireAuth } from "../../shared/middlewares/auth.js";
import {
  configureReserveController,
  depositReserveController,
  getReserveController,
  listReserveTransactionsController,
  updateReserveController,
  withdrawReserveController
} from "./reserve-tracking.controller.js";

export const reserveTrackingRouter = Router();

reserveTrackingRouter.use("/reserve", requireAuth);
reserveTrackingRouter.get("/reserve", getReserveController);
reserveTrackingRouter.post("/reserve", configureReserveController);
reserveTrackingRouter.patch("/reserve", updateReserveController);
reserveTrackingRouter.post("/reserve/deposits", depositReserveController);
reserveTrackingRouter.post("/reserve/withdrawals", withdrawReserveController);
reserveTrackingRouter.get("/reserve/transactions", listReserveTransactionsController);
