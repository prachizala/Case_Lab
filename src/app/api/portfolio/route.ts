import { NextRequest, NextResponse } from "next/server";
import { mockStore } from "@/lib/mock-db";
import { authenticateUser } from "@/lib/session";

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const studentId = searchParams.get("studentId");
  const isPublicRequest = searchParams.get("public") === "true";

  // Public portfolio access (when toggled public by student)
  if (isPublicRequest) {
    if (!studentId) {
      return NextResponse.json({ error: "studentId is required for public view." }, { status: 400 });
    }

    const publicPortfolio = mockStore.getPublicPortfolio(studentId);
    if (!publicPortfolio) {
      return NextResponse.json(
        { error: "This student portfolio is private or does not exist." },
        { status: 404 }
      );
    }

    return NextResponse.json({ portfolio: publicPortfolio });
  }

  // Authenticated view
  const { user, errorResponse } = await authenticateUser(req);
  if (errorResponse || !user) {
    return errorResponse || NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const targetStudentId = (user.role === "admin" || user.role === "faculty") && studentId
    ? studentId
    : user.id;

  const profile = mockStore.getProfile(targetStudentId);
  if (!profile) {
    return NextResponse.json({ error: "Student profile not found." }, { status: 404 });
  }

  const answers = mockStore.getAnswersForStudent(targetStudentId);
  const gradedAnswers = answers.filter((a) => a.grade && a.grade.final_marks !== null);

  const totalMarks = gradedAnswers.reduce((sum, a) => sum + (a.grade?.final_marks || 0), 0);
  const averageScore = gradedAnswers.length > 0 ? Math.round(totalMarks / gradedAnswers.length) : 0;

  return NextResponse.json({
    profile,
    answers,
    gradedCount: gradedAnswers.length,
    averageScore,
    isPublic: profile.portfolio_public || false,
  });
}

export async function POST(req: NextRequest) {
  try {
    const { user, errorResponse } = await authenticateUser(req);
    if (errorResponse || !user) {
      return errorResponse || NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await req.json().catch(() => ({}));
    const { action, isPublic } = body;
    const targetStudentId = user.id;

    if (action === "toggle-public") {
      const updatedProfile = mockStore.togglePortfolioPublic(targetStudentId, Boolean(isPublic));
      if (!updatedProfile) {
        return NextResponse.json({ error: "Student not found." }, { status: 404 });
      }

      return NextResponse.json({
        success: true,
        isPublic: updatedProfile.portfolio_public,
        message: updatedProfile.portfolio_public
          ? "Portfolio is now public and shareable."
          : "Portfolio is now private.",
      });
    }

    return NextResponse.json({ error: "Invalid action." }, { status: 400 });
  } catch (err: unknown) {
    console.error("Portfolio POST error:", err);
    return NextResponse.json({ error: "Failed to update portfolio settings." }, { status: 500 });
  }
}
