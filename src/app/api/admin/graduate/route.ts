import { NextRequest, NextResponse } from "next/server";
import { mockStore } from "@/lib/mock-db";
import { authenticateUser } from "@/lib/session";
import { COLLEGE_SHORT } from "@/config/college";

export const dynamic = "force-dynamic";

export async function POST(req: NextRequest) {
  try {
    const auth = await authenticateUser(req, ["admin"]);
    if (auth.errorResponse) return auth.errorResponse;
    const adminUser = auth.user!;

    const body = await req.json();
    const { studentId, studentIds } = body;

    // Batch graduation job
    if (Array.isArray(studentIds) && studentIds.length > 0) {
      const results = studentIds.map((id) =>
        mockStore.graduateStudent(id, adminUser.id, adminUser.email)
      );
      const successfulCount = results.filter((r) => r.success).length;
      return NextResponse.json({
        success: true,
        message: `Successfully completed graduation processing for ${successfulCount} students.`,
        results,
      });
    }

    // Single student graduation
    if (!studentId) {
      return NextResponse.json(
        { error: "studentId or studentIds array is required." },
        { status: 400 }
      );
    }

    const res = mockStore.graduateStudent(studentId, adminUser.id, adminUser.email);
    if (!res.success) {
      return NextResponse.json({ error: res.error }, { status: 404 });
    }

    return NextResponse.json({
      success: true,
      message: `Student successfully graduated to ${COLLEGE_SHORT} Alumni status.`,
      user: res.user,
    });
  } catch (err: unknown) {
    console.error("Graduation error:", err);
    return NextResponse.json(
      { error: "Graduation request processing failed." },
      { status: 500 }
    );
  }
}
