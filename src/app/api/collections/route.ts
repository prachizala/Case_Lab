import { NextRequest, NextResponse } from "next/server";
import { mockStore } from "@/lib/mock-db";
import { authenticateUser } from "@/lib/session";

export async function GET(req: NextRequest) {
  const { user, errorResponse } = await authenticateUser(req);
  if (errorResponse || !user) {
    return errorResponse || NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const collections = mockStore.getCollections(user.id);
  return NextResponse.json({ collections });
}

export async function POST(req: NextRequest) {
  try {
    const { user, errorResponse } = await authenticateUser(req);
    if (errorResponse || !user) {
      return errorResponse || NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await req.json().catch(() => ({}));
    const { action, name, description, collectionId, caseId } = body;
    const userId = user.id;

    if (action === "create") {
      if (!name || !name.trim()) {
        return NextResponse.json({ error: "Collection name is required." }, { status: 400 });
      }
      const newCol = mockStore.createCollection(userId, name.trim(), description?.trim());
      return NextResponse.json({ success: true, collection: newCol });
    }

    if (action === "rename") {
      if (!collectionId || !name || !name.trim()) {
        return NextResponse.json({ error: "Collection ID and new name are required." }, { status: 400 });
      }
      const updated = mockStore.renameCollection(collectionId, name.trim());
      if (!updated) {
        return NextResponse.json({ error: "Collection not found." }, { status: 404 });
      }
      return NextResponse.json({ success: true, collection: updated });
    }

    if (action === "delete") {
      if (!collectionId) {
        return NextResponse.json({ error: "Collection ID is required." }, { status: 400 });
      }
      const deleted = mockStore.deleteCollection(collectionId);
      return NextResponse.json({ success: deleted });
    }

    if (action === "toggle-case") {
      if (!collectionId || !caseId) {
        return NextResponse.json({ error: "Collection ID and Case ID are required." }, { status: 400 });
      }
      const updated = mockStore.toggleCaseInCollection(collectionId, caseId);
      if (!updated) {
        return NextResponse.json({ error: "Collection not found." }, { status: 404 });
      }
      return NextResponse.json({ success: true, collection: updated });
    }

    return NextResponse.json({ error: "Invalid collection action." }, { status: 400 });
  } catch (err: unknown) {
    console.error("Collections API error:", err);
    return NextResponse.json({ error: "Failed to process collection request." }, { status: 500 });
  }
}
