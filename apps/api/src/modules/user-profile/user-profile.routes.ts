import { Router } from "express";

import { requireAuth } from "../../shared/middlewares/auth.js";
import {
  getMeController,
  updateMeProfileController,
  updatePrimaryGoalController
} from "./user-profile.controller.js";

export const userProfileRouter = Router();

userProfileRouter.use("/me", requireAuth);
userProfileRouter.get("/me", getMeController);
userProfileRouter.patch("/me/profile", updateMeProfileController);
userProfileRouter.patch("/me/primary-goal", updatePrimaryGoalController);
