import type { Request, Response } from "express";
import { ZodError } from "zod";

import { validationError } from "./auth.errors.js";
import { parseLoginInput, parseRegisterInput } from "./auth.schemas.js";
import { loginUser, registerUser } from "./auth.service.js";

export async function registerController(request: Request, response: Response): Promise<void> {
  try {
    const result = await registerUser(parseRegisterInput(request.body));

    response.status(201).json(result);
  } catch (error) {
    if (error instanceof ZodError) {
      throw validationError();
    }

    throw error;
  }
}

export async function loginController(request: Request, response: Response): Promise<void> {
  try {
    const result = await loginUser(parseLoginInput(request.body));

    response.status(200).json(result);
  } catch (error) {
    if (error instanceof ZodError) {
      throw validationError();
    }

    throw error;
  }
}
