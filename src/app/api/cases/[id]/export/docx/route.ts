import { NextRequest, NextResponse } from "next/server";
import { mockStore } from "@/lib/mock-db";
import { COLLEGE_NAME, COLLEGE_NAME_WITH_SHORT } from "@/config/college";
import { THEME_TOKENS } from "@/config/theme";
import { authenticateUser } from "@/lib/session";
import { canDownload } from "@/lib/access-control";
import { CECasePack } from "@/lib/casepack/schema";
import {
  Document,
  Packer,
  Paragraph,
  TextRun,
  HeadingLevel,
  Table,
  TableRow,
  TableCell,
  WidthType,
  AlignmentType,
  ShadingType,
} from "docx";

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
      return NextResponse.json({ error: "Case not found." }, { status: 404 });
    }

    // Universal download check: admin/faculty allowed; students require paid entitlement
    const downloadAuth = canDownload(user, caseStudy);
    if (!downloadAuth.allowed) {
      mockStore.logAudit(
        user.id,
        user.email,
        "download_denied",
        caseStudy.id,
        "case",
        { format: "docx", reason: downloadAuth.reason }
      );
      return NextResponse.json(
        {
          error: downloadAuth.reason || "Download will be available after purchase (coming soon).",
          error_code: "DOWNLOAD_FORBIDDEN",
        },
        { status: downloadAuth.status || 403 }
      );
    }

    // Determine export mode: "full" (faculty/admin) vs "student" (handout)
    const { searchParams } = new URL(req.url);
    const requestedMode = searchParams.get("mode") || "full";
    const mode = user.role === "student" ? "student" : requestedMode;

    const content = caseStudy.content as any;
    const isCEPack =
      caseStudy.type === "ce_pack" || (content && "case" in content && "questions" in content);

    const dateStr = new Date().toLocaleDateString("en-IN");
    const watermarkText = user.role === "student"
      ? `SBS CaseLab - Student Copy - ${user.name || "Student"} - ${dateStr}`
      : "SBS CaseLab - Faculty Review Copy";

    // =========================================================================
    // BRANCH A: CE CASE PACK DOCX EXPORT (Continuous Evaluation Exam Standard)
    // =========================================================================
    if (isCEPack) {
      const pack = content as CECasePack;
      const meta = pack.meta || ({} as any);
      const isStudentHandout = mode === "student";

      const children: (Paragraph | Table)[] = [];

      // Watermark Notice
      children.push(
        new Paragraph({
          children: [
            new TextRun({
              text: watermarkText.toUpperCase(),
              size: 16,
              color: "888888",
              italics: true,
            }),
          ],
          alignment: AlignmentType.CENTER,
          spacing: { after: 120 },
        })
      );

      // 1. Institutional Header Banner
      children.push(
        new Paragraph({
          text: COLLEGE_NAME.toUpperCase(),
          heading: HeadingLevel.HEADING_1,
          alignment: AlignmentType.CENTER,
          spacing: { after: 80 },
        }),
        new Paragraph({
          children: [
            new TextRun({
              text: `DEPARTMENT OF ${(meta.department || "Business Studies").toUpperCase()}`,
              bold: true,
              size: 22,
            }),
          ],
          alignment: AlignmentType.CENTER,
          spacing: { after: 60 },
        }),
        new Paragraph({
          children: [
            new TextRun({
              text: `CASE STUDY & DISCUSSION PACK • SET ${meta.set || "A"}`,
              bold: true,
              size: 20,
            }),
          ],
          alignment: AlignmentType.CENTER,
          spacing: { after: 180 },
        })
      );

      // Metadata Specification Table
      children.push(
        new Table({
          width: { size: 100, type: WidthType.PERCENTAGE },
          rows: [
            new TableRow({
              children: [
                new TableCell({
                  children: [
                    new Paragraph({
                      children: [
                        new TextRun({ text: "Course Code: ", bold: true }),
                        new TextRun(meta.course_code || "FIN-501"),
                      ],
                    }),
                  ],
                }),
                new TableCell({
                  children: [
                    new Paragraph({
                      children: [
                        new TextRun({ text: "Max Marks: ", bold: true }),
                        new TextRun(`${meta.max_marks || 40} Marks`),
                      ],
                    }),
                  ],
                }),
                new TableCell({
                  children: [
                    new Paragraph({
                      children: [
                        new TextRun({ text: "Target Level: ", bold: true }),
                        new TextRun(meta.level || "MBA / PGDM"),
                      ],
                    }),
                  ],
                }),
              ],
            }),
            new TableRow({
              children: [
                new TableCell({
                  children: [
                    new Paragraph({
                      children: [
                        new TextRun({ text: "Industry: ", bold: true }),
                        new TextRun(meta.industry || caseStudy.industry || "General Management"),
                      ],
                    }),
                  ],
                }),
                new TableCell({
                  children: [
                    new Paragraph({
                      children: [
                        new TextRun({ text: "Geography: ", bold: true }),
                        new TextRun(meta.geography || "India"),
                      ],
                    }),
                  ],
                }),
                new TableCell({
                  children: [
                    new Paragraph({
                      children: [
                        new TextRun({ text: "Academic Year: ", bold: true }),
                        new TextRun("2026-27"),
                      ],
                    }),
                  ],
                }),
              ],
            }),
          ],
        }),
        new Paragraph({ text: "", spacing: { after: 120 } })
      );

      // Instructions Box
      children.push(
        new Paragraph({
          children: [
            new TextRun({
              text: "INSTRUCTIONS TO CANDIDATES:",
              bold: true,
              size: 19,
            }),
          ],
          spacing: { before: 80, after: 60 },
        }),
        new Paragraph({
          children: [
            new TextRun({
              text: "1. Read the following case carefully and answer all questions based strictly on the case facts, figures, and established theoretical frameworks.",
            }),
          ],
          spacing: { after: 40 },
        }),
        new Paragraph({
          children: [
            new TextRun({
              text: "2. Support your arguments with quantitative calculations and structured analytical tables where applicable.",
            }),
          ],
          spacing: { after: 40 },
        }),
        new Paragraph({
          children: [
            new TextRun({
              text: "3. Clearly justify protagonist decisions, identify operational limitations, and state all analytical assumptions.",
            }),
          ],
          spacing: { after: 200 },
        })
      );

      // 2. Case Narrative
      children.push(
        new Paragraph({
          text: pack.case.title,
          heading: HeadingLevel.TITLE,
          spacing: { before: 120, after: 180 },
        })
      );

      pack.case.sections.forEach((sec) => {
        children.push(
          new Paragraph({
            text: sec.heading,
            heading: HeadingLevel.HEADING_2,
            spacing: { before: 180, after: 100 },
          })
        );

        sec.paragraphs.forEach((p) => {
          children.push(
            new Paragraph({
              text: p,
              spacing: { after: 120 },
            })
          );
        });

        if (sec.bullets && sec.bullets.length > 0) {
          sec.bullets.forEach((b) => {
            children.push(
              new Paragraph({
                text: `• ${b}`,
                spacing: { after: 60 },
              })
            );
          });
        }
      });

      // 3. Quantitative Data Tables / Exhibits
      if (pack.case.data_tables && pack.case.data_tables.length > 0) {
        pack.case.data_tables.forEach((table) => {
          children.push(
            new Paragraph({
              text: table.title,
              heading: HeadingLevel.HEADING_3,
              spacing: { before: 200, after: 100 },
            }),
            new Table({
              width: { size: 100, type: WidthType.PERCENTAGE },
              rows: [
                new TableRow({
                  children: table.columns.map(
                    (col) =>
                      new TableCell({
                        shading: { fill: "E5E7EB", type: ShadingType.CLEAR },
                        children: [
                          new Paragraph({
                            children: [new TextRun({ text: col, bold: true, size: 18 })],
                          }),
                        ],
                      })
                  ),
                }),
                ...table.rows.map(
                  (row) =>
                    new TableRow({
                      children: row.map(
                        (cell) =>
                          new TableCell({
                            children: [
                              new Paragraph({
                                children: [new TextRun({ text: String(cell), size: 18 })],
                              }),
                            ],
                          })
                      ),
                    })
                ),
              ],
            }),
            new Paragraph({ text: "", spacing: { after: 160 } })
          );
        });
      }

      // 4. Case Questions Section
      children.push(
        new Paragraph({
          text: "CASE ANALYSIS & DISCUSSION QUESTIONS",
          heading: HeadingLevel.HEADING_1,
          spacing: { before: 260, after: 160 },
        })
      );

      pack.questions.forEach((q, idx) => {
        children.push(
          new Paragraph({
            children: [
              new TextRun({
                text: `Question ${idx + 1} [${q.marks || 20} Marks] [Bloom: ${q.bloom_verb} - ${q.k_level || "K4"}]: `,
                bold: true,
              }),
              new TextRun({ text: q.text }),
            ],
            spacing: { before: 100, after: 60 },
          })
        );

        if (q.concepts && q.concepts.length > 0) {
          children.push(
            new Paragraph({
              children: [
                new TextRun({
                  text: `Tested Concepts: ${q.concepts.join(", ")}`,
                  italics: true,
                  size: 18,
                }),
              ],
              spacing: { after: 140 },
            })
          );
        }
      });

      // 5. Faculty / Admin Only: Model Answer Key (strictly excluded in student handout)
      if (!isStudentHandout && pack.answers && pack.answers.length > 0) {
        children.push(
          new Paragraph({
            pageBreakBefore: true,
            children: [
              new TextRun({
                text: "FACULTY CONFIDENTIAL — FOR EVALUATION ONLY",
                bold: true,
                color: "B91C1C",
                size: 22,
              }),
            ],
            spacing: { before: 200, after: 80 },
          }),
          new Paragraph({
            text: "Model Answer Key & Benchmark Solutions",
            heading: HeadingLevel.HEADING_1,
            spacing: { after: 180 },
          })
        );

        pack.answers.forEach((ans) => {
          const matchedQ = pack.questions.find((q) => q.id === ans.question_id);
          children.push(
            new Paragraph({
              text: `Model Answer for Question ${ans.question_id} (${matchedQ?.bloom_verb || "Analysis"})`,
              heading: HeadingLevel.HEADING_2,
              spacing: { before: 180, after: 100 },
            }),
            new Paragraph({
              children: [
                new TextRun({ text: "1. Framing & Introduction: ", bold: true }),
                new TextRun(ans.introduction),
              ],
              spacing: { after: 120 },
            })
          );

          // Sections
          ans.sections.forEach((sec) => {
            children.push(
              new Paragraph({
                text: sec.heading,
                heading: HeadingLevel.HEADING_3,
                spacing: { before: 120, after: 60 },
              })
            );

            if (sec.points && sec.points.length > 0) {
              sec.points.forEach((pt) => {
                children.push(
                  new Paragraph({
                    text: `• ${pt}`,
                    spacing: { after: 50 },
                  })
                );
              });
            }

            if (sec.evaluation && sec.evaluation.length > 0) {
              sec.evaluation.forEach((ev) => {
                children.push(
                  new Paragraph({
                    children: [
                      new TextRun({ text: "Evaluation: ", bold: true }),
                      new TextRun(ev),
                    ],
                    spacing: { after: 50 },
                  })
                );
              });
            }

            if (sec.limitation) {
              children.push(
                new Paragraph({
                  children: [
                    new TextRun({ text: "Limitation / Risk: ", bold: true }),
                    new TextRun(sec.limitation),
                  ],
                  spacing: { after: 80 },
                })
              );
            }
          });

          // Comparison Table
          if (ans.comparison_table) {
            children.push(
              new Paragraph({
                text: "Comparative Analysis Matrix",
                heading: HeadingLevel.HEADING_3,
                spacing: { before: 140, after: 80 },
              }),
              new Table({
                width: { size: 100, type: WidthType.PERCENTAGE },
                rows: [
                  new TableRow({
                    children: ans.comparison_table.columns.map(
                      (col) =>
                        new TableCell({
                          shading: { fill: "F3F4F6", type: ShadingType.CLEAR },
                          children: [
                            new Paragraph({
                              children: [new TextRun({ text: col, bold: true, size: 18 })],
                            }),
                          ],
                        })
                    ),
                  }),
                  ...ans.comparison_table.rows.map(
                    (row) =>
                      new TableRow({
                        children: row.map(
                          (cell, cIdx) =>
                            new TableCell({
                              children: [
                                new Paragraph({
                                  children: [
                                    new TextRun({
                                      text: String(cell),
                                      bold: cIdx === 0,
                                      size: 18,
                                    }),
                                  ],
                                }),
                              ],
                            })
                        ),
                      })
                  ),
                ],
              }),
              new Paragraph({ text: "", spacing: { after: 120 } })
            );
          }

          if (ans.overall_assessment) {
            children.push(
              new Paragraph({
                children: [
                  new TextRun({ text: "Overall Assessment: ", bold: true }),
                  new TextRun(ans.overall_assessment),
                ],
                spacing: { before: 100, after: 80 },
              })
            );
          }

          children.push(
            new Paragraph({
              children: [
                new TextRun({ text: "Conclusion: ", bold: true }),
                new TextRun(ans.conclusion),
              ],
              spacing: { after: 160 },
            })
          );
        });
      }

      // 6. Faculty Teaching Notes
      if (!isStudentHandout && pack.teaching_notes) {
        children.push(
          new Paragraph({
            pageBreakBefore: true,
            children: [
              new TextRun({
                text: "FACULTY INSTRUCTIONAL NOTES & PEDAGOGY",
                bold: true,
                size: 22,
              }),
            ],
            spacing: { before: 200, after: 100 },
          }),
          new Paragraph({
            children: [
              new TextRun({ text: "Case Synopsis: ", bold: true }),
              new TextRun(pack.teaching_notes.synopsis),
            ],
            spacing: { after: 120 },
          }),
          new Paragraph({
            text: "Learning Objectives:",
            heading: HeadingLevel.HEADING_3,
            spacing: { after: 60 },
          }),
          ...pack.teaching_notes.objectives.map(
            (obj) => new Paragraph({ text: `• ${obj}`, spacing: { after: 40 } })
          ),
          new Paragraph({
            children: [
              new TextRun({ text: "Teaching Approach & Roadmap: ", bold: true }),
              new TextRun(pack.teaching_notes.teaching_approach),
            ],
            spacing: { before: 100, after: 120 },
          })
        );

        if (pack.teaching_notes.marking_scheme && pack.teaching_notes.marking_scheme.length > 0) {
          children.push(
            new Paragraph({
              text: "Evaluation Marking Scheme",
              heading: HeadingLevel.HEADING_3,
              spacing: { before: 120, after: 60 },
            }),
            new Table({
              width: { size: 100, type: WidthType.PERCENTAGE },
              rows: [
                new TableRow({
                  children: [
                    new TableCell({
                      shading: { fill: "F3F4F6", type: ShadingType.CLEAR },
                      children: [new Paragraph({ children: [new TextRun({ text: "Criterion", bold: true })] })],
                    }),
                    new TableCell({
                      shading: { fill: "F3F4F6", type: ShadingType.CLEAR },
                      children: [new Paragraph({ children: [new TextRun({ text: "Marks", bold: true })] })],
                    }),
                  ],
                }),
                ...pack.teaching_notes.marking_scheme.map(
                  (m) =>
                    new TableRow({
                      children: [
                        new TableCell({ children: [new Paragraph(m.criterion)] }),
                        new TableCell({ children: [new Paragraph(String(m.marks))] }),
                      ],
                    })
                ),
              ],
            })
          );
        }
      }

      const doc = new Document({
        sections: [{ properties: {}, children }],
      });

      const buffer = await Packer.toBuffer(doc);
      const safeTitle = (pack.case.title || "CE_Case_Pack")
        .replace(/[^a-zA-Z0-9]/g, "_")
        .slice(0, 40);
      const filename = `${safeTitle}_${isStudentHandout ? "Student_Handout" : "Full_Pack"}.docx`;

      return new NextResponse(new Uint8Array(buffer), {
        headers: {
          "Content-Type":
            "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
          "Content-Disposition": `attachment; filename="${filename}"`,
        },
      });
    }

    // =========================================================================
    // BRANCH B: STANDARD CASE DOCX EXPORT (Existing Classic Flow)
    // =========================================================================
    const doc = new Document({
      sections: [
        {
          properties: {},
          children: [
            // Institutional Header
            new Paragraph({
              children: [
                new TextRun({
                  text: watermarkText.toUpperCase(),
                  size: 16,
                  color: "888888",
                  italics: true,
                }),
              ],
              alignment: AlignmentType.CENTER,
              spacing: { after: 120 },
            }),
            new Paragraph({
              text: COLLEGE_NAME.toUpperCase(),
              heading: HeadingLevel.HEADING_2,
              alignment: AlignmentType.CENTER,
              spacing: { after: 120 },
            }),
            new Paragraph({
              text: `Curricular Case Study Repository • ${COLLEGE_NAME_WITH_SHORT} AI Engine`,
              alignment: AlignmentType.CENTER,
              spacing: { after: 300 },
            }),

            // Case Title
            new Paragraph({
              text: caseStudy.title,
              heading: HeadingLevel.TITLE,
              alignment: AlignmentType.CENTER,
              spacing: { after: 300 },
            }),

            // Metadata summary table
            new Table({
              width: { size: 100, type: WidthType.PERCENTAGE },
              rows: [
                new TableRow({
                  children: [
                    new TableCell({
                      children: [
                        new Paragraph({
                          children: [
                            new TextRun({ text: "Scope: ", bold: true }),
                            new TextRun(caseStudy.type.toUpperCase() + " CASE"),
                          ],
                        }),
                      ],
                    }),
                    new TableCell({
                      children: [
                        new Paragraph({
                          children: [
                            new TextRun({ text: "Format: ", bold: true }),
                            new TextRun(caseStudy.format.replace("_", " ").toUpperCase()),
                          ],
                        }),
                      ],
                    }),
                    new TableCell({
                      children: [
                        new Paragraph({
                          children: [
                            new TextRun({ text: "Complexity: ", bold: true }),
                            new TextRun(`Level ${caseStudy.complexity} / 10`),
                          ],
                        }),
                      ],
                    }),
                  ],
                }),
                new TableRow({
                  children: [
                    new TableCell({
                      children: [
                        new Paragraph({
                          children: [
                            new TextRun({ text: "Industry: ", bold: true }),
                            new TextRun(caseStudy.industry),
                          ],
                        }),
                      ],
                    }),
                    new TableCell({
                      children: [
                        new Paragraph({
                          children: [
                            new TextRun({ text: "Function: ", bold: true }),
                            new TextRun(caseStudy.function),
                          ],
                        }),
                      ],
                    }),
                    new TableCell({
                      children: [
                        new Paragraph({
                          children: [
                            new TextRun({ text: "Status: ", bold: true }),
                            new TextRun(caseStudy.status.toUpperCase()),
                          ],
                        }),
                      ],
                    }),
                  ],
                }),
              ],
            }),

            new Paragraph({ text: "", spacing: { after: 300 } }),

            // Executive Summary
            new Paragraph({
              text: "Executive Summary",
              heading: HeadingLevel.HEADING_1,
              spacing: { before: 200, after: 120 },
            }),
            new Paragraph({
              children: [new TextRun({ text: content.summary, italics: true })],
              spacing: { after: 300 },
            }),

            // Background & Context
            new Paragraph({
              text: "Background & Institutional Context",
              heading: HeadingLevel.HEADING_1,
              spacing: { before: 200, after: 120 },
            }),
            new Paragraph({
              text: content.background,
              spacing: { after: 300 },
            }),

            // Operational Challenge
            new Paragraph({
              text: "Core Strategic Dilemma & Market Tension",
              heading: HeadingLevel.HEADING_1,
              spacing: { before: 200, after: 120 },
            }),
            new Paragraph({
              text: content.challenge,
              spacing: { after: 300 },
            }),

            // Decision Point
            new Paragraph({
              text: "The Strategic Decision Point",
              heading: HeadingLevel.HEADING_1,
              spacing: { before: 200, after: 120 },
            }),
            new Paragraph({
              children: [new TextRun({ text: content.decision_point, bold: true })],
              spacing: { after: 300 },
            }),

            // Discussion Questions
            new Paragraph({
              text: "Classroom Discussion Questions",
              heading: HeadingLevel.HEADING_1,
              spacing: { before: 200, after: 120 },
            }),
            ...(content.discussion_questions || []).map(
              (q: string, idx: number) =>
                new Paragraph({
                  children: [
                    new TextRun({ text: `Question ${idx + 1}: `, bold: true }),
                    new TextRun(q),
                  ],
                  spacing: { after: 120 },
                })
            ),
          ],
        },
      ],
    });

    const buffer = await Packer.toBuffer(doc);
    const safeTitle = caseStudy.title.replace(/[^a-zA-Z0-9]/g, "_").slice(0, 40);

    return new NextResponse(new Uint8Array(buffer), {
      headers: {
        "Content-Type":
          "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
        "Content-Disposition": `attachment; filename="${safeTitle}.docx"`,
      },
    });
  } catch (err: unknown) {
    console.error("DOCX generation error:", err);
    return NextResponse.json(
      { error: "Failed to generate DOCX document." },
      { status: 500 }
    );
  }
}
