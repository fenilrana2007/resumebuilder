import { NextResponse } from "next/server";
import mammoth from "mammoth";

export const maxDuration = 60;

export async function POST(request: Request) {
  try {
    const formData = await request.formData();
    const file = formData.get("file") as File | null;

    if (!file) {
      return NextResponse.json({ error: "No file provided" }, { status: 400 });
    }

    const bytes = await file.arrayBuffer();
    const buffer = Buffer.from(bytes);
    
    let text = "";

    if (file.name.endsWith(".pdf")) {
      const { PDFParse } = require("pdf-parse");
      const parser = new PDFParse({ data: buffer });
      const textResult = await parser.getText();
      text = textResult.text;
    } else if (file.name.endsWith(".docx")) {
      const result = await mammoth.extractRawText({ buffer });
      text = result.value;
    } else if (file.name.endsWith(".txt")) {
      text = buffer.toString("utf-8");
    } else {
      return NextResponse.json({ error: "Unsupported file type" }, { status: 400 });
    }

    return NextResponse.json({ text: text.trim() });
  } catch (err) {
    console.error("File parsing error", err);
    return NextResponse.json(
      { error: err instanceof Error ? err.message : "Failed to extract text from file." },
      { status: 500 }
    );
  }
}
