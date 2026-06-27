import type { Request, Response } from "express";

import { getHealth } from "./health.service.js";

export function healthController(_request: Request, response: Response): void {
  response.status(200).json(getHealth());
}
