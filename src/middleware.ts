import { NextResponse, type NextRequest } from "next/server";
import { AUTH_COOKIE_NAME, verifySessionToken } from "@/lib/session";
import { mockStore } from "@/lib/mock-db";

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
    // Public shareable portfolio links (e.g. /portfolio/usr-student-1)
    (pathname.startsWith("/portfolio/") && pathname.split("/").length > 2)
  ) {
    return response;
  }

  // Read signed, tamper-proof auth cookie
  const sessionCookie = request.cookies.get(AUTH_COOKIE_NAME)?.value;
  let userRole = "faculty"; // Fallback demo role for client navigation if unauthenticated

  if (sessionCookie) {
    const payload = await verifySessionToken(sessionCookie);
    if (payload?.userId) {
      const user = mockStore.getProfile(payload.userId);
      if (user) {
        userRole = user.role;
      }
    }
  }

  // 1. Student Route Protection
  // Students cannot access case generation, admin center, review queue, or analytics
  if (userRole === "student") {
    if (
      pathname.startsWith("/faculty") ||
      pathname.startsWith("/admin") ||
      pathname.startsWith("/create") ||
      pathname.startsWith("/review-queue") ||
      pathname.startsWith("/analytics") ||
      pathname.startsWith("/guide")
    ) {
      const redirectUrl = new URL("/dashboard", request.url);
      redirectUrl.searchParams.set(
        "error",
        "Students are restricted from accessing Case Generation, Review Queue, Analytics, or Admin Center."
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
