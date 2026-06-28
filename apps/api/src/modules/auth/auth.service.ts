import { isValidCpf, normalizeCpf } from "../../shared/utils/cpf.js";
import {
  comparePassword,
  hashCpf,
  hashPassword,
  hashRefreshToken
} from "../../shared/utils/hash.js";
import {
  generateAccessToken,
  generateRefreshToken,
  getRefreshTokenExpiresAt
} from "../../shared/utils/token.js";
import {
  cpfAlreadyExistsError,
  emailAlreadyExistsError,
  invalidCpfError,
  invalidCredentialsError
} from "./auth.errors.js";
import { assertStrongPassword } from "./auth.password-policy.js";
import {
  createRefreshToken,
  createUser,
  findUserByCpfHash,
  findUserByEmail
} from "./auth.repository.js";
import type { LoginInput, PublicUser, RegisterInput } from "./auth.types.js";

function toPublicUser(user: PublicUser): PublicUser {
  return {
    id: user.id,
    firstName: user.firstName,
    lastName: user.lastName,
    email: user.email
  };
}

export async function registerUser(input: RegisterInput): Promise<{ user: PublicUser }> {
  const email = input.email.trim().toLowerCase();
  const normalizedCpf = normalizeCpf(input.cpf);

  if (!isValidCpf(normalizedCpf)) {
    throw invalidCpfError();
  }

  assertStrongPassword(input.password);

  const cpfHash = hashCpf(normalizedCpf);

  const [existingEmail, existingCpf] = await Promise.all([
    findUserByEmail(email),
    findUserByCpfHash(cpfHash)
  ]);

  if (existingEmail) {
    throw emailAlreadyExistsError();
  }

  if (existingCpf) {
    throw cpfAlreadyExistsError();
  }

  const passwordHash = await hashPassword(input.password);
  const user = await createUser({
    ...input,
    email,
    cpfHash,
    passwordHash
  });

  return { user: toPublicUser(user) };
}

export async function loginUser(input: LoginInput): Promise<{
  accessToken: string;
  refreshToken: string;
  user: PublicUser;
}> {
  let user;

  if (input.email) {
    user = await findUserByEmail(input.email.trim().toLowerCase());
  } else {
    const normalizedCpf = normalizeCpf(input.cpf ?? "");

    if (!isValidCpf(normalizedCpf)) {
      throw invalidCredentialsError();
    }

    user = await findUserByCpfHash(hashCpf(normalizedCpf));
  }

  if (!user) {
    throw invalidCredentialsError();
  }

  const passwordMatches = await comparePassword(input.password, user.passwordHash);

  if (!passwordMatches) {
    throw invalidCredentialsError();
  }

  const accessToken = generateAccessToken(user.id);
  const refreshToken = generateRefreshToken();

  await createRefreshToken({
    userId: user.id,
    tokenHash: hashRefreshToken(refreshToken),
    expiresAt: getRefreshTokenExpiresAt()
  });

  return {
    accessToken,
    refreshToken,
    user: toPublicUser(user)
  };
}
