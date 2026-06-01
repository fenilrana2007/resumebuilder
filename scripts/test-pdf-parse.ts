import fs from "fs";
import path from "path";

async function main() {
  try {
    const { PDFParse } = require("pdf-parse");
    const filePath = path.join(process.cwd(), "1779188388486-019e3fe4-5286-7000-b425-4df52f78e428-Prompt-Surgeon-PDF.pdf");
    const buffer = fs.readFileSync(filePath);
    console.log("Reading PDF file size:", buffer.length);
    
    // Ingest the binary buffer inside the constructor options under 'data'
    const parser = new PDFParse({ data: buffer });
    const textResult = await parser.getText();
    
    console.log("Success! Parsed text length:", textResult.text.length);
    console.log("First 300 characters:\n", textResult.text.slice(0, 300));
  } catch (err) {
    console.error("Crash error:", err);
  }
}

void main();
