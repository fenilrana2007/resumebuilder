import { NextResponse } from "next/server";
import mammoth from "mammoth";
import { PDFParse } from "pdf-parse";

export const maxDuration = 60;

export async function POST(request: Request) {
  try {
    const formData = await request.formData();
    const file = formData.get("file") as File | null;

    if (!file) {
      return NextResponse.json({ error: "No file provided" }, { status: 400 });
    }

    const bytes = await file.arrayBuffer();
    const uint8 = new Uint8Array(bytes);

    let text = "";

    if (file.name.endsWith(".pdf")) {
      // pdf-parse v2.x: PDFParse class, pass data as Uint8Array
      const parser = new PDFParse({ data: uint8 });
      const textResult = await parser.getText();
      text = textResult.text;
    } else if (file.name.endsWith(".docx")) {
      const buffer = Buffer.from(bytes);
      const result = await mammoth.extractRawText({ buffer });
      text = result.value;
    } else if (file.name.endsWith(".txt")) {
      text = new TextDecoder("utf-8").decode(uint8);
    } else {
      return NextResponse.json({ error: "Unsupported file type" }, { status: 400 });
    }

    if (!text || !text.trim()) {
      return NextResponse.json(
        { error: "Could not extract any text from the file. The file may be empty, image-based, or password-protected." },
        { status: 422 }
      );
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

