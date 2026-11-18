import { NextRequest, NextResponse } from "next/server";
import { authenticateUser } from "@/lib/session";
import { isStudentCaseGenerationEnabled } from "@/lib/case-permissions";
import {
  FINANCE_DEPARTMENT_PROFILE,
  HR_DEPARTMENT_PROFILE,
  MARKETING_DEPARTMENT_PROFILE,
  DepartmentProfile,
} from "@/config/casepack/departments";

export const dynamic = "force-dynamic";

interface ExtractedUnit {
  name: string;
  topics: string[];
}

export async function POST(req: NextRequest) {
  const auth = await authenticateUser(req, ["admin", "faculty", "student"]);
  if (auth.errorResponse) return auth.errorResponse;

  if (auth.user?.role === "student" && !isStudentCaseGenerationEnabled()) {
    return NextResponse.json(
      {
        error: "Students are restricted from syllabus extraction and case generation. Contact your course faculty.",
        error_code: "STUDENT_GENERATION_DISABLED",
      },
      { status: 403 }
    );
  }

  try {
    const formData = await req.formData();
    const file = formData.get("file") as File | null;
    const departmentId = (formData.get("department") as string) || "finance";

    if (!file) {
      return NextResponse.json({ error: "No file uploaded" }, { status: 400 });
    }

    const buffer = Buffer.from(await file.arrayBuffer());
    let rawText = "";

    const fileNameLower = file.name.toLowerCase();
    if (fileNameLower.endsWith(".pdf")) {
      // eslint-disable-next-line @typescript-eslint/no-require-imports
      const pdfParse = require("pdf-parse");
      const pdfData = await pdfParse(buffer);
      rawText = pdfData.text || "";
    } else if (fileNameLower.endsWith(".docx")) {
      // eslint-disable-next-line @typescript-eslint/no-require-imports
      const mammoth = require("mammoth");
      const result = await mammoth.extractRawText({ buffer });
      rawText = result.value || "";
    } else {
      // Plain text or markdown fallback
      rawText = buffer.toString("utf-8");
    }

    if (!rawText.trim()) {
      return NextResponse.json(
        { error: "Could not extract text from the provided syllabus document" },
        { status: 422 }
      );
    }

    // Heuristic chunking for Units / Modules / Topics
    const lines = rawText
      .split(/\r?\n/)
      .map((l) => l.trim())
      .filter((l) => l.length > 0);

    const units: ExtractedUnit[] = [];
    let currentUnit: ExtractedUnit = { name: "Unit 1: Overview & Fundamentals", topics: [] };

    const unitRegex = /^(unit|module|chapter|section|part)\s+([0-9ivx]+)[:\s\-]*(.*)/i;

    for (const line of lines) {
      const match = line.match(unitRegex);
      if (match) {
        if (currentUnit.topics.length > 0) {
          units.push(currentUnit);
        }
        const unitNumber = match[2];
        const unitTitle = match[3] ? match[3].trim() : `Syllabus Section ${unitNumber}`;
        currentUnit = {
          name: `Unit ${unitNumber}: ${unitTitle}`,
          topics: [],
        };
      } else {
        // Break lines with commas or semicolons or bullet points into topics
        const cleaned = line.replace(/^[•\-\*\d+\.]\s*/, "").trim();
        if (cleaned.length > 3 && cleaned.length < 100) {
          if (cleaned.includes(";") || (cleaned.includes(",") && cleaned.split(",").length <= 5)) {
            const parts = cleaned
              .split(/[,;]/)
              .map((p) => p.trim())
              .filter((p) => p.length >= 3 && p.length <= 60);
            for (const part of parts) {
              if (!currentUnit.topics.includes(part)) {
                currentUnit.topics.push(part);
              }
            }
          } else {
            if (!currentUnit.topics.includes(cleaned)) {
              currentUnit.topics.push(cleaned);
            }
          }
        }
      }
    }

    if (currentUnit.topics.length > 0) {
      units.push(currentUnit);
    }

    // If no distinct unit headers were found, split line items into 2-3 logical groups
    if (units.length === 0 || (units.length === 1 && units[0].topics.length > 8)) {
      const allExtracted = units.length === 1 ? units[0].topics : lines.slice(0, 20);
      const half = Math.ceil(allExtracted.length / 2);
      units.length = 0;
      units.push({
        name: "Unit 1: Core Concepts & Principles",
        topics: allExtracted.slice(0, half),
      });
      if (allExtracted.length > half) {
        units.push({
          name: "Unit 2: Applied Methods & Case Topics",
          topics: allExtracted.slice(half),
        });
      }
    }

    // Correlate with department profiles to identify matching frameworks
    let profile: DepartmentProfile = FINANCE_DEPARTMENT_PROFILE;
    if (departmentId === "hr") profile = HR_DEPARTMENT_PROFILE;
    if (departmentId === "marketing") profile = MARKETING_DEPARTMENT_PROFILE;

    const cleanRawText = rawText.replace(/[\.\(\)\-']/g, "").toLowerCase();
    const matchedFrameworks = profile.frameworks.filter((fw) => {
      const cleanFw = fw.replace(/[\.\(\)\-']/g, "").toLowerCase();
      const coreWords = cleanFw.split(" ").slice(0, 3).join(" ");
      return cleanRawText.includes(coreWords) || rawText.toLowerCase().includes(fw.toLowerCase());
    });

    const allTopics = Array.from(new Set(units.flatMap((u) => u.topics)));

    return NextResponse.json({
      success: true,
      fileName: file.name,
      department: departmentId,
      unitsCount: units.length,
      units,
      allTopics,
      matchedFrameworks,
      suggestedConcepts: allTopics.slice(0, 6),
    });
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : "Failed to parse syllabus";
    return NextResponse.json({ error: msg }, { status: 500 });
  }
}
