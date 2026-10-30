import { NextRequest, NextResponse } from "next/server";
import mammoth from "mammoth";
import pdfParse from "pdf-parse";
import { authenticateUser } from "@/lib/session";

export async function POST(req: NextRequest) {
  try {
    const { user, errorResponse } = await authenticateUser(req, ["faculty", "admin"]);
    if (errorResponse || !user) {
      return errorResponse || NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const formData = await req.formData();
    const file = formData.get("file") as File | null;

    if (!file) {
      return NextResponse.json(
        { error: "No file provided. Please select a PDF, DOCX, or TXT file." },
        { status: 400 }
      );
    }

    const filename = file.name.toLowerCase();
    const arrayBuffer = await file.arrayBuffer();
    const buffer = Buffer.from(arrayBuffer);

    let extractedText = "";

    if (filename.endsWith(".pdf")) {
      const pdfData = await pdfParse(buffer);
      extractedText = pdfData.text || "";
    } else if (filename.endsWith(".docx")) {
      const result = await mammoth.extractRawText({ buffer });
      extractedText = result.value || "";
    } else if (filename.endsWith(".txt")) {
      extractedText = buffer.toString("utf-8");
    } else {
      return NextResponse.json(
        {
          error:
            "Unsupported file type. Please upload a .pdf, .docx, or .txt document.",
        },
        { status: 400 }
      );
    }

    // Clean up whitespace
    extractedText = extractedText
      .replace(/\r\n/g, "\n")
      .replace(/\n{3,}/g, "\n\n")
      .trim();

    return NextResponse.json({
      success: true,
      filename: file.name,
      sizeBytes: buffer.length,
      extractedText,
      wordCount: extractedText.split(/\s+/).filter(Boolean).length,
    });
  } catch (error: unknown) {
    console.error("Text extraction failed:", error);
    const message =
      error instanceof Error ? error.message : "Failed to extract text from file.";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
