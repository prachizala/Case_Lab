import { NextRequest, NextResponse } from "next/server";
import { mockStore } from "@/lib/mock-db";
import { COLLEGE_NAME, COLLEGE_NAME_WITH_SHORT } from "@/config/college";
import { THEME_TOKENS } from "@/config/theme";
import { authenticateUser } from "@/lib/session";
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
  BorderStyle,
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

    // Students can only export approved cases
    if (user.role === "student" && caseStudy.status !== "approved") {
      return NextResponse.json(
        { error: "Forbidden. Students may only export approved curriculum cases." },
        { status: 403 }
      );
    }

    const content = caseStudy.content;

    // Construct DOCX document
    const doc = new Document({
      sections: [
        {
          properties: {},
          children: [
            // Institutional Header
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
                            new TextRun({ text: "Language: ", bold: true }),
                            new TextRun(caseStudy.language.toUpperCase()),
                          ],
                        }),
                      ],
                    }),
                  ],
                }),
              ],
            }),

            new Paragraph({ text: "", spacing: { after: 300 } }),

            // Real Signal Alert if applicable
            ...(caseStudy.format === "real_signal" || content.verify_facts_flag
              ? [
                  new Paragraph({
                    children: [
                      new TextRun({
                        text: "⚠️ VERIFY FACTS BEFORE CLASS PROTOCOL: This teaching case is grounded in observable industry & macro signals. Faculty are instructed to cross-verify recent regulatory updates and corporate quarterly filings prior to classroom facilitation.",
                        bold: true,
                      }),
                    ],
                    spacing: { after: 300 },
                  }),
                ]
              : []),

            // Executive Summary
            new Paragraph({
              text: "Executive Summary",
              heading: HeadingLevel.HEADING_1,
              spacing: { before: 200, after: 120 },
            }),
            new Paragraph({
              children: [
                new TextRun({ text: content.summary, italics: true }),
              ],
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

            // Key Data Table Exhibit
            new Paragraph({
              text: "Exhibit 1: Quantitative Indicators & Operating Metrics",
              heading: HeadingLevel.HEADING_1,
              spacing: { before: 200, after: 120 },
            }),
            new Table({
              width: { size: 100, type: WidthType.PERCENTAGE },
              rows: [
                // Header Row
                new TableRow({
                  children: [
                    new TableCell({
                      shading: { fill: THEME_TOKENS.light.primary.replace("#", ""), type: ShadingType.CLEAR },
                      children: [
                        new Paragraph({
                          children: [
                            new TextRun({ text: "Financial / Operating Metric", bold: true, color: THEME_TOKENS.light.accentText.replace("#", "") }),
                          ],
                        }),
                      ],
                    }),
                    new TableCell({
                      shading: { fill: THEME_TOKENS.light.primary.replace("#", ""), type: ShadingType.CLEAR },
                      children: [
                        new Paragraph({
                          children: [
                            new TextRun({ text: "Value", bold: true, color: THEME_TOKENS.light.accentText.replace("#", "") }),
                          ],
                        }),
                      ],
                    }),
                    new TableCell({
                      shading: { fill: THEME_TOKENS.light.primary.replace("#", ""), type: ShadingType.CLEAR },
                      children: [
                        new Paragraph({
                          children: [
                            new TextRun({ text: "Period", bold: true, color: THEME_TOKENS.light.accentText.replace("#", "") }),
                          ],
                        }),
                      ],
                    }),
                    new TableCell({
                      shading: { fill: THEME_TOKENS.light.primary.replace("#", ""), type: ShadingType.CLEAR },
                      children: [
                        new Paragraph({
                          children: [
                            new TextRun({ text: "Pedagogical Notes", bold: true, color: THEME_TOKENS.light.accentText.replace("#", "") }),
                          ],
                        }),
                      ],
                    }),
                  ],
                }),
                // Data Rows
                ...content.key_data.map(
                  (row) =>
                    new TableRow({
                      children: [
                        new TableCell({
                          children: [new Paragraph(row.metric)],
                        }),
                        new TableCell({
                          children: [new Paragraph(row.value)],
                        }),
                        new TableCell({
                          children: [new Paragraph(row.period || "—")],
                        }),
                        new TableCell({
                          children: [new Paragraph(row.notes || "illustrative")],
                        }),
                      ],
                    })
                ),
              ],
            }),

            new Paragraph({
              children: [
                new TextRun({
                  text: content.figures_disclaimer || "All figures are illustrative pedagogical models for classroom analysis.",
                  italics: true,
                }),
              ],
              spacing: { before: 100, after: 300 },
            }),

            // Decision Point
            new Paragraph({
              text: "The Strategic Decision Point",
              heading: HeadingLevel.HEADING_1,
              spacing: { before: 200, after: 120 },
            }),
            new Paragraph({
              children: [
                new TextRun({ text: content.decision_point, bold: true }),
              ],
              spacing: { after: 300 },
            }),

            // Discussion Questions
            new Paragraph({
              text: "Classroom Discussion Questions",
              heading: HeadingLevel.HEADING_1,
              spacing: { before: 200, after: 120 },
            }),
            ...content.discussion_questions.map(
              (q, idx) =>
                new Paragraph({
                  children: [
                    new TextRun({ text: `Question ${idx + 1}: `, bold: true }),
                    new TextRun(q),
                  ],
                  spacing: { after: 120 },
                })
            ),

            // Teaching Note
            ...(content.teaching_note
              ? [
                  new Paragraph({
                    text: "Facilitator Teaching Note (Confidential to Instructors)",
                    heading: HeadingLevel.HEADING_1,
                    spacing: { before: 300, after: 120 },
                  }),
                  new Paragraph({
                    children: [
                      new TextRun({ text: "Pedagogical Learning Objectives:", bold: true }),
                    ],
                  }),
                  ...content.teaching_note.objectives.map(
                    (obj) => new Paragraph({ text: `• ${obj}`, spacing: { after: 60 } })
                  ),

                  new Paragraph({
                    children: [
                      new TextRun({ text: "Applied Theoretical Frameworks:", bold: true }),
                    ],
                    spacing: { before: 150, after: 80 },
                  }),
                  ...content.teaching_note.frameworks.map(
                    (fw) =>
                      new Paragraph({
                        children: [
                          new TextRun({ text: `${fw.name}: `, bold: true }),
                          new TextRun(`Application: ${fw.application} | Key Takeaway: ${fw.key_takeaway}`),
                        ],
                        spacing: { after: 100 },
                      })
                  ),
                ]
              : []),
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
