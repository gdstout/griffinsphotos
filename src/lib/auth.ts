import { createHmac, scryptSync, timingSafeEqual } from "node:crypto";
import { cookies } from "next/headers";

const TOKEN_TTL_SECONDS = 60 * 60 * 24 * 2;

function getAuthSecret() {
  const secret = process.env.AUTH_SECRET;

  if (!secret) {
    throw new Error("AUTH_SECRET is not configured");
  }

  return secret;
}

function sign(value: string) {
  return createHmac("sha256", getAuthSecret())
    .update(value)
    .digest("base64url");
}

export function isValidAdminPassword(password: string) {
  const storedHash = process.env.ADMIN_PASSWORD_HASH;

  if (!storedHash) {
    throw new Error("ADMIN_PASSWORD_HASH is not configured");
  }

  const [salt, expectedHash] = storedHash.split(":");

  if (!salt || !expectedHash) {
    throw new Error("ADMIN_PASSWORD_HASH has an invalid format");
  }

  const actualHash = scryptSync(password, salt, 32);
  const expectedHashBuffer = Buffer.from(expectedHash, "base64url");

  return (
    actualHash.length === expectedHashBuffer.length &&
    timingSafeEqual(actualHash, expectedHashBuffer)
  );
}

export function createAuthToken() {
  const payload = Buffer.from(
    JSON.stringify({
      exp: Math.floor(Date.now() / 1000) + TOKEN_TTL_SECONDS,
    }),
  ).toString("base64url");

  return `${payload}.${sign(payload)}`;
}

export function isValidAuthToken(token: string | undefined) {
  if (!token) {
    return false;
  }

  const [payload, signature] = token.split(".");

  if (!payload || !signature) {
    return false;
  }

  const expectedSignature = sign(payload);
  const signatureBuffer = Buffer.from(signature);
  const expectedSignatureBuffer = Buffer.from(expectedSignature);

  if (signatureBuffer.length !== expectedSignatureBuffer.length) {
    return false;
  }

  const signaturesMatch = timingSafeEqual(
    signatureBuffer,
    expectedSignatureBuffer,
  );

  if (!signaturesMatch) {
    return false;
  }

  try {
    const { exp } = JSON.parse(Buffer.from(payload, "base64url").toString());
    return typeof exp === "number" && exp > Math.floor(Date.now() / 1000);
  } catch {
    return false;
  }
}

export async function isAdminAuthenticated() {
  const token = (await cookies()).get("admin_token")?.value;
  return isValidAuthToken(token);
}
