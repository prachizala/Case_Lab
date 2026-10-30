import { NextRequest, NextResponse } from "next/server";
import { mockStore } from "@/lib/mock-db";
import { CaseStudy } from "@/lib/types";
import { authenticateUser } from "@/lib/session";

export async function GET(req: NextRequest) {
  const { user, errorResponse } = await authenticateUser(req);
  if (errorResponse || !user) {
    return errorResponse || NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { searchParams } = new URL(req.url);
  const type = searchParams.get("type");
  const language = searchParams.get("language");
  const authorId = searchParams.get("authorId") || searchParams.get("author");
  const industry = searchParams.get("industry");
  const domain = searchParams.get("domain");
  const difficulty = searchParams.get("difficulty");
  const tag = searchParams.get("tag") || searchParams.get("tags");
  const status = searchParams.get("status");
  const format = searchParams.get("format");
  const scope = searchParams.get("scope"); // "my-cases" | "all"
  const collectionId = searchParams.get("collectionId");
  const search = searchParams.get("q")?.toLowerCase();

  // Determine base cases list with role-based visibility
  let cases: CaseStudy[] = mockStore.getCasesForUser(user.id, user.role, user.department_id);

  // Filter by Scope: "my-cases"
  if (scope === "my-cases") {
    cases = cases.filter((c) => c.author_id === user.id);
  }

  // Filter by Collection
  if (collectionId) {
    const col = mockStore.getCollection(collectionId);
    if (col) {
      cases = cases.filter((c) => col.case_ids.includes(c.id));
    } else {
      cases = [];
    }
  }

  // Filter by Industry / Domain
  if (industry && industry !== "all") {
    cases = cases.filter(
      (c) =>
        c.industry.toLowerCase() === industry.toLowerCase() ||
        (c.domain && c.domain.toLowerCase() === industry.toLowerCase())
    );
  }

  if (domain && domain !== "all") {
    cases = cases.filter(
      (c) =>
        (c.domain && c.domain.toLowerCase() === domain.toLowerCase()) ||
        c.industry.toLowerCase().includes(domain.toLowerCase()) ||
        c.function.toLowerCase().includes(domain.toLowerCase())
    );
  }

  // Filter by Status
  if (status && status !== "all") {
    cases = cases.filter((c) => c.status === status);
  }

  // Filter by Type (short | full | research | flash)
  if (type && type !== "all") {
    cases = cases.filter((c) => c.type === type);
  }

  // Filter by Format (hypothetical | real_signal)
  if (format && format !== "all") {
    cases = cases.filter((c) => c.format === format);
  }

  // Filter by Language (en | hi | gu)
  if (language && language !== "all") {
    cases = cases.filter((c) => c.language === language);
  }

  // Filter by Difficulty
  if (difficulty && difficulty !== "all") {
    cases = cases.filter(
      (c) =>
        (c.difficulty && c.difficulty.toLowerCase() === difficulty.toLowerCase()) ||
        c.level.toLowerCase().includes(difficulty.toLowerCase())
    );
  }

  // Filter by Author
  if (authorId && authorId !== "all") {
    cases = cases.filter(
      (c) =>
        c.author_id === authorId ||
        (c.author_name && c.author_name.toLowerCase().includes(authorId.toLowerCase()))
    );
  }

  // Filter by Tag
  if (tag && tag !== "all") {
    const lowerTag = tag.toLowerCase();
    cases = cases.filter(
      (c) =>
        c.tags?.some((t) => t.toLowerCase().includes(lowerTag)) ||
        c.industry.toLowerCase().includes(lowerTag) ||
        c.function.toLowerCase().includes(lowerTag)
    );
  }

  // Search query across all core fields
  if (search) {
    cases = cases.filter(
      (c) =>
        c.title.toLowerCase().includes(search) ||
        c.industry.toLowerCase().includes(search) ||
        c.function.toLowerCase().includes(search) ||
        (c.domain && c.domain.toLowerCase().includes(search)) ||
        (c.author_name && c.author_name.toLowerCase().includes(search)) ||
        c.tags?.some((t) => t.toLowerCase().includes(search)) ||
        c.content?.summary?.toLowerCase().includes(search)
    );
  }

  const total = cases.length;
  const limitParam = searchParams.get("limit");
  const offsetParam = searchParams.get("offset");
  if (limitParam) {
    const limit = parseInt(limitParam, 10);
    const offset = offsetParam ? parseInt(offsetParam, 10) : 0;
    if (!isNaN(limit) && limit > 0) {
      cases = cases.slice(offset, offset + limit);
    }
  }

  if (user.role === "student") {
    cases = cases.map((c) => {
      if (c.content && c.content.teaching_note) {
        const sanitizedContent = { ...c.content };
        delete sanitizedContent.teaching_note;
        return { ...c, content: sanitizedContent };
      }
      return c;
    });
  }

  return NextResponse.json(
    { cases, total },
    {
      headers: {
        "Cache-Control": "public, s-maxage=30, stale-while-revalidate=60",
      },
    }
  );
}

export async function POST(req: NextRequest) {
  try {
    const { user, errorResponse } = await authenticateUser(req, ["faculty", "admin"]);
    if (errorResponse || !user) {
      return errorResponse || NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await req.json().catch(() => ({}));

    // Handle legacy audit-runner approve action if present in body
    if (body.action === "approve" && body.case_id) {
      const approved = mockStore.approveCase(body.case_id, user.id);
      if (!approved) {
        return NextResponse.json({ error: "Case not found for approval." }, { status: 404 });
      }
      return NextResponse.json({ success: true, caseStudy: approved });
    }

    const caseData: CaseStudy = body;
    if (!caseData.id || !caseData.title) {
      return NextResponse.json(
        { error: "Missing required case identification or title." },
        { status: 400 }
      );
    }

    const saved = mockStore.saveCase({
      ...caseData,
      author_id: caseData.author_id || user.id,
      author_name: caseData.author_name || user.name,
    });
    return NextResponse.json({ success: true, caseStudy: saved });
  } catch (err: unknown) {
    console.error("Save case error:", err);
    return NextResponse.json(
      { error: "Failed to persist case study." },
      { status: 500 }
    );
  }
}
