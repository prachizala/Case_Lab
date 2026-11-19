import { NextResponse, type NextRequest } from "next/server";
import {
  AUTH_COOKIE_NAME,
  SESSION_COOKIE_OPTIONS,
  createSessionToken,
  verifySessionToken,
} from "@/lib/session";
import { mockStore } from "@/lib/mock-db";
import { checkAccess } from "@/lib/access-control";

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  const response = NextResponse.next();

  // Attach Security Headers
  response.headers.set("X-Frame-Options", "DENY");
  response.headers.set("X-Content-Type-Options", "nosniff");
  response.headers.set("Referrer-Policy", "strict-origin-when-cross-origin");
  response.headers.set("X-XSS-Protection", "1; mode=block");
  response.headers.set("Permissions-Policy", "camera=(), microphone=(self), geolocation=()");

  // Paths that do not require role checking
  if (
    pathname.startsWith("/_next") ||
    pathname.startsWith("/api") ||
    pathname.startsWith("/static") ||
    pathname.includes(".") ||
    pathname === "/" ||
    pathname === "/login" ||
    pathname === "/signup" ||
    pathname === "/privacy" ||
    pathname === "/expired" ||
    // Public shareable portfolio links (e.g. /portfolio/usr-student-1)
    (pathname.startsWith("/portfolio/") && pathname.split("/").length > 2)
  ) {
    return response;
  }

  // Read signed, tamper-proof auth cookie
  const sessionCookie = request.cookies.get(AUTH_COOKIE_NAME)?.value;
  let userRole = "faculty";

  if (sessionCookie) {
    const payload = await verifySessionToken(sessionCookie);
    if (payload?.userId) {
      const user = mockStore.getProfile(payload.userId);
      if (user) {
        userRole = user.role;
        const access = checkAccess(user);

        // Pending registrations redirected to login status page
        if (access.status === "pending") {
          const redirectUrl = new URL("/login", request.url);
          redirectUrl.searchParams.set("status", "pending");
          return NextResponse.redirect(redirectUrl);
        }

        // Inactive accounts redirected to login
        if (access.status === "inactive") {
          const redirectUrl = new URL("/login", request.url);
          redirectUrl.searchParams.set("status", "inactive");
          return NextResponse.redirect(redirectUrl);
        }

        // Expired accounts: allowed into /expired, /my-answers, /portfolio; blocked from create, curate, upload
        if (access.status === "expired") {
          const allowedExpiredRoutes = ["/expired", "/my-answers", "/portfolio", "/privacy"];
          const isAllowed = allowedExpiredRoutes.some((route) => pathname.startsWith(route));
          if (!isAllowed) {
            const redirectUrl = new URL("/expired", request.url);
            return NextResponse.redirect(redirectUrl);
          }
        }
      }
    }
  } else {
    // When no cookie is present on protected routes:
    // In demo/dev mode: automatically issue a signed session cookie for Admin
    const isDemo =
      process.env.NODE_ENV !== "production" ||
      process.env.NEXT_PUBLIC_ENABLE_DEMO_MODE === "true";

    if (isDemo) {
      const token = await createSessionToken("usr-admin-1");
      response.cookies.set(AUTH_COOKIE_NAME, token, SESSION_COOKIE_OPTIONS);
      userRole = "admin";
    } else {
      // In strict production, redirect unauthenticated visitors to login
      const redirectUrl = new URL("/login", request.url);
      redirectUrl.searchParams.set("redirect", pathname);
      return NextResponse.redirect(redirectUrl);
    }
  }

  // 1. Student Route Protection
  // Students and Faculty can both create cases (Default Decision 1)
  // Students cannot access faculty curation, admin center, or review queue
  if (userRole === "student") {
    if (
      pathname.startsWith("/faculty") ||
      pathname.startsWith("/admin") ||
      pathname.startsWith("/review-queue")
    ) {
      const redirectUrl = new URL("/dashboard", request.url);
      redirectUrl.searchParams.set(
        "error",
        "Students are restricted from accessing Faculty Review Queue or Admin Center."
      );
      return NextResponse.redirect(redirectUrl);
    }
  }

  // 2. Faculty Route Protection
  // Faculty cannot access admin center
  if (userRole === "faculty") {
    if (pathname.startsWith("/admin")) {
      const redirectUrl = new URL("/dashboard", request.url);
      redirectUrl.searchParams.set(
        "error",
        "Access denied. Administrative privileges are required for the Admin Control Center."
      );
      return NextResponse.redirect(redirectUrl);
    }
  }

  // 3. Admin has access to all routes
  return response;
}

export const config = {
  matcher: [
    "/dashboard/:path*",
    "/create/:path*",
    "/review-queue/:path*",
    "/cases/:path*",
    "/library/:path*",
    "/trending/:path*",
    "/my-answers/:path*",
    "/portfolio/:path*",
    "/faculty/:path*",
    "/student/:path*",
    "/admin/:path*",
    "/pricing/:path*",
    "/analytics/:path*",
    "/guide/:path*",
  ],
};
