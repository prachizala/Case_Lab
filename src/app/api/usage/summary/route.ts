import { NextRequest, NextResponse } from "next/server";
import { authenticateUser } from "@/lib/session";
import { tokenUsageTracker } from "@/lib/groq/tracking";
import { TokenBudgetSummarySchema } from "@/lib/groq/types";

export const dynamic = "force-dynamic";

export async function GET(req: NextRequest) {
  // Allow all authenticated users (students, faculty, admin) to read summary telemetry
  const auth = await authenticateUser(req);
  if (auth.errorResponse) return auth.errorResponse;

  try {
    const { searchParams } = new URL(req.url);
    const period = searchParams.get("period") || undefined;

    const summary = tokenUsageTracker.getSummary(period);

    // Validate response against strict Zod schema
    const validated = TokenBudgetSummarySchema.parse(summary);

    return NextResponse.json(validated, {
      headers: {
        "Cache-Control": "no-store, max-age=0",
      },
    });
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : "Internal server error";
    return NextResponse.json({ error: msg }, { status: 500 });
  }
}
