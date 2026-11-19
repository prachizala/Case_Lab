import { NextResponse } from "next/server";
import { mockStore } from "@/lib/mock-db";

export async function GET() {
  try {
    const departments = mockStore.getDepartments();
    const courses = mockStore.getCourses();
    const batches = mockStore.getBatches().filter((b) => b.is_active);
    const facultyTypes = mockStore.getFacultyTypes().filter((f) => f.is_active);
    const categories = mockStore.getCaseCategories().filter((c) => c.is_active);
    const caseTypes = mockStore.getCaseTypes().filter((t) => t.is_active);

    return NextResponse.json({
      success: true,
      data: {
        departments,
        courses,
        batches,
        facultyTypes,
        categories,
        caseTypes,
      },
    });
  } catch (error) {
    console.error("Lookup fetch error:", error);
    return NextResponse.json(
      { error: "Failed to retrieve institutional academic lists." },
      { status: 500 }
    );
  }
}
