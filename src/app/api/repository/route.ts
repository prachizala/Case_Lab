import { NextRequest, NextResponse } from "next/server";
import { mockStore } from "@/lib/mock-db";
import { authenticateUser } from "@/lib/session";
import { sanitizeCaseStudyForStudent } from "@/lib/case-permissions";
import { CaseStudy, RepositoryItem } from "@/lib/types";

export const dynamic = "force-dynamic";

export async function GET(req: NextRequest) {
  try {
    const { user, errorResponse } = await authenticateUser(req);
    if (errorResponse || !user) {
      return errorResponse || NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { searchParams } = new URL(req.url);
    const q = searchParams.get("q")?.toLowerCase() || "";
    const departmentId = searchParams.get("department_id") || searchParams.get("department");
    const courseId = searchParams.get("course_id") || searchParams.get("course");
    const categoryId = searchParams.get("category_id") || searchParams.get("category");
    const domain = searchParams.get("domain");
    const caseType = searchParams.get("case_type") || searchParams.get("type");
    const keyword = searchParams.get("keyword") || searchParams.get("keywords")?.toLowerCase();
    const year = searchParams.get("year");
    const hasTeachingNotes = searchParams.get("has_teaching_notes") === "true";

    // 1. Fetch all repository items
    let repoItems = mockStore.getRepositoryItems({ is_published: true });

    // 2. Filter by Department
    if (departmentId && departmentId !== "all") {
      repoItems = repoItems.filter((item) => item.department_id === departmentId);
    }

    // 3. Filter by Course
    if (courseId && courseId !== "all") {
      repoItems = repoItems.filter((item) => item.course_id === courseId);
    }

    // 4. Filter by Category
    if (categoryId && categoryId !== "all") {
      repoItems = repoItems.filter((item) => item.category_id === categoryId);
    }

    // 5. Filter by Year
    if (year && year !== "all") {
      repoItems = repoItems.filter((item) => {
        const itemYear = new Date(item.uploaded_at).getFullYear().toString();
        return itemYear === year;
      });
    }

    // 6. Filter by Keywords
    if (keyword && keyword !== "all") {
      repoItems = repoItems.filter((item) =>
        item.keywords?.some((k) => k.toLowerCase().includes(keyword))
      );
    }

    // 7. Join with underlying CaseStudy record & apply content filters
    const results = repoItems
      .map((item) => {
        const foundCase = mockStore.getCase(item.case_id);
        if (!foundCase) return null;

        // Filter by Case Type if specified
        if (caseType && caseType !== "all" && foundCase.type !== caseType) {
          return null;
        }

        // Filter by Domain if specified
        if (domain && domain !== "all") {
          if (domain.toLowerCase() === "unassigned") {
            if (foundCase.domain && foundCase.domain.toLowerCase() !== "unassigned") {
              return null;
            }
          } else {
            if (!foundCase.domain || foundCase.domain.toLowerCase() !== domain.toLowerCase()) {
              return null;
            }
          }
        }

        // Filter: "Only cases with teaching notes" (Only faculty and admin can use this filter)
        if (hasTeachingNotes && (user.role === "faculty" || user.role === "admin")) {
          const content = foundCase.content as any;
          const hasNote = Boolean(content?.teaching_note || content?.teaching_notes || content?.model_answers);
          if (!hasNote) return null;
        }

        // Text Search (q)
        if (q) {
          const titleMatch = foundCase.title.toLowerCase().includes(q);
          const authorMatch = (item.author_name || "").toLowerCase().includes(q);
          const keywordMatch = item.keywords?.some((k) => k.toLowerCase().includes(q));
          const summaryMatch = (foundCase.content?.summary || "").toLowerCase().includes(q);
          if (!titleMatch && !authorMatch && !keywordMatch && !summaryMatch) {
            return null;
          }
        }

        // Student Data Sanitization: Never send confidential answers to students!
        let processedCase = foundCase;
        if (user.role === "student") {
          processedCase = sanitizeCaseStudyForStudent(foundCase);
        }

        const depts = mockStore.getDepartments();
        const courses = mockStore.getCourses();
        const cats = mockStore.getCaseCategories();

        const deptObj = depts.find((d) => d.id === item.department_id);
        const courseObj = courses.find((c) => c.id === item.course_id);
        const catObj = cats.find((c) => c.id === item.category_id);

        return {
          ...item,
          caseStudy: processedCase,
          department_name: deptObj?.name || "General Management",
          course_name: courseObj?.name || "Institutional Curriculum",
          category_name: catObj?.name || "Curriculum Case",
          year: new Date(item.uploaded_at).getFullYear(),
          page_target: processedCase.page_target || 5,
        };
      })
      .filter(Boolean);

    return NextResponse.json({
      success: true,
      total: results.length,
      items: results,
    });
  } catch (err: unknown) {
    console.error("Repository search error:", err);
    return NextResponse.json(
      { error: "Failed to retrieve repository records." },
      { status: 500 }
    );
  }
}
