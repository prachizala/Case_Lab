import { NextRequest, NextResponse } from "next/server";
import { mockStore } from "@/lib/mock-db";
import { jsPDF } from "jspdf";
import * as fs from "fs";
import * as path from "path";
import { APP_NAME, COLLEGE_NAME, COLLEGE_SHORT } from "@/config/college";
import { THEME_TOKENS, hexToRgb } from "@/config/theme";
import { authenticateUser } from "@/lib/session";

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

    const content = caseStudy.content;
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

    // Palette tokens for print-friendly rendering
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

    // 1. INSTITUTIONAL HEADER & LOGO PLACEHOLDER
    // Logo Placeholder Badge
    doc.setFillColor(...primaryRgb);
    doc.roundedRect(margin, y, 14, 14, 2, 2, "F");
    doc.setTextColor(...accentTextRgb);
    doc.setFontSize(8);
    doc.text(COLLEGE_SHORT, margin + 2.5, y + 9);

    // College Name & System Subtitle
    doc.setTextColor(...primaryRgb);
    doc.setFontSize(12);
    doc.text(COLLEGE_NAME.toUpperCase(), margin + 18, y + 6);
    doc.setFontSize(8);
    doc.setTextColor(...textMutedRgb);
    doc.text(`${APP_NAME} • AI Business Curriculum Repository`, margin + 18, y + 11);

    // Decorative Trim Line
    y += 18;
    doc.setDrawColor(...accentRgb);
    doc.setLineWidth(0.8);
    doc.line(margin, y, margin + contentWidth, y);
    y += 8;

    // 2. CASE TITLE
    doc.setTextColor(...primaryRgb);
    doc.setFontSize(16);
    const titleLines = doc.splitTextToSize(caseStudy.title, contentWidth);
    doc.text(titleLines, margin, y);
    y += titleLines.length * 7 + 4;

    // 3. METADATA SPECIFICATIONS STRIP
    doc.setFillColor(...primarySoftRgb);
    doc.roundedRect(margin, y, contentWidth, 12, 2, 2, "F");
    doc.setFontSize(8);
    doc.setTextColor(...textRgb);

    const metaText = `Type: ${caseStudy.type.toUpperCase()} CASE   |   Format: ${caseStudy.format.toUpperCase()}   |   Industry: ${caseStudy.industry}   |   Level: ${caseStudy.level}   |   Language: ${caseStudy.language.toUpperCase()}`;
    doc.text(metaText, margin + 4, y + 7.5);
    y += 18;

    // Real Signal Protocol Alert if applicable
    if (caseStudy.format === "real_signal" || content.verify_facts_flag) {
      doc.setFillColor(...primarySoftRgb);
      doc.setDrawColor(...warningRgb);
      doc.setLineWidth(0.5);
      doc.roundedRect(margin, y, contentWidth, 12, 2, 2, "FD");
      doc.setFontSize(8);
      doc.setTextColor(...warningRgb);
      doc.text(
        "VERIFY FACTS BEFORE CLASS: This teaching case incorporates observable live signals. Cross-verify filings.",
        margin + 4,
        y + 7.5
      );
      y += 16;
    }

    // 4. EXECUTIVE SUMMARY
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

    // 5. BACKGROUND & CONTEXT
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

    // 6. OPERATIONAL CHALLENGE
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

    // 7. EXHIBIT 1: KEY DATA TABLE
    checkPageBreak(50);
    doc.setFontSize(11);
    doc.setTextColor(...primaryRgb);
    doc.text("Exhibit 1: Quantitative Indicators & Operating Metrics", margin, y);
    y += 6;

    // Table Header
    const colWidths = [60, 40, 35, contentWidth - 135];
    const rowHeight = 7.5;

    doc.setFillColor(...primaryRgb);
    doc.rect(margin, y, contentWidth, rowHeight, "F");
    doc.setFontSize(8.5);
    doc.setTextColor(...accentTextRgb);

    let x = margin + 2;
    doc.text("Financial / Operating Metric", x, y + 5);
    x += colWidths[0];
    doc.text("Value", x, y + 5);
    x += colWidths[1];
    doc.text("Period", x, y + 5);
    x += colWidths[2];
    doc.text("Pedagogical Notes", x, y + 5);
    y += rowHeight;

    // Table Body
    doc.setTextColor(...textRgb);
    content.key_data.forEach((row, idx) => {
      checkPageBreak(rowHeight + 2);
      if (idx % 2 === 1) {
        doc.setFillColor(...bgRgb);
        doc.rect(margin, y, contentWidth, rowHeight, "F");
      }
      doc.setDrawColor(...borderRgb);
      doc.setLineWidth(0.2);
      doc.rect(margin, y, contentWidth, rowHeight, "S");

      let cellX = margin + 2;
      doc.text(doc.splitTextToSize(row.metric, colWidths[0] - 4)[0] || "", cellX, y + 5);
      cellX += colWidths[0];
      doc.text(row.value, cellX, y + 5);
      cellX += colWidths[1];
      doc.text(row.period || "—", cellX, y + 5);
      cellX += colWidths[2];
      doc.text(row.notes || "illustrative", cellX, y + 5);

      y += rowHeight;
    });

    doc.setFontSize(7.5);
    doc.setTextColor(...textMutedRgb);
    doc.text(
      content.figures_disclaimer || "All figures are illustrative pedagogical models for classroom analysis.",
      margin,
      y + 5
    );
    y += 12;

    // 8. DECISION POINT
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

    // 9. DISCUSSION QUESTIONS
    checkPageBreak(40);
    doc.setFontSize(12);
    doc.setTextColor(...primaryRgb);
    doc.text("Classroom Discussion Questions", margin, y);
    y += 6;

    doc.setFontSize(9);
    doc.setTextColor(...textRgb);
    content.discussion_questions.forEach((q, idx) => {
      checkPageBreak(12);
      const qText = `${idx + 1}. ${q}`;
      const qLines = doc.splitTextToSize(qText, contentWidth - 4);
      doc.text(qLines, margin + 2, y);
      y += qLines.length * 4.5 + 2.5;
    });

    // 10. FACILITATOR TEACHING NOTE
    if (content.teaching_note?.frameworks && content.teaching_note.frameworks.length > 0) {
      checkPageBreak(45);
      y += 4;
      doc.setFontSize(12);
      doc.setTextColor(10, 17, 40);
      doc.text("Facilitator Teaching Note (Confidential)", margin, y);
      y += 6;

      doc.setFontSize(9);
      doc.setTextColor(60, 60, 60);
      content.teaching_note.frameworks.forEach((fw) => {
        checkPageBreak(12);
        const fwText = `• ${fw.name}: ${fw.application} (Takeaway: ${fw.key_takeaway})`;
        const fwLines = doc.splitTextToSize(fwText, contentWidth - 4);
        doc.text(fwLines, margin + 2, y);
        y += fwLines.length * 4.5 + 2;
      });
    }

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
