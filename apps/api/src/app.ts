import express from "express";

import { errorHandler } from "./shared/error-handler.js";
import { healthRouter } from "./modules/health/health.routes.js";

export const app = express();

app.use(express.json());
app.use(healthRouter);
app.use(errorHandler);
