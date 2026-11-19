import { NextRequest, NextResponse } from "next/server";
import { authenticateUser } from "@/lib/session";
import { mockStore } from "@/lib/mock-db";

export async function GET(req: NextRequest) {
  const auth = await authenticateUser(req, ["admin"]);
  if (auth.errorResponse || !auth.user) {
    return (
      auth.errorResponse ||
      NextResponse.json({ error: "Unauthorized. Admin privileges required." }, { status: 403 })
    );
  }

  return NextResponse.json({
    success: true,
    data: {
      departments: mockStore.getDepartments(),
      courses: mockStore.getCourses(),
      batches: mockStore.getBatches(),
      facultyTypes: mockStore.getFacultyTypes(),
      categories: mockStore.getCaseCategories(),
    },
  });
}

export async function POST(req: NextRequest) {
  const auth = await authenticateUser(req, ["admin"]);
  if (auth.errorResponse || !auth.user) {
    return (
      auth.errorResponse ||
      NextResponse.json({ error: "Unauthorized. Admin privileges required." }, { status: 403 })
    );
  }

  try {
    const body = await req.json();
    const { listType, action, id, data } = body;

    if (!listType || !action) {
      return NextResponse.json(
        { error: "listType and action ('create' | 'update' | 'toggle_active') are required." },
        { status: 400 }
      );
    }

    const admin = auth.user;
    let result: any = null;

    if (listType === "department") {
      if (action === "create") {
        result = mockStore.addDepartment(data);
      } else if (action === "update" && id) {
        result = mockStore.updateDepartment(id, data);
      }
    } else if (listType === "course") {
      if (action === "create") {
        result = mockStore.addCourse(data);
      } else if (action === "update" && id) {
        result = mockStore.updateCourse(id, data);
      }
    } else if (listType === "batch") {
      if (action === "create") {
        result = mockStore.addBatch(data);
      } else if (action === "update" && id) {
        result = mockStore.updateBatch(id, data);
      } else if (action === "toggle_active" && id) {
        const batch = mockStore.getBatches().find((b) => b.id === id);
        if (batch) {
          result = mockStore.updateBatch(id, { is_active: !batch.is_active });
        }
      }
    } else if (listType === "faculty_type") {
      if (action === "create") {
        result = mockStore.addFacultyType(data);
      } else if (action === "update" && id) {
        result = mockStore.updateFacultyType(id, data);
      } else if (action === "toggle_active" && id) {
        const ft = mockStore.getFacultyTypes().find((f) => f.id === id);
        if (ft) {
          result = mockStore.updateFacultyType(id, { is_active: !ft.is_active });
        }
      }
    } else if (listType === "category") {
      if (action === "create") {
        result = mockStore.addCaseCategory(data);
      } else if (action === "update" && id) {
        result = mockStore.updateCaseCategory(id, data);
      } else if (action === "toggle_active" && id) {
        const cat = mockStore.getCaseCategories().find((c) => c.id === id);
        if (cat) {
          result = mockStore.updateCaseCategory(id, { is_active: !cat.is_active });
        }
      }
    } else {
      return NextResponse.json({ error: "Invalid listType specified." }, { status: 400 });
    }

    if (!result) {
      return NextResponse.json({ error: "Item not found or action failed." }, { status: 404 });
    }

    mockStore.logAudit(
      admin.id,
      admin.email,
      "academic_list_modified",
      id || result.id,
      "academic_list",
      { action, listType, data }
    );

    return NextResponse.json({
      success: true,
      message: `${listType} ${action} completed successfully.`,
      result,
    });
  } catch (error) {
    console.error("Academic lists mutation error:", error);
    return NextResponse.json(
      { error: "Failed to update academic lists." },
      { status: 500 }
    );
  }
}
