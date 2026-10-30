import { NextRequest, NextResponse } from "next/server";
import { mockStore } from "@/lib/mock-db";
import { APP_NAME, COLLEGE_NAME_WITH_SHORT } from "@/config/college";
import { authenticateUser } from "@/lib/session";

export async function GET(req: NextRequest) {
  const { user, errorResponse } = await authenticateUser(req);
  if (errorResponse || !user) {
    return errorResponse || NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { searchParams } = new URL(req.url);
  const requestedStudentId = searchParams.get("studentId");

  const targetStudentId = (user.role === "admin" || user.role === "faculty") && requestedStudentId
    ? requestedStudentId
    : user.id;

  const student = mockStore.getProfile(targetStudentId);
  if (!student) {
    return NextResponse.json({ error: "Student not found." }, { status: 404 });
  }

  const answers = mockStore.getAnswersForStudent(targetStudentId);
  const grades = mockStore.getAllGrades().filter((g) => g.student_id === targetStudentId);

  const archive = {
    institution: COLLEGE_NAME_WITH_SHORT,
    platform: `${APP_NAME} Curriculum Repository`,
    exportedAt: new Date().toISOString(),
    student: {
      id: student.id,
      name: student.name,
      email: student.email,
      role: student.role, // works for "student" and "alumni"
      department_id: student.department_id,
    },
    submissions: answers.map((ans) => {
      const g = grades.find((gr) => gr.answer_id === ans.id);
      return {
        answerId: ans.id,
        caseId: ans.case_id,
        caseTitle: ans.case_title,
        status: ans.status,
        submittedAt: ans.submitted_at,
        wordCount: ans.word_count,
        essayText: ans.text,
        grade: g && g.is_published ? {
          finalMarks: g.final_marks,
          criterionScores: g.criterion_scores,
          facultyComment: g.faculty_comment,
          aiFeedback: g.ai_feedback,
          publishedAt: g.published_at,
        } : null,
      };
    }),
  };

  const filename = `${student.name.replace(/\s+/g, "_")}_SBS_CaseLab_Academic_Archive.json`;

  return new NextResponse(JSON.stringify(archive, null, 2), {
    headers: {
      "Content-Type": "application/json",
      "Content-Disposition": `attachment; filename="${filename}"`,
    },
  });
}
