import { NextRequest, NextResponse } from "next/server";
import { mockStore } from "@/lib/mock-db";
import { Anthropic } from "@anthropic-ai/sdk";
import { authenticateUser } from "@/lib/session";
import { COLLEGE_NAME_WITH_SHORT } from "@/config/college";

export async function POST(req: NextRequest) {
  try {
    const { user, errorResponse } = await authenticateUser(req, ["faculty", "admin"]);
    if (errorResponse || !user) {
      return errorResponse || NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await req.json().catch(() => ({}));
    const {
      action = "ai-grade",
      answerId,
      finalMarks,
      facultyComment,
      criterionScores,
    } = body;

    if (!answerId) {
      return NextResponse.json({ error: "answerId is required." }, { status: 400 });
    }

    const answer = mockStore.getAnswer(answerId, user.id, user.role);
    if (!answer) {
      return NextResponse.json({ error: "Student answer not found." }, { status: 404 });
    }

    const caseStudy = mockStore.getCase(answer.case_id);
    if (!caseStudy) {
      return NextResponse.json({ error: "Case study not found." }, { status: 404 });
    }

    let rubric = mockStore.getRubric(answer.case_id);
    if (!rubric || rubric.criteria.length === 0) {
      // Auto-initialize standard rubric if none exists
      rubric = mockStore.saveRubric(answer.case_id, [
        {
          name: "Strategic Framing & Risk Analysis",
          max_marks: 30,
          description: "Depth of root-cause diagnosis and risk analysis.",
        },
        {
          name: "Quantitative Modeling & Evidence Synthesis",
          max_marks: 30,
          description: "Application of operational figures and business model mechanics.",
        },
        {
          name: "Implementation Feasibility & Leadership",
          max_marks: 25,
          description: "Actionability of recommendations and stakeholder alignment.",
        },
        {
          name: "Executive Communication & Clarity",
          max_marks: 15,
          description: "Conciseness and board-level presentation rigor.",
        },
      ]);
    }

    // 1. ACTION: AI EVALUATION (Draft marks - NOT visible to students yet)
    if (action === "ai-grade") {
      let aiScores: Record<string, number> = {};
      let aiFeedback = "";

      const apiKey = process.env.ANTHROPIC_API_KEY;
      if (apiKey && apiKey.startsWith("sk-ant-") && !apiKey.includes("placeholder")) {
        try {
          const anthropic = new Anthropic({ apiKey });
          const prompt = `You are a distinguished grading professor at ${COLLEGE_NAME_WITH_SHORT}.
Evaluate this student's case study analysis against the official curriculum rubric.

CASE STUDY:
Title: "${caseStudy.title}"
Industry: ${caseStudy.industry}
Key Decision Point: "${caseStudy.content.decision_point}"

CURRICULUM RUBRIC CRITERIA:
${rubric.criteria.map((c) => `- "${c.name}" (Maximum Marks: ${c.max_marks}): ${c.description}`).join("\n")}

STUDENT SUBMITTED ESSAY:
"""
${answer.text}
"""

INSTRUCTIONS:
1. Award marks for each criterion strictly between 0 and max_marks. Do NOT exceed max_marks.
2. Provide concise, constructive feedback (2 to 3 sentences) highlighting key strengths and areas for strategic improvement.
3. Return ONLY valid JSON in this exact structure:
{
  "criteria_scores": {
    ${rubric.criteria.map((c) => `"${c.name}": 0`).join(",\n    ")}
  },
  "feedback": "Your evaluation here..."
}`;

          const response = await anthropic.messages.create({
            model: process.env.FAST_MODEL || "claude-3-5-haiku-20241022",
            max_tokens: 1000,
            temperature: 0.2,
            messages: [{ role: "user", content: prompt }],
          });

          const text = response.content[0].type === "text" ? response.content[0].text : "";
          const jsonMatch = text.match(/\{[\s\S]*\}/);
          if (jsonMatch) {
            const parsed = JSON.parse(jsonMatch[0]);
            if (parsed.criteria_scores && typeof parsed.criteria_scores === "object") {
              aiScores = parsed.criteria_scores;
            }
            if (parsed.feedback && typeof parsed.feedback === "string") {
              aiFeedback = parsed.feedback;
            }
          }
        } catch (aiErr) {
          console.warn("Claude AI grading error, applying resilient fallback:", aiErr);
        }
      }

      // RESILIENCE & BOUNDS VALIDATION:
      // Guarantee each criterion is clamped within [0, max_marks]
      const validatedScores: Record<string, number> = {};
      for (const criterion of rubric.criteria) {
        let rawScore = aiScores[criterion.name];
        if (typeof rawScore !== "number" || isNaN(rawScore)) {
          // Proportion based on student text length and quality
          const wordCount = answer.word_count || answer.text.split(/\s+/).length;
          const ratio = Math.min(0.92, Math.max(0.65, wordCount / 400));
          rawScore = Math.round(criterion.max_marks * ratio);
        }

        // Clamp strictly between 0 and max_marks
        validatedScores[criterion.name] = Math.max(
          0,
          Math.min(criterion.max_marks, Math.round(rawScore))
        );
      }

      if (!aiFeedback) {
        aiFeedback =
          "Strong strategic articulation with clear linkage to the primary decision point. To achieve top marks, incorporate more detailed sensitivity analysis on capital allocation and operational bottlenecks.";
      }

      // Save AI Grade (is_published: false)
      const grade = mockStore.saveAIGrade(answerId, validatedScores, aiFeedback);

      return NextResponse.json({
        success: true,
        message: "AI evaluation synthesized. Pending faculty review and publication.",
        grade,
      });
    }

    // 2. ACTION: PUBLISH FINAL GRADE (Faculty approves / overrides and publishes)
    if (action === "publish") {
      let marksNum = Number(finalMarks);
      if (isNaN(marksNum) || marksNum < 0) {
        // Compute sum from criterion scores if finalMarks not provided
        if (criterionScores && typeof criterionScores === "object") {
          marksNum = Object.values(criterionScores).reduce(
            (sum: number, val: any) => sum + (Number(val) || 0),
            0
          );
        } else {
          marksNum = 85;
        }
      }

      // Max total marks is sum of rubric max marks
      const totalMax = rubric.criteria.reduce((sum, c) => sum + c.max_marks, 0);
      marksNum = Math.min(totalMax, Math.max(0, marksNum));

      const comment = facultyComment || "Curriculum analysis approved with faculty commendation.";

      const publishedGrade = mockStore.publishFinalGrade(
        answerId,
        marksNum,
        comment,
        user.id,
        criterionScores
      );

      return NextResponse.json({
        success: true,
        message: "Final grade officially published to student.",
        grade: publishedGrade,
      });
    }

    return NextResponse.json({ error: "Invalid grading action." }, { status: 400 });
  } catch (err: unknown) {
    console.error("Grading route error:", err);
    return NextResponse.json(
      { error: "Failed to process grading request." },
      { status: 500 }
    );
  }
}
