import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { authenticateUser } from "@/lib/session";
import { mockStore } from "@/lib/mock-db";
import { feedbackStore } from "@/lib/casepack/feedback-store";

export const dynamic = "force-dynamic";

const CreateFeedbackSchema = z.object({
  case_id: z.string().min(1, "case_id is required"),
  case_title: z.string().optional(),
  department: z.enum(["finance", "hr", "marketing"]),
  rating: z.number().int().min(1).max(5),
  flagged_issues: z.array(z.string()).default([]),
  comments: z.string().optional(),
  promote_to_gold: z.boolean().default(false),
});

const UpdateStatusSchema = z.object({
  id: z.string().min(1),
  status: z.enum(["submitted", "under_review", "promoted", "rejected"]),
});

export async function POST(req: NextRequest) {
  const auth = await authenticateUser(req, ["admin", "faculty"]);
  if (auth.errorResponse) return auth.errorResponse;

  try {
    const body = await req.json();
    const parsed = CreateFeedbackSchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json(
        { error: "Validation error", details: parsed.error.issues },
        { status: 400 }
      );
    }

    const { case_id, case_title, department, rating, flagged_issues, comments, promote_to_gold } = parsed.data;

    // Create feedback in store
    const item = feedbackStore.addFeedback({
      case_id,
      case_title: case_title || `CE Pack (${department.toUpperCase()})`,
      user_id: auth.user!.id,
      user_name: auth.user!.name || auth.user!.email,
      user_email: auth.user!.email,
      department,
      rating,
      flagged_issues,
      comments,
      promote_to_gold,
    });

    // Log into administrative audit ledger
    mockStore.logAudit(
      auth.user!.id,
      auth.user!.email,
      "casepack_feedback_submitted",
      case_id,
      "case",
      {
        feedback_id: item.id,
        department,
        rating,
        promote_to_gold,
        flagged_issues,
        comments,
      }
    );

    return NextResponse.json({
      success: true,
      feedback: item,
      message: promote_to_gold
        ? "Feedback submitted and case nominated for Gold Reference status!"
        : "Feedback submitted successfully.",
    });
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : "Internal server error";
    return NextResponse.json({ error: msg }, { status: 500 });
  }
}

export async function GET(req: NextRequest) {
  const auth = await authenticateUser(req, ["admin", "faculty"]);
  if (auth.errorResponse) return auth.errorResponse;

  const metrics = feedbackStore.getMetrics();
  const feedbacks = feedbackStore.getFeedbacks();

  return NextResponse.json({
    metrics,
    feedbacks,
  });
}

export async function PATCH(req: NextRequest) {
  // Only admin can promote or reject gold example candidate
  const auth = await authenticateUser(req, ["admin"]);
  if (auth.errorResponse) return auth.errorResponse;

  try {
    const body = await req.json();
    const parsed = UpdateStatusSchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json(
        { error: "Validation error", details: parsed.error.issues },
        { status: 400 }
      );
    }

    const updated = feedbackStore.updateStatus(parsed.data.id, parsed.data.status);
    if (!updated) {
      return NextResponse.json({ error: "Feedback item not found" }, { status: 404 });
    }

    mockStore.logAudit(
      auth.user!.id,
      auth.user!.email,
      "gold_reference_status_updated",
      updated.case_id,
      "case",
      {
        feedback_id: updated.id,
        new_status: updated.status,
      }
    );

    return NextResponse.json({
      success: true,
      feedback: updated,
    });
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : "Internal server error";
    return NextResponse.json({ error: msg }, { status: 500 });
  }
}
