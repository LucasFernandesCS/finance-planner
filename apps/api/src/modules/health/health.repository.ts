import type { HealthResponse } from "./health.types.js";

export function readHealth(): HealthResponse {
  return { status: "ok" };
}
