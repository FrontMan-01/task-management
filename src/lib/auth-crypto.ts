import crypto from "crypto";

const DEFAULT_SALT_ROUNDS = 16;
const KEY_LEN = 64;

export function hashPinWithSalt(pin: string, salt?: string): string {
  const chosenSalt = salt || crypto.randomBytes(DEFAULT_SALT_ROUNDS).toString("hex");
  const derivedKey = crypto.scryptSync(pin, chosenSalt, KEY_LEN);
  return `${chosenSalt}:${derivedKey.toString("hex")}`;
}

export function verifyPinAgainstHash(enteredPin: string, storedSaltAndHash: string): boolean {
  try {
    const [salt, expectedHashHex] = storedSaltAndHash.split(":");
    if (!salt || !expectedHashHex) return false;

    const expectedBuffer = Buffer.from(expectedHashHex, "hex");
    const actualBuffer = crypto.scryptSync(enteredPin, salt, expectedBuffer.length);

    if (actualBuffer.length !== expectedBuffer.length) return false;

    return crypto.timingSafeEqual(actualBuffer, expectedBuffer);
  } catch (err) {
    console.error("Error verifying PIN hash:", err);
    return false;
  }
}

/**
 * Validates the entered PIN against environment configuration.
 * Refuses default '1234' in production environments.
 */
export function verifyMasterPin(enteredPin: string): {
  valid: boolean;
  error?: string;
} {
  const isProd = process.env.NODE_ENV === "production";
  const pinHash = process.env.APP_PIN_HASH;
  const rawPin = process.env.APP_PIN || process.env.APP_PASSWORD;

  // 1. Production Security Gate: Refuse default or missing PIN
  if (isProd) {
    if (!pinHash && (!rawPin || rawPin === "1234")) {
      console.error(
        "CRITICAL SECURITY ALERT: Production deployment detected without a custom APP_PIN or APP_PIN_HASH. Default '1234' is blocked."
      );
      return {
        valid: false,
        error: "Security Lockout: Production requires a custom, non-default APP_PIN or APP_PIN_HASH.",
      };
    }
  }

  // 2. Verification against precomputed salted hash (Preferred)
  if (pinHash) {
    const isValid = verifyPinAgainstHash(enteredPin, pinHash);
    return { valid: isValid, error: isValid ? undefined : "Incorrect PIN" };
  }

  // 3. Verification against raw APP_PIN (using salted constant-time comparison)
  const expectedPin = rawPin || (isProd ? null : "1234");
  if (!expectedPin) {
    return {
      valid: false,
      error: "APP_PIN is not configured in environment variables.",
    };
  }

  // Generate deterministic salt for the configured PIN to run timing-safe scrypt comparison
  const sessionSecret = getSessionSecret();
  const salt = crypto
    .createHash("sha256")
    .update(sessionSecret)
    .digest("hex")
    .slice(0, 32);

  const expectedKey = crypto.scryptSync(expectedPin, salt, KEY_LEN);
  const actualKey = crypto.scryptSync(enteredPin, salt, KEY_LEN);

  const isValid = crypto.timingSafeEqual(actualKey, expectedKey);
  return { valid: isValid, error: isValid ? undefined : "Incorrect PIN" };
}

let ephemeralDevSecret: string | null = null;

/**
 * Retrieves the cryptographic session secret.
 * Enforces strict presence in production (no hardcoded fallback).
 */
export function getSessionSecret(): string {
  const configuredSecret = process.env.SESSION_SECRET;
  if (configuredSecret && configuredSecret.trim().length > 0) {
    return configuredSecret.trim();
  }

  if (process.env.NODE_ENV === "production") {
    throw new Error(
      "CRITICAL SECURITY CONFIGURATION ERROR: SESSION_SECRET environment variable is missing in production. Refusing to sign or verify tokens with insecure fallbacks."
    );
  }

  // In local development without an explicit SESSION_SECRET,
  // generate an ephemeral in-memory random secret per process.
  // NEVER use a static string literal that could be forged by reading source code.
  if (!ephemeralDevSecret) {
    ephemeralDevSecret = crypto.randomBytes(32).toString("hex");
  }
  return ephemeralDevSecret;
}

/**
 * Signs a tamper-proof session token with HMAC-SHA256
 */
export function createSessionToken(): string {
  const secret = getSessionSecret();
  const payload = JSON.stringify({
    authed: true,
    iat: Date.now(),
    exp: Date.now() + 1000 * 60 * 60 * 24 * 30, // 30 days
  });

  const payloadB64 = Buffer.from(payload).toString("base64url");
  const signature = crypto
    .createHmac("sha256", secret)
    .update(payloadB64)
    .digest("base64url");

  return `${payloadB64}.${signature}`;
}

/**
 * Validates a signed session token
 */
export function verifySessionToken(token: string): boolean {
  try {
    const [payloadB64, signature] = token.split(".");
    if (!payloadB64 || !signature) return false;

    const secret = getSessionSecret();
    const expectedSignature = crypto
      .createHmac("sha256", secret)
      .update(payloadB64)
      .digest("base64url");

    const expectedBuffer = Buffer.from(expectedSignature);
    const actualBuffer = Buffer.from(signature);

    if (expectedBuffer.length !== actualBuffer.length) return false;
    if (!crypto.timingSafeEqual(actualBuffer, expectedBuffer)) return false;

    const payload = JSON.parse(Buffer.from(payloadB64, "base64url").toString("utf-8"));
    if (!payload.authed || !payload.exp || Date.now() > payload.exp) {
      return false;
    }

    return true;
  } catch {
    return false;
  }
}
