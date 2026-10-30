import { NextRequest, NextResponse } from "next/server";
import { mockStore } from "./mock-db";
import { Profile, UserRole } from "./types";

export const AUTH_COOKIE_NAME = "sbs_caselab_session";

function getSessionSecret(): string {
  return process.env.SESSION_SECRET || "sbs_caselab_secure_session_secret_key_2026_dev";
}

/**
 * Encodes Uint8Array or ArrayBuffer into base64url string
 */
function base64url(buffer: ArrayBuffer | Uint8Array): string {
  const bytes = buffer instanceof Uint8Array ? buffer : new Uint8Array(buffer);
  let binary = "";
  for (let i = 0; i < bytes.byteLength; i++) {
    binary += String.fromCharCode(bytes[i]);
  }
  return btoa(binary)
    .replace(/\+/g, "-")
    .replace(/\//g, "_")
    .replace(/=+$/, "");
}

/**
 * Decodes base64url string into Uint8Array
 */
function unbase64url(str: string): Uint8Array {
  let base64 = str.replace(/-/g, "+").replace(/_/g, "/");
  while (base64.length % 4) {
    base64 += "=";
  }
  const binary = atob(base64);
  const bytes = new Uint8Array(binary.length);
  for (let i = 0; i < binary.length; i++) {
    bytes[i] = binary.charCodeAt(i);
  }
  return bytes;
}

/**
 * Import HMAC crypto key using Web Crypto API
 */
async function getCryptoKey(): Promise<CryptoKey> {
  const secret = getSessionSecret();
  const encoder = new TextEncoder();
  return await crypto.subtle.importKey(
    "raw",
    encoder.encode(secret),
    { name: "HMAC", hash: "SHA-256" },
    false,
    ["sign", "verify"]
  );
}

export interface SessionPayload {
  userId: string;
  iat: number;
  exp: number;
}

/**
 * Creates a cryptographically signed, tamper-proof session JWT token (8 hours expiry)
 */
export async function createSessionToken(userId: string): Promise<string> {
  const encoder = new TextEncoder();
  const header = { alg: "HS256", typ: "JWT" };
  const now = Math.floor(Date.now() / 1000);
  const payload: SessionPayload = {
    userId,
    iat: now,
    exp: now + 8 * 60 * 60, // 8 hours expiry
  };

  const headerB64 = base64url(encoder.encode(JSON.stringify(header)));
  const payloadB64 = base64url(encoder.encode(JSON.stringify(payload)));
  const dataToSign = encoder.encode(`${headerB64}.${payloadB64}`);

  const key = await getCryptoKey();
  const signatureBuffer = await crypto.subtle.sign("HMAC", key, dataToSign);
  const signatureB64 = base64url(signatureBuffer);

  return `${headerB64}.${payloadB64}.${signatureB64}`;
}

/**
 * Verifies the signature and expiration of a session token.
 * Returns the payload if valid; returns null if forged, tampered, or expired.
 */
export async function verifySessionToken(token: string | undefined | null): Promise<SessionPayload | null> {
  if (!token || typeof token !== "string") return null;

  const parts = token.split(".");
  if (parts.length !== 3) return null;

  const [headerB64, payloadB64, signatureB64] = parts;
  const encoder = new TextEncoder();
  const dataToVerify = encoder.encode(`${headerB64}.${payloadB64}`);

  try {
    const key = await getCryptoKey();
    const signatureBytes = unbase64url(signatureB64);
    const isValid = await crypto.subtle.verify("HMAC", key, signatureBytes as unknown as BufferSource, dataToVerify);

    if (!isValid) {
      return null;
    }

    const payloadJson = new TextDecoder().decode(unbase64url(payloadB64));
    const payload: SessionPayload = JSON.parse(payloadJson);

    // Verify 8-hour expiration
    const now = Math.floor(Date.now() / 1000);
    if (payload.exp && now > payload.exp) {
      return null;
    }

    if (!payload.userId) {
      return null;
    }

    return payload;
  } catch {
    return null;
  }
}

/**
 * Standard cookie configuration for HttpOnly, Secure, SameSite=Lax, 8h expiry
 */
export const SESSION_COOKIE_OPTIONS = {
  name: AUTH_COOKIE_NAME,
  path: "/",
  httpOnly: true,
  secure: process.env.NODE_ENV === "production",
  sameSite: "lax" as const,
  maxAge: 8 * 60 * 60, // 8 hours in seconds
};

/**
 * Sets the signed session cookie on a NextResponse
 */
export async function setSessionCookie(response: NextResponse, userId: string): Promise<void> {
  const token = await createSessionToken(userId);
  response.cookies.set(AUTH_COOKIE_NAME, token, SESSION_COOKIE_OPTIONS);
}

/**
 * Clears the session cookie on a NextResponse
 */
export function clearSessionCookie(response: NextResponse): void {
  response.cookies.delete(AUTH_COOKIE_NAME);
}

/**
 * Server-side Authentication & Authorization Guard for API Routes.
 * Never trusts role from client; strictly loads user and role from the server database.
 * Returns 401 if unauthenticated or session forged.
 * Returns 403 if role is disallowed.
 */
export async function authenticateUser(
  req: NextRequest,
  allowedRoles?: UserRole[]
): Promise<{ user: Profile | null; errorResponse: NextResponse | null }> {
  const cookieValue = req.cookies.get(AUTH_COOKIE_NAME)?.value;

  if (!cookieValue) {
    return {
      user: null,
      errorResponse: NextResponse.json(
        { error: "Unauthorized. Authentication required. Please sign in." },
        { status: 401 }
      ),
    };
  }

  const payload = await verifySessionToken(cookieValue);
  if (!payload || !payload.userId) {
    return {
      user: null,
      errorResponse: NextResponse.json(
        { error: "Unauthorized. Session signature invalid or expired." },
        { status: 401 }
      ),
    };
  }

  // Strictly load user and role from server data store
  const user = mockStore.getProfile(payload.userId);
  if (!user) {
    return {
      user: null,
      errorResponse: NextResponse.json(
        { error: "Unauthorized. User record does not exist." },
        { status: 401 }
      ),
    };
  }

  // Check role authorization
  if (allowedRoles && allowedRoles.length > 0) {
    if (!allowedRoles.includes(user.role)) {
      return {
        user,
        errorResponse: NextResponse.json(
          {
            error: `Forbidden. Insufficient permissions. Requires one of: ${allowedRoles.join(", ")}.`,
          },
          { status: 403 }
        ),
      };
    }
  }

  return { user, errorResponse: null };
}
