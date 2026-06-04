import { NextResponse } from "next/server";
import mammoth from "mammoth";
// @ts-expect-error - pdf-parse/lib/pdf-parse.js does not have type definitions in @types/pdf-parse
import pdf from "pdf-parse/lib/pdf-parse.js";

export const maxDuration = 60;

async function extractPdfText(data: Uint8Array): Promise<string> {
  const buffer = Buffer.from(data);
  const parsed = await pdf(buffer);
  return parsed.text;
}

export async function POST(request: Request) {
  try {
    const formData = await request.formData();
    const file = formData.get("file") as File | null;

    if (!file) {
      return NextResponse.json({ error: "No file provided" }, { status: 400 });
    }

    const bytes = await file.arrayBuffer();
    let text = "";

    if (file.name.toLowerCase().endsWith(".pdf")) {
      const uint8 = new Uint8Array(bytes);
      text = await extractPdfText(uint8);
    } else if (file.name.toLowerCase().endsWith(".docx")) {
      const buffer = Buffer.from(bytes);
      const result = await mammoth.extractRawText({ buffer });
      text = result.value;
    } else if (file.name.toLowerCase().endsWith(".txt")) {
      text = new TextDecoder("utf-8").decode(new Uint8Array(bytes));
    } else {
      return NextResponse.json({ error: "Unsupported file type. Please upload a .pdf, .docx, or .txt file." }, { status: 400 });
    }

    if (!text || !text.trim()) {
      return NextResponse.json(
        { error: "Could not extract any text from the file. The file may be empty, image-based (scanned), or password-protected." },
        { status: 422 }
      );
    }

    return NextResponse.json({ text: text.trim() });
  } catch (err) {
    console.error("File parsing error:", err);
    return NextResponse.json(
      { error: "Failed to extract text from file. Please try a different format or paste your resume text directly." },
      { status: 500 }
    );
  }
}

