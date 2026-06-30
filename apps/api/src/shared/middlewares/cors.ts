import type { RequestHandler } from "express";

const DEFAULT_WEB_ORIGIN = "http://localhost:5173";
const allowedOrigins = (process.env.CORS_ORIGIN ?? process.env.WEB_ORIGIN ?? DEFAULT_WEB_ORIGIN)
  .split(",")
  .map((origin) => origin.trim())
  .filter(Boolean);

function isAllowedOrigin(origin: string): boolean {
  return allowedOrigins.includes("*") || allowedOrigins.includes(origin);
}

export const corsMiddleware: RequestHandler = (request, response, next) => {
  const origin = request.header("Origin");

  if (origin && isAllowedOrigin(origin)) {
    response.setHeader("Access-Control-Allow-Origin", origin);
    response.setHeader("Vary", "Origin");
  }

  response.setHeader("Access-Control-Allow-Methods", "GET,POST,PATCH,DELETE,OPTIONS");
  response.setHeader("Access-Control-Allow-Headers", "Content-Type,Authorization");

  if (request.method === "OPTIONS") {
    response.status(204).end();
    return;
  }

  next();
};
