import { NextRequest } from "next/server";
import { mockStore } from "@/lib/mock-db";
import { AUTH_COOKIE_NAME, verifySessionToken } from "@/lib/session";
import { Profile } from "@/lib/types";

export async function resolveUserFromRequest(req: NextRequest): Promise<Profile | null> {
  const sessionCookie = req.cookies.get(AUTH_COOKIE_NAME)?.value;
  if (!sessionCookie) return null;

  const payload = await verifySessionToken(sessionCookie);
  if (!payload || !payload.userId) return null;

  const user = mockStore.getProfile(payload.userId);
  return user || null;
}
