import { Router } from "express";

import { loginController, registerController } from "./auth.controller.js";

export const authRouter = Router();

authRouter.post("/auth/register", registerController);
authRouter.post("/auth/login", loginController);
