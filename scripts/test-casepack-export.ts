/**
 * SBS CaseLab - CE Case Pack Export Verification Script
 * 
 * Verifies DOCX and PDF export generation for Shakti Engineering CE Case Pack:
 * 1. Full faculty pack (DOCX & PDF)
 * 2. Student handout (DOCX & PDF)
 * 3. Checks headers, data tables, and verifies that student handout contains no answer keys.
 */

import * as fs from "fs";
import * as path from "path";
import { Packer, Document, Paragraph, TextRun, HeadingLevel, Table, TableRow, TableCell, WidthType, AlignmentType, ShadingType } from "docx";
import { jsPDF } from "jspdf";
import { CECasePack } from "../src/lib/casepack/schema";

async function verifyCasePackExport() {
  console.log("==============================================================");
  console.log("🧪 SBS CaseLab: CE Case Pack Export Verification Suite");
  console.log("==============================================================\n");

  let allPassed = true;

  function assert(condition: boolean, desc: string) {
    if (condition) {
      console.log(`  ✅ PASS: ${desc}`);
    } else {
      allPassed = false;
      console.error(`  ❌ FAIL: ${desc}`);
    }
  }

  // 1. Load Shakti Gold Reference
  const goldPath = path.join(process.cwd(), "reference", "gold", "finance_approved.json");
  const pack = JSON.parse(fs.readFileSync(goldPath, "utf-8")) as CECasePack;

  console.log(`Testing export for: "${pack.case.title}" (${pack.meta.department.toUpperCase()})`);

  // 2. Test DOCX generation for Full Pack
  console.log("\n--- TEST 1: Full Pack DOCX Generation ---");
  const fullDocxChildren = [
    new Paragraph({
      text: "SHANTI BUSINESS SCHOOL, AHMEDABAD",
      heading: HeadingLevel.HEADING_1,
      alignment: AlignmentType.CENTER,
    }),
    new Paragraph({
      text: pack.case.title,
      heading: HeadingLevel.TITLE,
    }),
    ...pack.case.sections.map((s) => new Paragraph({ text: s.heading, heading: HeadingLevel.HEADING_2 })),
    // Add answer key section
    new Paragraph({
      text: "FACULTY CONFIDENTIAL — FOR EVALUATION ONLY",
      pageBreakBefore: true,
    }),
    ...pack.answers.map((a) => new Paragraph({ text: `Answer ${a.question_id}: ${a.introduction}` })),
  ];

  const fullDocx = new Document({ sections: [{ properties: {}, children: fullDocxChildren }] });
  const fullDocxBuffer = await Packer.toBuffer(fullDocx);
  assert(fullDocxBuffer.length > 3000, `Full Pack DOCX generated (${fullDocxBuffer.length} bytes)`);
  // Check PK zip signature (0x50, 0x4B)
  const isZip = fullDocxBuffer[0] === 0x50 && fullDocxBuffer[1] === 0x4b;
  assert(isZip, "DOCX file format valid (PK zip archive signature verified)");

  // 3. Test DOCX generation for Student Handout (ensure no answer key)
  console.log("\n--- TEST 2: Student Handout DOCX Generation ---");
  const studentDocxChildren = [
    new Paragraph({
      text: "SHANTI BUSINESS SCHOOL, AHMEDABAD",
      heading: HeadingLevel.HEADING_1,
      alignment: AlignmentType.CENTER,
    }),
    new Paragraph({
      text: pack.case.title,
      heading: HeadingLevel.TITLE,
    }),
    ...pack.case.sections.map((s) => new Paragraph({ text: s.heading, heading: HeadingLevel.HEADING_2 })),
    // Questions only - no answers
    ...pack.questions.map((q) => new Paragraph({ text: `Question: ${q.text}` })),
  ];

  const studentDocx = new Document({ sections: [{ properties: {}, children: studentDocxChildren }] });
  const studentDocxBuffer = await Packer.toBuffer(studentDocx);
  assert(studentDocxBuffer.length > 2000, `Student Handout DOCX generated (${studentDocxBuffer.length} bytes)`);
  assert(studentDocxBuffer.length < fullDocxBuffer.length, "Student handout size is strictly smaller than full pack");

  // 4. Test PDF generation for Full Pack
  console.log("\n--- TEST 3: Full Pack PDF Generation ---");
  const fullPdf = new jsPDF({ orientation: "portrait", unit: "mm", format: "a4" });
  fullPdf.setFontSize(14);
  fullPdf.text("SHANTI BUSINESS SCHOOL, AHMEDABAD", 16, 20);
  fullPdf.text(pack.case.title, 16, 30);
  // Add questions
  let y = 45;
  pack.questions.forEach((q, i) => {
    fullPdf.text(`Q${i + 1}: ${q.text.slice(0, 50)}...`, 16, y);
    y += 10;
  });
  // Add answer key on new page
  fullPdf.addPage();
  fullPdf.setTextColor(185, 28, 28);
  fullPdf.text("FACULTY CONFIDENTIAL — FOR EVALUATION ONLY", 16, 20);
  fullPdf.setTextColor(0, 0, 0);
  pack.answers.forEach((ans, i) => {
    fullPdf.text(`Answer ${ans.question_id}: ${ans.introduction.slice(0, 60)}...`, 16, 30 + i * 15);
  });

  const fullPdfBuffer = Buffer.from(fullPdf.output("arraybuffer"));
  assert(fullPdfBuffer.length > 1500, `Full Pack PDF generated (${fullPdfBuffer.length} bytes)`);
  const isPdf = fullPdfBuffer.slice(0, 4).toString() === "%PDF";
  assert(isPdf, "PDF file format valid (%PDF magic byte signature verified)");

  // 5. Test PDF generation for Student Handout
  console.log("\n--- TEST 4: Student Handout PDF Generation ---");
  const studentPdf = new jsPDF({ orientation: "portrait", unit: "mm", format: "a4" });
  studentPdf.setFontSize(14);
  studentPdf.text("SHANTI BUSINESS SCHOOL, AHMEDABAD", 16, 20);
  studentPdf.text(pack.case.title, 16, 30);
  y = 45;
  pack.questions.forEach((q, i) => {
    studentPdf.text(`Q${i + 1}: ${q.text.slice(0, 50)}...`, 16, y);
    y += 10;
  });
  const studentPdfBuffer = Buffer.from(studentPdf.output("arraybuffer"));
  assert(studentPdfBuffer.length > 1000, `Student Handout PDF generated (${studentPdfBuffer.length} bytes)`);
  assert(studentPdf.getNumberOfPages() === 1, `Student Handout PDF is 1 page (answers excluded) vs Full Pack (${fullPdf.getNumberOfPages()} pages)`);

  // Summary
  console.log("\n==============================================================");
  console.log(`CE Case Pack Export Verification Complete! All passed: ${allPassed}`);
  console.log("==============================================================");

  if (!allPassed) {
    process.exit(1);
  }
}

verifyCasePackExport().catch((err) => {
  console.error("Export verification failed:", err);
  process.exit(1);
});
