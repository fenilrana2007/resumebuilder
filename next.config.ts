import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  serverExternalPackages: ["pdfkit", "pdf-parse", "mammoth", "pdfjs-dist"],
  outputFileTracingIncludes: {
    "/api/parse": ["./node_modules/pdf-parse/lib/pdf.js/**/*"],
  },
};

export default nextConfig;
