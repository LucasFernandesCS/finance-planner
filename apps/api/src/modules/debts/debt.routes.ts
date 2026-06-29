import { Router } from "express";

import { requireAuth } from "../../shared/middlewares/auth.js";
import {
  createDebtController,
  deleteDebtController,
  getDebtController,
  listDebtsController,
  payDebtController,
  updateDebtController
} from "./debt.controller.js";

export const debtRouter = Router();

debtRouter.use("/debts", requireAuth);
debtRouter.post("/debts", createDebtController);
debtRouter.get("/debts", listDebtsController);
debtRouter.get("/debts/:debtId", getDebtController);
debtRouter.patch("/debts/:debtId", updateDebtController);
debtRouter.delete("/debts/:debtId", deleteDebtController);
debtRouter.post("/debts/:debtId/payments", payDebtController);
