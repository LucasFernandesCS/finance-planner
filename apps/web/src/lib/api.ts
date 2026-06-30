import { clearAccessToken, getAccessToken } from "./auth-token";

const API_URL = (import.meta.env.VITE_API_URL ?? "http://localhost:3333").replace(/\/$/, "");

export class ApiError extends Error {
  readonly status: number;
  readonly code?: string;
  readonly details?: unknown;

  constructor(input: { message: string; status: number; code?: string; details?: unknown }) {
    super(input.message);
    this.name = "ApiError";
    this.status = input.status;
    this.code = input.code;
    this.details = input.details;
  }
}

type ApiOptions = {
  method?: "GET" | "POST" | "PATCH" | "DELETE";
  body?: unknown;
  query?: Record<string, string | number | null | undefined>;
  auth?: boolean;
};

function buildUrl(path: string, query?: ApiOptions["query"]): string {
  const url = new URL(`${API_URL}${path}`);

  Object.entries(query ?? {}).forEach(([key, value]) => {
    if (value !== null && value !== undefined && value !== "") {
      url.searchParams.set(key, String(value));
    }
  });

  return url.toString();
}

function getErrorMessage(payload: unknown): string {
  if (payload && typeof payload === "object") {
    const candidate = payload as { message?: unknown; error?: { message?: unknown } };
    if (typeof candidate.message === "string") {
      return candidate.message;
    }
    if (typeof candidate.error?.message === "string") {
      return candidate.error.message;
    }
  }

  return "Nao foi possivel concluir a operacao. Tente novamente.";
}

function getErrorCode(payload: unknown): string | undefined {
  if (!payload || typeof payload !== "object") {
    return undefined;
  }

  const candidate = payload as { code?: unknown; error?: { code?: unknown } };
  if (typeof candidate.code === "string") {
    return candidate.code;
  }
  if (typeof candidate.error?.code === "string") {
    return candidate.error.code;
  }

  return undefined;
}

export async function apiRequest<T>(path: string, options: ApiOptions = {}): Promise<T> {
  const headers = new Headers({ "Content-Type": "application/json" });
  const token = getAccessToken();

  if (options.auth !== false && token) {
    headers.set("Authorization", `Bearer ${token}`);
  }

  let response: Response;
  try {
    response = await fetch(buildUrl(path, options.query), {
      method: options.method ?? "GET",
      headers,
      body: options.body === undefined ? undefined : JSON.stringify(options.body)
    });
  } catch (error) {
    throw new ApiError({
      status: 0,
      message: error instanceof Error ? error.message : "Falha de conexao com a API."
    });
  }

  const text = await response.text();
  const payload = text.length > 0 ? (JSON.parse(text) as unknown) : null;

  if (!response.ok) {
    if (response.status === 401) {
      clearAccessToken();
    }

    throw new ApiError({
      status: response.status,
      code: getErrorCode(payload),
      details: payload,
      message: getErrorMessage(payload)
    });
  }

  return payload as T;
}
