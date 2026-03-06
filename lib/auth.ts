import bcrypt from "bcryptjs";
import { SignJWT, jwtVerify } from "jose";

import { SESSION_COOKIE, TOKEN_EXPIRY_DAYS } from "@/lib/constants";

type SessionPayload = {
  userId: string;
};

function getSecret(): Uint8Array {
  const secret = process.env.AUTH_SECRET ?? "dev-poopstar-secret-change-me";
  return new TextEncoder().encode(secret);
}

export async function hashPassword(password: string): Promise<string> {
  return bcrypt.hash(password, 10);
}

export async function verifyPassword(
  password: string,
  passwordHash: string,
): Promise<boolean> {
  return bcrypt.compare(password, passwordHash);
}

export async function createSessionToken(userId: string): Promise<string> {
  const maxAgeSeconds = TOKEN_EXPIRY_DAYS * 24 * 60 * 60;
  return new SignJWT({ userId })
    .setProtectedHeader({ alg: "HS256" })
    .setIssuedAt()
    .setExpirationTime(`${TOKEN_EXPIRY_DAYS}d`)
    .setSubject(userId)
    .sign(getSecret())
    .then((token) => `${token}::${maxAgeSeconds}`);
}

export async function parseSessionToken(
  tokenWithMeta: string | undefined,
): Promise<SessionPayload | null> {
  if (!tokenWithMeta) {
    return null;
  }
  const [token] = tokenWithMeta.split("::");
  try {
    const { payload } = await jwtVerify(token, getSecret());
    if (typeof payload.userId !== "string") {
      return null;
    }
    return { userId: payload.userId };
  } catch {
    return null;
  }
}

export function getMaxAgeFromToken(tokenWithMeta: string): number {
  const [, maybeMaxAge] = tokenWithMeta.split("::");
  const parsed = Number(maybeMaxAge);
  return Number.isFinite(parsed) ? parsed : TOKEN_EXPIRY_DAYS * 24 * 60 * 60;
}

export { SESSION_COOKIE };
