"use client";

import { Profile } from "./types";

interface CachedAuth {
  user: Profile | null;
  timestamp: number;
}

let memoryAuthCache: CachedAuth | null = null;
let inFlightAuthPromise: Promise<Profile | null> | null = null;
const CACHE_TTL_MS = 30000; // 30 seconds cache TTL

/**
 * Fetch current authenticated user with in-memory caching and request deduplication.
 * Prevents multiple components on the same page from firing duplicate /api/auth requests.
 * When forceFresh is true, bypasses in-memory cache and enforces no-store on the HTTP fetch.
 */
export async function getCachedUser(forceFresh: boolean = false): Promise<Profile | null> {
  const now = Date.now();

  if (forceFresh) {
    memoryAuthCache = null;
    inFlightAuthPromise = null;
  } else if (memoryAuthCache && now - memoryAuthCache.timestamp < CACHE_TTL_MS) {
    return memoryAuthCache.user;
  }

  // Deduplicate concurrent requests
  if (inFlightAuthPromise) {
    return inFlightAuthPromise;
  }

  inFlightAuthPromise = (async () => {
    try {
      const res = await fetch("/api/auth", {
        cache: forceFresh ? "no-store" : "default",
        headers: forceFresh
          ? { "Cache-Control": "no-cache, no-store, must-revalidate", Pragma: "no-cache" }
          : { "Cache-Control": "max-age=30" },
      });
      if (!res.ok) {
        memoryAuthCache = { user: null, timestamp: now };
        return null;
      }
      const data = await res.json();
      const user = (data.user as Profile) || null;
      memoryAuthCache = { user, timestamp: Date.now() };
      return user;
    } catch (err) {
      console.error("Auth fetch error:", err);
      return null;
    } finally {
      inFlightAuthPromise = null;
    }
  })();

  return inFlightAuthPromise;
}

/**
 * Invalidate cached user (used upon role-switching, login, logout, or profile changes)
 * Broadcasts an "sbs-auth-changed" event so mounted components can immediately synchronize.
 */
export function invalidateAuthCache(): void {
  memoryAuthCache = null;
  inFlightAuthPromise = null;
  if (typeof window !== "undefined") {
    window.dispatchEvent(new CustomEvent("sbs-auth-changed"));
  }
}

/**
 * Force a fresh fetch of the current session user from the server
 */
export async function fetchFreshUser(): Promise<Profile | null> {
  invalidateAuthCache();
  return getCachedUser(true);
}
