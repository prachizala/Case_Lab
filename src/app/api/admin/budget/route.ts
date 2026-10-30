import { NextRequest, NextResponse } from "next/server";
import { mockStore } from "@/lib/mock-db";
import { authenticateUser } from "@/lib/session";

export const dynamic = "force-dynamic";

export async function GET(req: NextRequest) {
  try {
    const auth = await authenticateUser(req, ["admin"]);
    if (auth.errorResponse) return auth.errorResponse;

    const budgetInfo = mockStore.getTokenBudgetInfo();
    const remaining_tokens = Math.max(0, budgetInfo.monthly_budget_tokens - budgetInfo.tokens_used_this_month);
    const warning = budgetInfo.usage_percentage >= 80;

    return NextResponse.json({
      success: true,
      budget: {
        ...budgetInfo,
        remaining_tokens,
        warning,
      },
    });
  } catch (err: unknown) {
    console.error("Budget fetch error:", err);
    return NextResponse.json(
      { error: "Failed to retrieve institutional token budget telemetry." },
      { status: 500 }
    );
  }
}

export async function POST(req: NextRequest) {
  try {
    const auth = await authenticateUser(req, ["admin"]);
    if (auth.errorResponse) return auth.errorResponse;

    const body = await req.json();
    const { monthlyBudgetTokens } = body;

    if (!monthlyBudgetTokens || typeof monthlyBudgetTokens !== "number" || monthlyBudgetTokens <= 0) {
      return NextResponse.json(
        { error: "monthlyBudgetTokens must be a positive integer." },
        { status: 400 }
      );
    }

    mockStore.setMonthlyTokenBudget(monthlyBudgetTokens);
    const updated = mockStore.getTokenBudgetInfo();
    const remaining_tokens = Math.max(0, updated.monthly_budget_tokens - updated.tokens_used_this_month);
    const warning = updated.usage_percentage >= 80;

    return NextResponse.json({
      success: true,
      message: "Monthly AI token allocation successfully adjusted.",
      budget: {
        ...updated,
        remaining_tokens,
        warning,
      },
    });
  } catch (err: unknown) {
    console.error("Budget update error:", err);
    return NextResponse.json(
      { error: "Failed to update institutional token budget." },
      { status: 500 }
    );
  }
}
