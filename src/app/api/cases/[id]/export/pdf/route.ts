import { NextRequest, NextResponse } from "next/server";
import { mockStore } from "@/lib/mock-db";
import { jsPDF } from "jspdf";
import * as fs from "fs";
import * as path from "path";
import { APP_NAME, COLLEGE_NAME, COLLEGE_SHORT } from "@/config/college";
import { THEME_TOKENS, hexToRgb } from "@/config/theme";
import { authenticateUser } from "@/lib/session";
import { CECasePack } from "@/lib/casepack/schema";

// In-memory cache for Devanagari font base64
let cachedDevanagariBase64: string | null = null;

function getDevanagariFont(): string | null {
  if (cachedDevanagariBase64) return cachedDevanagariBase64;
  const fontPath = path.resolve(
    process.cwd(),
    "src/assets/fonts/NotoSansDevanagari-Regular.ttf"
  );
  if (fs.existsSync(fontPath)) {
    try {
      cachedDevanagariBase64 = fs.readFileSync(fontPath).toString("base64");
      return cachedDevanagariBase64;
    } catch (err) {
      console.warn("Could not read custom font file:", err);
    }
  }
  return null;
}

export async function GET(
  req: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  try {
    const { user, errorResponse } = await authenticateUser(req);
    if (errorResponse || !user) {
      return errorResponse || NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { id: caseId } = await context.params;
    const caseStudy = mockStore.getCase(caseId);

    if (!caseStudy) {
      return NextResponse.json({ error: "Case study not found." }, { status: 404 });
    }

    // Students can only export approved cases
    if (user.role === "student" && caseStudy.status !== "approved") {
      return NextResponse.json(
        { error: "Forbidden. Students may only export approved curriculum cases." },
        { status: 403 }
      );
    }

    // Determine export mode: "full" (faculty/admin) vs "student" (handout)
    const { searchParams } = new URL(req.url);
    const requestedMode = searchParams.get("mode") || "full";
    const mode = user.role === "student" ? "student" : requestedMode;
    const isStudentHandout = mode === "student";

    const content = caseStudy.content as any;
    const isCEPack =
      caseStudy.type === "ce_pack" || (content && "case" in content && "questions" in content);

    const doc = new jsPDF({
      orientation: "portrait",
      unit: "mm",
      format: "a4",
    });

    // Check and load Unicode font from in-memory cache
    let hasUnicodeFont = false;
    const fontBase64 = getDevanagariFont();
    if (fontBase64) {
      try {
        doc.addFileToVFS("NotoDevanagari.ttf", fontBase64);
        doc.addFont("NotoDevanagari.ttf", "NotoDevanagari", "normal");
        doc.setFont("NotoDevanagari");
        hasUnicodeFont = true;
      } catch (err) {
        console.warn("Could not register custom font:", err);
      }
    }

    const pageWidth = doc.internal.pageSize.getWidth();
    const margin = 16;
    const contentWidth = pageWidth - margin * 2;
    let y = 18;

    // Palette tokens
    const primaryRgb = hexToRgb(THEME_TOKENS.light.primary);
    const primarySoftRgb = hexToRgb(THEME_TOKENS.light.primarySoft);
    const accentRgb = hexToRgb(THEME_TOKENS.light.accent);
    const accentTextRgb = hexToRgb(THEME_TOKENS.light.accentText);
    const textRgb = hexToRgb(THEME_TOKENS.light.text);
    const textMutedRgb = hexToRgb(THEME_TOKENS.light.textMuted);
    const borderRgb = hexToRgb(THEME_TOKENS.light.border);
    const bgRgb = hexToRgb(THEME_TOKENS.light.background);
    const warningRgb = hexToRgb(THEME_TOKENS.light.warning);

    // Helper for pagination
    const checkPageBreak = (neededSpace: number) => {
      if (y + neededSpace > doc.internal.pageSize.getHeight() - 18) {
        doc.addPage();
        y = 18;
      }
    };

    // =========================================================================
    // BRANCH A: CE CASE PACK PDF EXPORT
    // =========================================================================
    if (isCEPack) {
      const pack = content as CECasePack;
      const meta = pack.meta || ({} as any);

      // 1. Institutional Exam Header
      doc.setFillColor(...primaryRgb);
      doc.roundedRect(margin, y, 14, 14, 2, 2, "F");
      doc.setTextColor(...accentTextRgb);
      doc.setFontSize(8);
      doc.text(COLLEGE_SHORT, margin + 2.5, y + 9);

      doc.setTextColor(...primaryRgb);
      doc.setFontSize(12);
      doc.text(COLLEGE_NAME.toUpperCase(), margin + 18, y + 6);
      doc.setFontSize(8);
      doc.setTextColor(...textMutedRgb);
      doc.text(
        `DEPARTMENT OF ${(meta.department || "Business Studies").toUpperCase()} • CONTINUOUS EVALUATION ${meta.ce_no || "CE-3"}`,
        margin + 18,
        y + 11
      );

      y += 18;
      doc.setDrawColor(...accentRgb);
      doc.setLineWidth(0.8);
      doc.line(margin, y, margin + contentWidth, y);
      y += 6;

      // 2. Metadata Specification Strip
      doc.setFillColor(...primarySoftRgb);
      doc.roundedRect(margin, y, contentWidth, 10, 2, 2, "F");
      doc.setFontSize(7.5);
      doc.setTextColor(...textRgb);
      const metaLine = `Course: ${meta.course_code || "FIN-501"}   |   Set: ${meta.set || "A"}   |   Max Marks: ${meta.max_marks || 40}   |   Level: ${meta.level || "MBA / PGDM"}   |   Mode: ${isStudentHandout ? "Student Handout" : "Faculty Master Pack"}`;
      doc.text(metaLine, margin + 4, y + 6.5);
      y += 14;

      // Instructions Box
      doc.setFillColor(248, 250, 252);
      doc.setDrawColor(...borderRgb);
      doc.setLineWidth(0.3);
      doc.roundedRect(margin, y, contentWidth, 14, 1.5, 1.5, "FD");
      doc.setFontSize(7.5);
      doc.setTextColor(...textRgb);
      doc.text("INSTRUCTIONS TO CANDIDATES:", margin + 3, y + 4.5);
      doc.setTextColor(...textMutedRgb);
      doc.text(
        "1. Read the case carefully. 2. Answer all questions using case facts, figures, and established theoretical frameworks.",
        margin + 3,
        y + 8.5
      );
      doc.text(
        "3. Support arguments with step-by-step quantitative calculations and comparative tables.",
        margin + 3,
        y + 12
      );
      y += 18;

      // 3. Case Title & Narrative
      doc.setTextColor(...primaryRgb);
      doc.setFontSize(14);
      const titleLines = doc.splitTextToSize(pack.case.title, contentWidth);
      doc.text(titleLines, margin, y);
      y += titleLines.length * 6 + 4;

      pack.case.sections.forEach((sec) => {
        checkPageBreak(25);
        doc.setFontSize(11);
        doc.setTextColor(...accentRgb);
        doc.text(sec.heading, margin, y);
        y += 5.5;

        doc.setFontSize(8.5);
        doc.setTextColor(...textRgb);
        sec.paragraphs.forEach((p) => {
          checkPageBreak(15);
          const pLines = doc.splitTextToSize(p, contentWidth);
          doc.text(pLines, margin, y);
          y += pLines.length * 4.2 + 3;
        });

        if (sec.bullets && sec.bullets.length > 0) {
          sec.bullets.forEach((b) => {
            checkPageBreak(10);
            const bLines = doc.splitTextToSize(`• ${b}`, contentWidth - 4);
            doc.text(bLines, margin + 3, y);
            y += bLines.length * 4.2 + 2;
          });
        }
        y += 2;
      });

      // 4. Data Tables
      if (pack.case.data_tables && pack.case.data_tables.length > 0) {
        pack.case.data_tables.forEach((table) => {
          checkPageBreak(40);
          doc.setFontSize(10);
          doc.setTextColor(...primaryRgb);
          doc.text(table.title, margin, y);
          y += 5;

          const numCols = table.columns.length;
          const colWidth = contentWidth / numCols;
          const rowH = 6;

          // Header
          doc.setFillColor(...primaryRgb);
          doc.rect(margin, y, contentWidth, rowH, "F");
          doc.setFontSize(7.5);
          doc.setTextColor(...accentTextRgb);
          table.columns.forEach((col, cIdx) => {
            doc.text(col, margin + cIdx * colWidth + 2, y + 4.2);
          });
          y += rowH;

          // Rows
          doc.setTextColor(...textRgb);
          table.rows.forEach((row, rIdx) => {
            checkPageBreak(rowH + 2);
            if (rIdx % 2 === 1) {
              doc.setFillColor(...bgRgb);
              doc.rect(margin, y, contentWidth, rowH, "F");
            }
            doc.setDrawColor(...borderRgb);
            doc.setLineWidth(0.2);
            doc.rect(margin, y, contentWidth, rowH, "S");

            row.forEach((cell, cIdx) => {
              const str = String(cell);
              const truncated = str.length > 35 ? str.slice(0, 32) + "..." : str;
              doc.text(truncated, margin + cIdx * colWidth + 2, y + 4.2);
            });
            y += rowH;
          });
          y += 6;
        });
      }

      // 5. Questions Section
      checkPageBreak(35);
      doc.setFontSize(12);
      doc.setTextColor(...primaryRgb);
      doc.text(`EXAMINATION QUESTIONS [Total: ${meta.max_marks || 40} Marks]`, margin, y);
      y += 6;

      pack.questions.forEach((q, idx) => {
        checkPageBreak(25);
        doc.setFontSize(9);
        doc.setTextColor(...accentRgb);
        doc.text(
          `Question ${idx + 1} [${q.marks || 20} Marks] [Bloom: ${q.bloom_verb}]:`,
          margin,
          y
        );
        y += 4.5;

        doc.setFontSize(8.5);
        doc.setTextColor(...textRgb);
        const qLines = doc.splitTextToSize(q.text, contentWidth);
        doc.text(qLines, margin, y);
        y += qLines.length * 4.2 + 3;

        if (q.concepts && q.concepts.length > 0) {
          doc.setFontSize(7.5);
          doc.setTextColor(...textMutedRgb);
          doc.text(`Tested Concepts: ${q.concepts.join(", ")}`, margin, y);
          y += 5;
        }
      });

      // 6. Faculty Model Answers (Excluded for student handout)
      if (!isStudentHandout && pack.answers && pack.answers.length > 0) {
        doc.addPage();
        y = 18;

        // Confidential Warning Banner
        doc.setFillColor(254, 242, 242);
        doc.setDrawColor(239, 68, 68);
        doc.setLineWidth(0.5);
        doc.roundedRect(margin, y, contentWidth, 12, 1.5, 1.5, "FD");
        doc.setFontSize(9);
        doc.setTextColor(185, 28, 28);
        doc.text("FACULTY CONFIDENTIAL — FOR EVALUATION ONLY", margin + 4, y + 5);
        doc.setFontSize(7.5);
        doc.text("Model answer keys, comparative benchmarks, and scoring rubrics.", margin + 4, y + 9);
        y += 18;

        doc.setFontSize(13);
        doc.setTextColor(...primaryRgb);
        doc.text("Model Answer Key & Benchmark Solutions", margin, y);
        y += 7;

        pack.answers.forEach((ans) => {
          checkPageBreak(30);
          doc.setFontSize(10.5);
          doc.setTextColor(...accentRgb);
          doc.text(`Model Answer for Question ${ans.question_id}`, margin, y);
          y += 5;

          doc.setFontSize(8);
          doc.setTextColor(...textRgb);
          const introLines = doc.splitTextToSize(`1. Introduction: ${ans.introduction}`, contentWidth);
          doc.text(introLines, margin, y);
          y += introLines.length * 4 + 4;

          // Sections
          ans.sections.forEach((sec) => {
            checkPageBreak(20);
            doc.setFontSize(8.5);
            doc.setTextColor(...primaryRgb);
            doc.text(sec.heading, margin, y);
            y += 4;

            doc.setFontSize(8);
            doc.setTextColor(...textRgb);
            if (sec.points && sec.points.length > 0) {
              sec.points.forEach((pt) => {
                checkPageBreak(10);
                const ptLines = doc.splitTextToSize(`• ${pt}`, contentWidth - 4);
                doc.text(ptLines, margin + 3, y);
                y += ptLines.length * 4 + 1.5;
              });
            }

            if (sec.evaluation && sec.evaluation.length > 0) {
              sec.evaluation.forEach((ev) => {
                checkPageBreak(10);
                const evLines = doc.splitTextToSize(`Evaluation: ${ev}`, contentWidth - 4);
                doc.text(evLines, margin + 3, y);
                y += evLines.length * 4 + 1.5;
              });
            }

            if (sec.limitation) {
              checkPageBreak(10);
              const limLines = doc.splitTextToSize(`Limitation: ${sec.limitation}`, contentWidth - 4);
              doc.setTextColor(180, 83, 9);
              doc.text(limLines, margin + 3, y);
              doc.setTextColor(...textRgb);
              y += limLines.length * 4 + 2;
            }
          });

          // Comparison Table
          if (ans.comparison_table) {
            checkPageBreak(35);
            doc.setFontSize(8.5);
            doc.setTextColor(...primaryRgb);
            doc.text("Comparative Analysis Matrix:", margin, y);
            y += 4.5;

            const numCols = ans.comparison_table.columns.length;
            const colWidth = contentWidth / numCols;
            const rowH = 6;

            // Header
            doc.setFillColor(243, 244, 246);
            doc.rect(margin, y, contentWidth, rowH, "F");
            doc.setFontSize(7.5);
            doc.setTextColor(...primaryRgb);
            ans.comparison_table.columns.forEach((col, cIdx) => {
              doc.text(col, margin + cIdx * colWidth + 2, y + 4.2);
            });
            y += rowH;

            // Rows
            doc.setTextColor(...textRgb);
            ans.comparison_table.rows.forEach((row, rIdx) => {
              checkPageBreak(rowH + 2);
              if (rIdx % 2 === 1) {
                doc.setFillColor(249, 250, 251);
                doc.rect(margin, y, contentWidth, rowH, "F");
              }
              doc.setDrawColor(...borderRgb);
              doc.setLineWidth(0.2);
              doc.rect(margin, y, contentWidth, rowH, "S");

              row.forEach((cell, cIdx) => {
                const str = String(cell);
                const truncated = str.length > 35 ? str.slice(0, 32) + "..." : str;
                doc.text(truncated, margin + cIdx * colWidth + 2, y + 4.2);
              });
              y += rowH;
            });
            y += 5;
          }

          if (ans.overall_assessment) {
            checkPageBreak(15);
            doc.setFontSize(8);
            doc.setTextColor(...textRgb);
            const oaLines = doc.splitTextToSize(`Overall Assessment: ${ans.overall_assessment}`, contentWidth);
            doc.text(oaLines, margin, y);
            y += oaLines.length * 4 + 3;
          }

          checkPageBreak(15);
          doc.setFontSize(8);
          doc.setTextColor(...textRgb);
          const concLines = doc.splitTextToSize(`Conclusion: ${ans.conclusion}`, contentWidth);
          doc.text(concLines, margin, y);
          y += concLines.length * 4 + 6;
        });
      }

      const pdfOutput = doc.output("arraybuffer");
      const safeTitle = (pack.case.title || "CE_Case_Pack")
        .replace(/[^a-zA-Z0-9]/g, "_")
        .slice(0, 40);
      const filename = `${safeTitle}_${isStudentHandout ? "Student_Handout" : "Full_Pack"}.pdf`;

      return new NextResponse(pdfOutput, {
        headers: {
          "Content-Type": "application/pdf",
          "Content-Disposition": `attachment; filename="${filename}"`,
        },
      });
    }

    // =========================================================================
    // BRANCH B: STANDARD CASE PDF EXPORT (Existing Classic Flow)
    // =========================================================================
    // 1. Institutional Header
    doc.setFillColor(...primaryRgb);
    doc.roundedRect(margin, y, 14, 14, 2, 2, "F");
    doc.setTextColor(...accentTextRgb);
    doc.setFontSize(8);
    doc.text(COLLEGE_SHORT, margin + 2.5, y + 9);

    doc.setTextColor(...primaryRgb);
    doc.setFontSize(12);
    doc.text(COLLEGE_NAME.toUpperCase(), margin + 18, y + 6);
    doc.setFontSize(8);
    doc.setTextColor(...textMutedRgb);
    doc.text(`${APP_NAME} • AI Business Curriculum Repository`, margin + 18, y + 11);

    y += 18;
    doc.setDrawColor(...accentRgb);
    doc.setLineWidth(0.8);
    doc.line(margin, y, margin + contentWidth, y);
    y += 8;

    // 2. Case Title
    doc.setTextColor(...primaryRgb);
    doc.setFontSize(16);
    const titleLines = doc.splitTextToSize(caseStudy.title, contentWidth);
    doc.text(titleLines, margin, y);
    y += titleLines.length * 7 + 4;

    // 3. Metadata Strip
    doc.setFillColor(...primarySoftRgb);
    doc.roundedRect(margin, y, contentWidth, 12, 2, 2, "F");
    doc.setFontSize(8);
    doc.setTextColor(...textRgb);
    const metaText = `Type: ${caseStudy.type.toUpperCase()} CASE   |   Format: ${caseStudy.format.toUpperCase()}   |   Industry: ${caseStudy.industry}   |   Level: ${caseStudy.level}   |   Language: ${caseStudy.language.toUpperCase()}`;
    doc.text(metaText, margin + 4, y + 7.5);
    y += 18;

    // 4. Executive Summary
    checkPageBreak(30);
    doc.setFontSize(12);
    doc.setTextColor(...primaryRgb);
    doc.text("Executive Summary", margin, y);
    y += 6;

    doc.setFontSize(9.5);
    doc.setTextColor(...textRgb);
    const summaryLines = doc.splitTextToSize(content.summary, contentWidth);
    doc.text(summaryLines, margin, y);
    y += summaryLines.length * 5 + 8;

    // 5. Background & Context
    checkPageBreak(35);
    doc.setFontSize(12);
    doc.setTextColor(...primaryRgb);
    doc.text("Background & Institutional Context", margin, y);
    y += 6;

    doc.setFontSize(9.5);
    doc.setTextColor(...textRgb);
    const bgLines = doc.splitTextToSize(content.background, contentWidth);
    doc.text(bgLines, margin, y);
    y += bgLines.length * 5 + 8;

    // 6. Operational Challenge
    checkPageBreak(35);
    doc.setFontSize(12);
    doc.setTextColor(...primaryRgb);
    doc.text("The Operational & Market Challenge", margin, y);
    y += 6;

    doc.setFontSize(9.5);
    doc.setTextColor(...textRgb);
    const challengeLines = doc.splitTextToSize(content.challenge, contentWidth);
    doc.text(challengeLines, margin, y);
    y += challengeLines.length * 5 + 8;

    // 7. Decision Point
    checkPageBreak(25);
    doc.setFontSize(12);
    doc.setTextColor(...primaryRgb);
    doc.text("The Strategic Decision Point", margin, y);
    y += 6;

    doc.setFontSize(10);
    doc.setTextColor(...textRgb);
    const decisionLines = doc.splitTextToSize(content.decision_point, contentWidth);
    doc.text(decisionLines, margin, y);
    y += decisionLines.length * 5.5 + 8;

    // 8. Discussion Questions
    checkPageBreak(40);
    doc.setFontSize(12);
    doc.setTextColor(...primaryRgb);
    doc.text("Classroom Discussion Questions", margin, y);
    y += 6;

    doc.setFontSize(9);
    doc.setTextColor(...textRgb);
    (content.discussion_questions || []).forEach((q: string, idx: number) => {
      checkPageBreak(12);
      const qText = `${idx + 1}. ${q}`;
      const qLines = doc.splitTextToSize(qText, contentWidth - 4);
      doc.text(qLines, margin + 2, y);
      y += qLines.length * 4.5 + 2.5;
    });

    const pdfOutput = doc.output("arraybuffer");
    const safeTitle = caseStudy.title.replace(/[^a-zA-Z0-9]/g, "_").slice(0, 40);

    return new NextResponse(pdfOutput, {
      headers: {
        "Content-Type": "application/pdf",
        "Content-Disposition": `attachment; filename="${safeTitle}.pdf"`,
      },
    });
  } catch (err: unknown) {
    console.error("PDF generation failed:", err);
    return NextResponse.json({ error: "Failed to generate PDF document." }, { status: 500 });
  }
}
