import { NextRequest, NextResponse } from "next/server";
import { mockStore } from "@/lib/mock-db";
import { authenticateUser } from "@/lib/session";

export const dynamic = "force-dynamic";

export async function GET(req: NextRequest) {
  try {
    // Enforce faculty/admin authorization
    const auth = await authenticateUser(req, ["faculty", "admin"]);
    if (auth.errorResponse) return auth.errorResponse;

    const { searchParams } = new URL(req.url);
    const thresholdParam = searchParams.get("threshold");
    const targetThreshold = thresholdParam ? Number(thresholdParam) : 60;

    const attainment = mockStore.calculateCOPOAttainment(targetThreshold);

    // CSV Headers strictly formatted for NAAC & NBA Accreditation Criteria
    const headers = [
      "Course Code",
      "Course Name",
      "Outcome Code",
      "Type",
      "Description",
      "Target Threshold (%)",
      "Evaluated Students",
      "Students Meeting Target",
      "Attainment (%)",
      "Status",
      "Average Score (%)",
    ];

    const escapeCsv = (val: string | number | undefined | null) => {
      if (val === null || val === undefined) return '""';
      const str = String(val).replace(/"/g, '""');
      return `"${str}"`;
    };

    const rows = attainment.map((row) => [
      escapeCsv(row.course_code),
      escapeCsv(row.course_name),
      escapeCsv(row.code),
      escapeCsv(row.type),
      escapeCsv(row.description),
      escapeCsv(row.target_threshold),
      escapeCsv(row.total_students_evaluated),
      escapeCsv(row.students_meeting_target),
      escapeCsv(row.attainment_percentage),
      escapeCsv(row.status),
      escapeCsv(row.average_score_percentage),
    ]);

    // Prepend UTF-8 BOM (\uFEFF) for immediate native Microsoft Excel compatibility
    const csvContent =
      "\uFEFF" +
      headers.map((h) => `"${h}"`).join(",") +
      "\n" +
      rows.map((r) => r.join(",")).join("\n");

    const dateStr = new Date().toISOString().split("T")[0];
    const filename = `SBS-CaseLab-NAAC-NBA-CO-PO-Report-${dateStr}.csv`;

    return new NextResponse(csvContent, {
      status: 200,
      headers: {
        "Content-Type": "text/csv; charset=utf-8",
        "Content-Disposition": `attachment; filename="${filename}"`,
        "Cache-Control": "no-store",
      },
    });
  } catch (error) {
    console.error("OBE CSV Export Error:", error);
    return NextResponse.json(
      { error: "Failed to generate OBE accreditation export." },
      { status: 500 }
    );
  }
}
