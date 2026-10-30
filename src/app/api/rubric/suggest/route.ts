import { NextRequest, NextResponse } from "next/server";
import { mockStore } from "@/lib/mock-db";
import { Anthropic } from "@anthropic-ai/sdk";
import { RubricCriterion } from "@/lib/types";
import { COLLEGE_NAME_WITH_SHORT } from "@/config/college";
import { authenticateUser } from "@/lib/session";

export async function POST(req: NextRequest) {
  try {
    const { user, errorResponse } = await authenticateUser(req, ["faculty", "admin"]);
    if (errorResponse || !user) {
      return errorResponse || NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { caseId } = await req.json().catch(() => ({}));
    if (!caseId) {
      return NextResponse.json({ error: "caseId is required." }, { status: 400 });
    }

    const caseStudy = mockStore.getCase(caseId);
    if (!caseStudy) {
      return NextResponse.json({ error: "Case study not found." }, { status: 404 });
    }

    const apiKey = process.env.ANTHROPIC_API_KEY;
    if (apiKey && apiKey.startsWith("sk-ant-") && !apiKey.includes("placeholder")) {
      try {
        const anthropic = new Anthropic({ apiKey });
        const prompt = `You are a curriculum dean and case study assessment architect at ${COLLEGE_NAME_WITH_SHORT}.
Design a rigorous 4-part grading rubric for student analysis of the following business teaching case:

Case Title: "${caseStudy.title}"
Industry: ${caseStudy.industry}
Functional Focus: ${caseStudy.function}
Level: ${caseStudy.level}
Decision Point: "${caseStudy.content.decision_point}"
Pedagogical Objectives: ${caseStudy.content.teaching_note?.objectives?.join("; ") || "General Strategic Analysis & Problem Solving"}

Return ONLY valid JSON with this exact array structure of 4 criteria, where max_marks sum to 100:
[
  { "name": "Criterion Name", "max_marks": 30, "description": "Specific analytical expectations..." },
  { "name": "Criterion Name", "max_marks": 30, "description": "Specific analytical expectations..." },
  { "name": "Criterion Name", "max_marks": 25, "description": "Specific analytical expectations..." },
  { "name": "Criterion Name", "max_marks": 15, "description": "Specific analytical expectations..." }
]`;

        const response = await anthropic.messages.create({
          model: "claude-3-5-sonnet-20241022",
          max_tokens: 1000,
          temperature: 0.3,
          messages: [{ role: "user", content: prompt }],
        });

        const text = response.content[0].type === "text" ? response.content[0].text : "";
        const jsonMatch = text.match(/\[[\s\S]*\]/);
        if (jsonMatch) {
          const parsed = JSON.parse(jsonMatch[0]);
          return NextResponse.json({ success: true, criteria: parsed });
        }
      } catch (aiErr) {
        console.warn("Claude rubric generation fallback to deterministic model:", aiErr);
      }
    }

    // High-quality deterministic pedagogical fallback
    const suggestedCriteria: RubricCriterion[] = [
      {
        name: `Strategic Diagnosis & ${caseStudy.function} Analysis`,
        max_marks: 30,
        description: `Rigorous identification of core market tensions in ${caseStudy.industry}, evaluating macro volatility and operational constraints.`,
      },
      {
        name: "Quantitative Modeling & Evidence Synthesis",
        max_marks: 30,
        description:
          "Defensible use of Exhibit 1 operating figures, sensitivity testing, and evidence-backed unit economics modeling.",
      },
      {
        name: "Strategic Recommendation & Feasibility",
        max_marks: 25,
        description: `Actionable resolution to the primary decision point, accounting for capital requirements and phased implementation.`,
      },
      {
        name: "Executive Communication & Argumentation",
        max_marks: 15,
        description:
          "Board-ready prose structure, clear acknowledgment of downside risks, and defensibility of recommended tradeoffs.",
      },
    ];

    return NextResponse.json({ success: true, criteria: suggestedCriteria });
  } catch (err: unknown) {
    console.error("Suggest rubric error:", err);
    return NextResponse.json(
      { error: "Failed to generate AI rubric suggestions." },
      { status: 500 }
    );
  }
}
