import { readHealth } from "./health.repository.js";
import type { HealthResponse } from "./health.types.js";

export function getHealth(): HealthResponse {
  return readHealth();
}
