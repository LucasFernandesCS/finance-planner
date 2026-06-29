import "dotenv/config";

type ApiEnv = {
  databaseUrl: string;
  jwtAccessSecret: string;
  jwtAccessExpiresIn: string;
  cpfHashSecret: string;
  refreshTokenHashSecret: string;
  refreshTokenExpiresInMinutes: number;
  port: number;
  nodeEnv: string;
};

const testDefaults = {
  DATABASE_URL: "postgresql://family:family@localhost:5432/family_dreams",
  JWT_ACCESS_SECRET: "test-access-secret",
  JWT_ACCESS_EXPIRES_IN: "15m",
  CPF_HASH_SECRET: "test-cpf-hash-secret",
  REFRESH_TOKEN_HASH_SECRET: "test-refresh-token-hash-secret",
  REFRESH_TOKEN_EXPIRES_IN_MINUTES: "30",
};

function getEnvValue(key: keyof typeof testDefaults): string | undefined {
  return (
    process.env[key] ??
    (process.env.NODE_ENV === "test" ? testDefaults[key] : undefined)
  );
}

function requireEnv(key: keyof typeof testDefaults): string {
  const value = getEnvValue(key);

  if (!value) {
    throw new Error(`Missing required environment variable: ${key}`);
  }

  process.env[key] = value;
  return value;
}

const refreshTokenExpiresInMinutes = Number(
  requireEnv("REFRESH_TOKEN_EXPIRES_IN_MINUTES"),
);

if (
  !Number.isInteger(refreshTokenExpiresInMinutes) ||
  refreshTokenExpiresInMinutes <= 0
) {
  throw new Error(
    "REFRESH_TOKEN_EXPIRES_IN_MINUTES must be a positive integer.",
  );
}

export const env: ApiEnv = {
  databaseUrl: requireEnv("DATABASE_URL"),
  jwtAccessSecret: requireEnv("JWT_ACCESS_SECRET"),
  jwtAccessExpiresIn: requireEnv("JWT_ACCESS_EXPIRES_IN"),
  cpfHashSecret: requireEnv("CPF_HASH_SECRET"),
  refreshTokenHashSecret: requireEnv("REFRESH_TOKEN_HASH_SECRET"),
  refreshTokenExpiresInMinutes,
  port: Number(process.env.PORT ?? 3333),
  nodeEnv: process.env.NODE_ENV ?? "development",
};
