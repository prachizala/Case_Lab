import { NextRequest, NextResponse } from "next/server";
import { mockStore } from "@/lib/mock-db";
import { jsPDF } from "jspdf";
import { APP_NAME, COLLEGE_NAME, COLLEGE_SHORT, COLLEGE_NAME_WITH_SHORT } from "@/config/college";
import { THEME_TOKENS, hexToRgb } from "@/config/theme";
import { authenticateUser } from "@/lib/session";

export async function GET(
  req: NextRequest,
  context: { params: Promise<{ studentId: string; caseId: string }> }
) {
  try {
    const { studentId, caseId } = await context.params;

    const student = mockStore.getProfile(studentId);
    if (!student) {
      return NextResponse.json({ error: "Student not found." }, { status: 404 });
    }

    // Auth check: logged in user matches student, faculty/admin, OR student has public portfolio enabled
    const { user } = await authenticateUser(req);
    const isOwnerOrStaff = user && (user.id === studentId || user.role === "faculty" || user.role === "admin");
    const isPublicAllowed = Boolean(student.portfolio_public);

    if (!isOwnerOrStaff && !isPublicAllowed) {
      return NextResponse.json(
        { error: "Unauthorized. Certificate is private." },
        { status: 403 }
      );
    }

    const caseStudy = mockStore.getCase(caseId);
    if (!caseStudy) {
      return NextResponse.json({ error: "Case study not found." }, { status: 404 });
    }

    const answer = mockStore.getAnswerByStudentAndCase(studentId, caseId);
    if (!answer || answer.status !== "submitted") {
      return NextResponse.json(
        { error: "No completed case analysis found for this student." },
        { status: 400 }
      );
    }

    const grade = mockStore.getGradeForAnswer(answer.id, studentId, student.role);
    const finalScore = grade?.final_marks || 88;
    const completionDate = answer.submitted_at
      ? new Date(answer.submitted_at).toLocaleDateString("en-US", {
          year: "numeric",
          month: "long",
          day: "numeric",
        })
      : new Date().toLocaleDateString("en-US", {
          year: "numeric",
          month: "long",
          day: "numeric",
        });

    // Create Landscape Certificate
    const doc = new jsPDF({
      orientation: "landscape",
      unit: "mm",
      format: "a4",
    });

    const pageWidth = doc.internal.pageSize.getWidth(); // 297mm
    const pageHeight = doc.internal.pageSize.getHeight(); // 210mm

    // Design system tokens for print-friendly certificate rendering
    const primaryRgb = hexToRgb(THEME_TOKENS.light.primary);
    const accentRgb = hexToRgb(THEME_TOKENS.light.accent);
    const accentTextRgb = hexToRgb(THEME_TOKENS.light.accentText);
    const primarySoftRgb = hexToRgb(THEME_TOKENS.light.primarySoft);
    const textRgb = hexToRgb(THEME_TOKENS.light.text);
    const textMutedRgb = hexToRgb(THEME_TOKENS.light.textMuted);
    const borderRgb = hexToRgb(THEME_TOKENS.light.border);

    // 1. Double Border (Primary Outer + Accent Inner)
    doc.setDrawColor(...primaryRgb);
    doc.setLineWidth(3);
    doc.rect(12, 12, pageWidth - 24, pageHeight - 24);

    doc.setDrawColor(...accentRgb);
    doc.setLineWidth(1.2);
    doc.rect(16, 16, pageWidth - 32, pageHeight - 32);

    // Decorative corner accents
    doc.setFillColor(...accentRgb);
    doc.circle(20, 20, 2, "F");
    doc.circle(pageWidth - 20, 20, 2, "F");
    doc.circle(20, pageHeight - 20, 2, "F");
    doc.circle(pageWidth - 20, pageHeight - 20, 2, "F");

    // 2. Institutional Crest Badge Placeholder
    doc.setFillColor(...primaryRgb);
    doc.roundedRect(pageWidth / 2 - 16, 22, 32, 12, 2, 2, "F");
    doc.setTextColor(...accentTextRgb);
    doc.setFontSize(9);
    doc.text(COLLEGE_SHORT, pageWidth / 2, 29.5, { align: "center" });

    // 3. Header Titles
    doc.setTextColor(...primaryRgb);
    doc.setFontSize(14);
    doc.text(COLLEGE_NAME.toUpperCase(), pageWidth / 2, 42, {
      align: "center",
    });

    doc.setFontSize(9);
    doc.setTextColor(...textMutedRgb);
    doc.text(`${APP_NAME} • AI Curriculum & Boardroom Simulation Repository`, pageWidth / 2, 48, {
      align: "center",
    });

    // 4. Main Certificate Title
    doc.setTextColor(...accentRgb);
    doc.setFontSize(24);
    doc.text("CERTIFICATE OF CASE COMPLETION", pageWidth / 2, 64, {
      align: "center",
    });

    // 5. Recipient Lead-in
    doc.setFontSize(11);
    doc.setTextColor(...textMutedRgb);
    doc.text("This official credential certifies that", pageWidth / 2, 76, {
      align: "center",
    });

    // 6. Student Name
    doc.setTextColor(...primaryRgb);
    doc.setFontSize(22);
    doc.text(student.name.toUpperCase(), pageWidth / 2, 90, {
      align: "center",
    });

    // Decorative underline under student name
    doc.setDrawColor(...accentRgb);
    doc.setLineWidth(0.6);
    doc.line(pageWidth / 2 - 45, 93, pageWidth / 2 + 45, 93);

    // 7. Case Study Citation
    doc.setFontSize(10.5);
    doc.setTextColor(...textMutedRgb);
    doc.text(
      "has successfully completed the executive strategic analysis and defense for:",
      pageWidth / 2,
      103,
      { align: "center" }
    );

    doc.setTextColor(...primaryRgb);
    doc.setFontSize(15);
    const caseLines = doc.splitTextToSize(caseStudy.title, pageWidth - 80);
    doc.text(caseLines, pageWidth / 2, 114, { align: "center" });

    // 8. Performance & Evaluation Strip
    const honorsText =
      finalScore >= 90
        ? "Grade: High Honors"
        : finalScore >= 80
        ? "Grade: Faculty Commendation"
        : "Grade: Satisfactory Completion";

    doc.setFontSize(11);
    doc.setTextColor(...accentRgb);
    doc.text(
      `Analytical Score: ${finalScore} / 100   •   ${honorsText}`,
      pageWidth / 2,
      134,
      { align: "center" }
    );

    // 9. Signatures and Verification Footer
    const sigY = 162;

    // Left Signature: Curriculum Dean
    doc.setDrawColor(...borderRgb);
    doc.line(40, sigY, 105, sigY);
    doc.setFontSize(9.5);
    doc.setTextColor(...primaryRgb);
    doc.text("Dean of Academic Affairs", 72.5, sigY + 5, { align: "center" });
    doc.setFontSize(8);
    doc.setTextColor(...textMutedRgb);
    doc.text(`Dean of Academic Affairs, ${COLLEGE_NAME_WITH_SHORT}`, 72.5, sigY + 9, {
      align: "center",
    });

    // Center Seal
    doc.setDrawColor(...accentRgb);
    doc.setFillColor(...primarySoftRgb);
    doc.circle(pageWidth / 2, sigY - 2, 12, "FD");
    doc.setFontSize(7);
    doc.setTextColor(...primaryRgb);
    doc.text("VERIFIED", pageWidth / 2, sigY - 4, { align: "center" });
    doc.text("CREDENTIAL", pageWidth / 2, sigY - 1, { align: "center" });
    doc.text(`${COLLEGE_SHORT}-2026`, pageWidth / 2, sigY + 2, { align: "center" });

    // Right Signature: Course Instructor
    doc.setDrawColor(...borderRgb);
    doc.line(pageWidth - 105, sigY, pageWidth - 40, sigY);
    doc.setFontSize(9.5);
    doc.setTextColor(...primaryRgb);
    doc.text(caseStudy.author_name || "Ms. Reena Paswan", pageWidth - 72.5, sigY + 5, {
      align: "center",
    });
    doc.setFontSize(8);
    doc.setTextColor(...textMutedRgb);
    doc.text("Faculty Case Study Supervisor", pageWidth - 72.5, sigY + 9, {
      align: "center",
    });

    // 10. Date and Verification Token
    const hash = Buffer.from(`${student.id}-${caseStudy.id}-${finalScore}`).toString("hex").slice(0, 16);
    doc.setFontSize(8);
    doc.setTextColor(...textMutedRgb);
    doc.text(
      `Awarded: ${completionDate}   |   Credential Verification ID: SBS-${hash.toUpperCase()}`,
      pageWidth / 2,
      188,
      { align: "center" }
    );

    const pdfBuffer = doc.output("arraybuffer");
    const safeTitle = `${student.name.replace(/\s+/g, "_")}_${caseStudy.id}_Certificate.pdf`;

    return new NextResponse(new Uint8Array(pdfBuffer), {
      headers: {
        "Content-Type": "application/pdf",
        "Content-Disposition": `attachment; filename="${safeTitle}"`,
      },
    });
  } catch (err: unknown) {
    console.error("Certificate generation error:", err);
    return NextResponse.json(
      { error: "Failed to generate certificate PDF." },
      { status: 500 }
    );
  }
}
